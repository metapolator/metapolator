//! UFO import: port of Atem-MOM `import/UFOImporter.es6.js` and
//! `import/ufo/{ImportOutlinePen,SegmentPen,SegmentPoint,StrokeContour,
//! contourFromContour,tools}.js` (plus the Atem-Pen-Case pen plumbing they use).
//!
//! Outlines are read point by point, converted to segments and then either
//! inferred as a skeleton (`penstroke`: a centerline with left/right points)
//! or kept as a plain `contour`. All computed values are stored as CPS
//! property strings formatted exactly like the JS (`'Vector ' + x + ' ' + y`).

use crate::js::{Json, JsonMap};
use crate::tree::{Kind, Mom};
use mp_cps::{CpsError, NodeId, Property, PropertyDict, Result};
use mp_math::{hobby, js_num, Vector};
use mp_ufo::reader::{GlyphSet, ReadPen, UfoReader};
use std::collections::HashSet;

fn imp_err(m: impl Into<String>) -> CpsError { CpsError::cps(m) }

/// `SegmentPoint`: a Vector with a name and kwargs (identifier)
#[derive(Clone, Debug, PartialEq)]
pub struct SPoint {
    pub v: Vector,
    pub name: Option<String>,
    pub identifier: Option<String>,
}

impl SPoint {
    fn plain(v: Vector) -> SPoint { SPoint { v, name: None, identifier: None } }
}

#[derive(Clone, Debug)]
enum Cmd {
    MoveTo(SPoint),
    LineTo(SPoint),
    /// a curve (`wasLine` is not tracked: nothing reads it)
    CurveTo([SPoint; 3]),
}

impl Cmd {
    fn last(&self) -> &SPoint {
        match self { Cmd::MoveTo(p) | Cmd::LineTo(p) => p, Cmd::CurveTo(p) => &p[2] }
    }
    /// JS array length of the command (`['curveTo', p1, p2, p3]` = 4)
    fn len(&self) -> usize { match self { Cmd::CurveTo(..) => 4, _ => 2 } }
}

#[derive(Clone, Debug)]
enum OutlineItem {
    Contour { commands: Vec<Cmd>, closed: bool, identifier: Option<String> },
    Component { glyph_name: String, transformation: [f64; 6] },
}

// ------------------------------------------------------------- the pens

/// `SegmentPen` + `BasePen`
#[derive(Default)]
struct SegmentPen {
    current: Option<(Vec<Cmd>, Option<String>)>,
    current_point: Option<SPoint>,
    contours: Vec<OutlineItem>,
}

impl SegmentPen {
    fn move_to(&mut self, p: SPoint, identifier: Option<String>) {
        self.current = Some((vec![Cmd::MoveTo(p.clone())], identifier));
        self.current_point = Some(p);
    }
    fn line_to(&mut self, p: SPoint) {
        if let Some(c) = self.current.as_mut() { c.0.push(Cmd::LineTo(p.clone())); }
        self.current_point = Some(p);
    }
    fn curve_to_one(&mut self, a: SPoint, b: SPoint, c: SPoint) {
        if let Some(cur) = self.current.as_mut() { cur.0.push(Cmd::CurveTo([a, b, c.clone()])); }
    }
    /// `BasePen.curveTo(*points)`
    fn curve_to(&mut self, points: Vec<SPoint>) {
        let n = points.len() as isize - 1;
        if n == 2 {
            let mut it = points.into_iter();
            let (a, b, c) = (it.next().unwrap(), it.next().unwrap(), it.next().unwrap());
            self.curve_to_one(a, b, c.clone());
            self.current_point = Some(c);
        } else if n > 2 {
            for seg in decompose_super_bezier(&points) {
                let c = seg[2].clone();
                let [a, b, cc] = seg;
                self.curve_to_one(a, b, cc);
                self.current_point = Some(c);
            }
        } else if n == 1 {
            self.q_curve_to(points.into_iter().map(Some).collect());
        } else if n == 0 {
            self.line_to(points.into_iter().next().unwrap());
        }
    }
    /// `BasePen.qCurveTo(*points)`; `None` is the implied-start marker
    fn q_curve_to(&mut self, mut points: Vec<Option<SPoint>>) {
        let n = points.len() as isize - 1;
        if points.last().map(|p| p.is_none()).unwrap_or(false) {
            let last_off = points[points.len() - 2].clone().unwrap();
            let first = points[0].clone().unwrap();
            let implied = SPoint::plain(Vector::new(0.5 * (last_off.v.x + first.v.x), 0.5 * (last_off.v.y + first.v.y)));
            self.current_point = Some(implied.clone());
            // `_moveTo(impliedStartPoint)` without kwargs
            self.current = Some((vec![Cmd::MoveTo(implied.clone())], None));
            let l = points.len();
            points[l - 1] = Some(implied);
        }
        let points: Vec<SPoint> = points.into_iter().map(|p| p.unwrap()).collect();
        if n > 0 {
            for (p1, p2) in decompose_quadratic(&points) {
                self.q_curve_to_one(p1, p2.clone());
                self.current_point = Some(p2);
            }
        } else {
            self.line_to(points.into_iter().next().unwrap());
        }
    }
    /// `BasePen._qCurveToOne`
    fn q_curve_to_one(&mut self, pt1: SPoint, pt2: SPoint) {
        let p0 = self.current_point.clone().map(|p| p.v).unwrap_or(Vector::ZERO);
        let k = 0.66666666666666667;
        let mid1 = Vector::new(p0.x + k * (pt1.v.x - p0.x), p0.y + k * (pt1.v.y - p0.y));
        let mid2 = Vector::new(pt2.v.x + k * (pt1.v.x - pt2.v.x), pt2.v.y + k * (pt1.v.y - pt2.v.y));
        self.curve_to_one(SPoint::plain(mid1), SPoint::plain(mid2), pt2);
    }
    fn finish(&mut self, closed: bool) {
        if let Some((commands, identifier)) = self.current.take() {
            self.contours.push(OutlineItem::Contour { commands, closed, identifier });
        }
        self.current_point = None;
    }
}

fn decompose_super_bezier(points: &[SPoint]) -> Vec<[SPoint; 3]> {
    let n = points.len() - 1;
    let mut out = vec![];
    let mut pt1 = points[0].clone();
    let mut pt2: Option<Vector> = None;
    for i in 2..=n {
        let n_div = i.min(3).min(n - i + 2);
        for j in 1..n_div {
            let factor = j as f64 / n_div as f64;
            let t1 = points[i - 1].v;
            let t2 = points[i - 2].v;
            let temp = Vector::new(t2.x + factor * (t1.x - t2.x), t2.y + factor * (t1.y - t2.y));
            match pt2 {
                None => pt2 = Some(temp),
                Some(p2) => {
                    let pt3 = Vector::new(0.5 * (p2.x + temp.x), 0.5 * (p2.y + temp.y));
                    out.push([pt1.clone(), SPoint::plain(p2), SPoint::plain(pt3)]);
                    pt1 = SPoint::plain(temp);
                    pt2 = None;
                }
            }
        }
    }
    out.push([pt1, points[points.len() - 2].clone(), points[points.len() - 1].clone()]);
    out
}

fn decompose_quadratic(points: &[SPoint]) -> Vec<(SPoint, SPoint)> {
    let n = points.len() - 1;
    let mut out = vec![];
    for i in 0..n.saturating_sub(1) {
        let (a, b) = (points[i].v, points[i + 1].v);
        out.push((points[i].clone(), SPoint::plain(Vector::new(0.5 * (a.x + b.x), 0.5 * (a.y + b.y)))));
    }
    out.push((points[points.len() - 2].clone(), points[points.len() - 1].clone()));
    out
}

#[derive(Clone)]
struct RawPoint {
    pt: Option<Vector>,
    segment_type: Option<String>,
    name: Option<String>,
    identifier: Option<String>,
}

/// `ImportOutlinePen` (BasePointToSegmentPen + `_flushContour`) feeding a SegmentPen
#[derive(Default)]
struct ImportOutlinePen {
    path: Option<(Vec<RawPoint>, Option<String>)>,
    pen: SegmentPen,
    /// a JS exception thrown while drawing (aborts the whole import)
    error: Option<String>,
}

impl ImportOutlinePen {
    fn flush_contour(&mut self, mut segments: Vec<(String, Vec<RawPoint>)>, contour_id: Option<String>) {
        let closed;
        let move_pt: Option<SPoint>;
        if segments[0].0 == "move" {
            closed = false;
            let p = &segments[0].1[0];
            // upstream bug kept: `movePt = [0]`, i.e. the open contour's
            // first point becomes <Vector 0, 0>
            move_pt = Some(SPoint { v: Vector::new(0.0, 0.0), name: p.name.clone(), identifier: p.identifier.clone() });
            segments.remove(0);
        } else {
            closed = true;
            let p = segments.last().unwrap().1.last().unwrap();
            move_pt = p.pt.map(|v| SPoint { v, name: p.name.clone(), identifier: p.identifier.clone() });
        }
        if let Some(mp) = move_pt {
            self.pen.move_to(mp, contour_id);
        }
        for (ty, pts) in segments {
            let points: Vec<SPoint> = pts.iter().map(|p| SPoint {
                v: p.pt.unwrap_or(Vector::ZERO), name: p.name.clone(), identifier: p.identifier.clone() }).collect();
            match ty.as_str() {
                // outputImpliedClosingLine = true: always draw the line
                "line" => self.pen.line_to(points.into_iter().next().unwrap()),
                "curve" => self.pen.curve_to(points),
                "qcurve" => {
                    if pts.iter().any(|p| p.pt.is_none()) || self.pen.current_point.is_none() {
                        // JS: an all-offcurve contour issues no moveTo, then
                        // _qCurveToOne reads `null[0]` -> TypeError
                        self.error = Some("TypeError: all-offcurve contours can't be imported".into());
                        return;
                    }
                    let p: Vec<Option<SPoint>> = pts.iter().map(|p| p.pt.map(|v| SPoint {
                        v, name: p.name.clone(), identifier: p.identifier.clone() })).collect();
                    self.pen.q_curve_to(p);
                }
                _ => {}
            }
        }
        self.pen.finish(closed);
    }
}

impl ReadPen for ImportOutlinePen {
    fn begin_path(&mut self, identifier: Option<String>) {
        self.path = Some((vec![], identifier));
    }
    fn add_point(&mut self, pt: [f64; 2], segment_type: Option<String>, _smooth: bool, name: Option<String>, identifier: Option<String>) {
        if let Some(p) = self.path.as_mut() {
            p.0.push(RawPoint { pt: Some(Vector::new(pt[0], pt[1])), segment_type, name, identifier });
        }
    }
    fn end_path(&mut self) {
        let Some((mut points, contour_id)) = self.path.take() else { return };
        if points.is_empty() { return; }
        if points.len() == 1 {
            let p = points.remove(0);
            self.flush_contour(vec![("move".into(), vec![p])], contour_id);
            return;
        }
        let mut segments: Vec<(String, Vec<RawPoint>)> = vec![];
        if points[0].segment_type.as_deref() == Some("move") {
            let p = points.remove(0);
            segments.push(("move".into(), vec![p]));
        } else {
            match points.iter().position(|p| p.segment_type.is_some()) {
                None => points.push(RawPoint { pt: None, segment_type: Some("qcurve".into()), name: None, identifier: None }),
                Some(first) => {
                    let head: Vec<RawPoint> = points.drain(0..=first).collect();
                    points.extend(head);
                }
            }
        }
        let mut current = vec![];
        for p in points {
            let st = p.segment_type.clone();
            current.push(p);
            if let Some(t) = st {
                segments.push((t, std::mem::take(&mut current)));
            }
        }
        self.flush_contour(segments, contour_id);
    }
    fn add_component(&mut self, base: &str, transformation: [f64; 6], _identifier: Option<String>) {
        self.pen.contours.push(OutlineItem::Component { glyph_name: base.to_string(), transformation });
    }
}

// ------------------------------------------------------------- tools.js

/// `line2curve(p0, p3)`
fn line2curve(p0: &SPoint, p3: &SPoint) -> Cmd {
    let distance = (p3.v - p0.v) * 0.33333;
    Cmd::CurveTo([SPoint::plain(p0.v + distance), SPoint::plain(p3.v - distance), p3.clone()])
}

fn get_center(l: Vector, r: Vector) -> Vector { (l + r) * 0.5 }

fn name_set(s: Option<&str>) -> Vec<String> {
    let mut out: Vec<String> = vec![];
    for w in s.unwrap_or("").split_whitespace() {
        if !out.iter().any(|x| x == w) { out.push(w.to_string()); }
    }
    out
}

/// `mergeNames(left, right)`
fn merge_names(left: Option<&str>, right: Option<&str>) -> Option<String> {
    let l = name_set(left);
    let mut r = name_set(right);
    let mut merged: Vec<String> = vec![];
    for k in &l {
        if let Some(pos) = r.iter().position(|x| x == k) {
            merged.push(k.clone());
            r.remove(pos);
        } else {
            merged.push(format!("left-{k}"));
        }
    }
    for k in r { merged.push(format!("right-{k}")); }
    let s = merged.join(" ");
    if s.is_empty() { None } else { Some(s) }
}

fn center_point(l: &SPoint, r: &SPoint) -> SPoint {
    SPoint { v: get_center(l.v, r.v), name: merge_names(l.name.as_deref(), r.name.as_deref()), identifier: None }
}

/// A point of the inferred stroke (`{in, on, out}` + polar data)
#[derive(Clone, Debug)]
struct MPoint {
    in_: SPoint,
    on: SPoint,
    out: SPoint,
    in_length: f64,
    out_length: f64,
    in_dir: f64,
    out_dir: f64,
    in_tension: f64,
    out_tension: f64,
}

impl MPoint {
    fn new(in_: SPoint, on: SPoint, out: SPoint) -> Self {
        MPoint { in_, on, out, in_length: f64::NAN, out_length: f64::NAN, in_dir: f64::NAN, out_dir: f64::NAN,
                 in_tension: f64::NAN, out_tension: f64::NAN }
    }
    fn get(&self, key: &str) -> Vector {
        match key { "in" => self.in_.v, "on" => self.on.v, _ => self.out.v }
    }
}

/// `getDirection(point, firstRound, lastRound, testDirection, test, control)`.
/// Upstream quirk kept: `!firstRound || !lastRound` is always true, so all
/// three test points are always tried.
fn get_direction(point: &MPoint, test_direction: i32, test: &MPoint, control: &str) -> Option<f64> {
    let keys: [&str; 3] = if test_direction == 1 { ["out", "on", "in"] } else { ["in", "on", "out"] };
    for k in keys {
        let tp = test.get(k);
        let offset = if control == "out" { tp - point.on.v } else { point.on.v - tp };
        if offset.magnitude() != 0.0 {
            return Some(offset.angle());
        }
    }
    None
}

// ------------------------------------------------------------- contourFromContour.js

fn all2curve_to(contour: &[Cmd]) -> Result<Vec<[SPoint; 3]>> {
    let mut result = vec![];
    let mut previous = contour.len() - 1;
    for i in 0..contour.len() {
        let seg = match &contour[i] {
            Cmd::CurveTo(p) => p.clone(),
            c if c.len() == 2 => match line2curve(contour[previous].last(), c.last()) {
                Cmd::CurveTo(p) => p,
                _ => unreachable!(),
            },
            _ => return Err(imp_err("A segment is expected to  have 3 items at this stage")),
        };
        result.push(seg);
        previous = i;
    }
    Ok(result)
}

/// `contourFromContour(commands)`
fn contour_from_contour(commands: &[Cmd]) -> Result<Vec<MPoint>> {
    let segs = all2curve_to(commands)?;
    let n = segs.len();
    let mut points: Vec<MPoint> = (0..n).map(|i| {
        let out_index = if i == n - 1 { 0 } else { i + 1 };
        MPoint::new(segs[i][1].clone(), segs[i][2].clone(), segs[out_index][0].clone())
    }).collect();
    for index in 0..n {
        let snapshot = points.clone();
        let p = &mut points[index];
        p.out_length = (p.out.v - p.on.v).magnitude();
        p.out_dir = find_next_direction_contour(&snapshot, index, &snapshot[index], "out")
            .ok_or_else(|| imp_err(format!("Can't find an outgoing direction for point at contour[{index}].")))?;
        p.in_length = (p.on.v - p.in_.v).magnitude();
        p.in_dir = find_next_direction_contour(&snapshot, index, &snapshot[index], "in")
            .ok_or_else(|| imp_err(format!("can't find an incoming direction for point at contour[{index}].")))?;
    }
    Ok(points)
}

fn find_next_direction_contour(contour: &[MPoint], point_index: usize, point: &MPoint, control: &str) -> Option<f64> {
    let increment: i32 = if control == "out" { 1 } else { -1 };
    let mut i = point_index;
    let mut first = true;
    loop {
        let last = i == point_index && !first;
        let r = get_direction(point, increment, &contour[i], control);
        first = false;
        if r.is_some() || last { return r; }
        if increment == 1 && i == contour.len() - 1 { i = 0; }
        else if increment == -1 && i == 0 { i = contour.len() - 1; }
        else { i = (i as i32 + increment) as usize; }
    }
}

// ------------------------------------------------------------- StrokeContour.js

/// one stroke row: left and right segments, each `[in?, ctrl?, on?]`
type Seg = [Option<SPoint>; 3];

struct StrokeContour {
    rows: Vec<[Seg; 2]>,
}

fn seg3(c: &Cmd) -> Option<[SPoint; 3]> {
    if let Cmd::CurveTo(p) = c { Some(p.clone()) } else { None }
}

impl StrokeContour {
    fn new(contour: &[Cmd]) -> Result<StrokeContour> {
        let mut sc = StrokeContour { rows: vec![] };
        let len = contour.len();
        let z_length = (len - 1) as f64 * 0.5;
        let terminals = Self::terminals(contour);
        let mut right = 1usize;
        let mut left = len - 2;
        sc.push([
            vec![None, Some(terminals[0][0].clone()), Some(contour[left].last().clone())],
            vec![None, Some(terminals[0][1].clone()), Some(terminals[0][2].clone())],
        ])?;
        while (right as f64) < z_length {
            // contour[left].slice(1,-1).reverse() + contour[left-1].lastPoint
            let mut left_seg: Vec<Option<SPoint>> = match &contour[left] {
                Cmd::CurveTo(p) => vec![Some(p[1].clone()), Some(p[0].clone())],
                _ => vec![],
            };
            left_seg.push(Some(contour[left - 1].last().clone()));
            let right_seg: Vec<Option<SPoint>> = match &contour[right] {
                Cmd::CurveTo(p) => p.iter().cloned().map(Some).collect(),
                c => vec![Some(c.last().clone())],
            };
            sc.push([left_seg, right_seg])?;
            right += 1;
            left -= 1;
        }
        sc.push([
            vec![Some(terminals[1][1].clone()), None, None],
            vec![Some(terminals[1][0].clone()), None, None],
        ])?;
        Ok(sc)
    }

    /// `_getTerminals`: the control points of both terminal curves
    fn terminals(contour: &[Cmd]) -> [[SPoint; 3]; 2] {
        let bi = contour.len() - 1;
        let ei = (contour.len() - 1) / 2;
        let conv = |idx: usize| -> [SPoint; 3] {
            match seg3(&contour[idx]) {
                Some(p) => p,
                None => match line2curve(contour[idx - 1].last(), contour[idx].last()) {
                    Cmd::CurveTo(p) => p,
                    _ => unreachable!(),
                },
            }
        };
        [conv(bi), conv(ei)]
    }

    fn push(&mut self, row: [Vec<Option<SPoint>>; 2]) -> Result<()> {
        let mut segs: Vec<Seg> = vec![];
        for (j, s) in row.into_iter().enumerate() {
            let seg: Seg = if s.len() == 1 {
                let prev = self.rows.last().and_then(|r| r[j][2].clone())
                    .ok_or_else(|| imp_err("line2curve without a previous point"))?;
                match line2curve(&prev, s[0].as_ref().unwrap()) {
                    Cmd::CurveTo(p) => [Some(p[0].clone()), Some(p[1].clone()), Some(p[2].clone())],
                    _ => unreachable!(),
                }
            } else if s.len() == 3 {
                [s[0].clone(), s[1].clone(), s[2].clone()]
            } else {
                return Err(imp_err(format!("A segment is expected to  have 3 items at this stage, but this has {} items.", s.len())));
            };
            segs.push(seg);
        }
        let r = segs.pop().unwrap();
        let l = segs.pop().unwrap();
        self.rows.push([l, r]);
        Ok(())
    }
}

/// `{l, r, z}` of one stroke point
#[derive(Clone, Debug)]
pub(crate) struct StrokePoint {
    l: MPoint,
    r: MPoint,
    z: MPoint,
}

fn need(p: &Option<SPoint>) -> Result<SPoint> {
    p.clone().ok_or_else(|| imp_err("undefined point in stroke"))
}

fn get_pen_stroke(contour: &[Cmd]) -> Result<Vec<StrokePoint>> {
    let sc = StrokeContour::new(contour)?;
    let end = sc.rows.len() - 1;
    let mut stroke = vec![];
    for i in 0..end {
        let row = &sc.rows[i];
        let next = &sc.rows[i + 1];
        let l = MPoint::new(need(&row[0][1])?, need(&row[0][2])?, need(&next[0][0])?);
        let r = MPoint::new(need(&row[1][1])?, need(&row[1][2])?, need(&next[1][0])?);
        let z = MPoint::new(center_point(&l.in_, &r.in_), center_point(&l.on, &r.on), center_point(&l.out, &r.out));
        stroke.push(StrokePoint { l, r, z });
    }
    // polar controls: all of l, then all of r, then all of z
    for key in ['l', 'r', 'z'] {
        let snapshot = stroke.clone();
        for index in 0..stroke.len() {
            let point = sel(&snapshot[index], key).clone();
            let out_length = (point.out.v - point.on.v).magnitude();
            let out_dir = find_next_direction_stroke(&snapshot, index, key, &point, "out")
                .ok_or_else(|| imp_err(format!("can't find a outgoing direction for point[{index}].{key}")))?;
            let in_length = (point.on.v - point.in_.v).magnitude();
            let in_dir = find_next_direction_stroke(&snapshot, index, key, &point, "in")
                .ok_or_else(|| imp_err(format!("can't find a incoming direction for point[{index}].{key}")))?;
            let p = sel_mut(&mut stroke[index], key);
            p.out_length = out_length;
            p.out_dir = out_dir;
            p.in_length = in_length;
            p.in_dir = in_dir;
        }
    }
    for key in ['l', 'r'] {
        let n = stroke.len();
        for index in 0..n {
            set_tensions(&mut stroke, key, index, n);
        }
    }
    Ok(stroke)
}

fn sel(p: &StrokePoint, key: char) -> &MPoint {
    match key { 'l' => &p.l, 'r' => &p.r, _ => &p.z }
}
fn sel_mut(p: &mut StrokePoint, key: char) -> &mut MPoint {
    match key { 'l' => &mut p.l, 'r' => &mut p.r, _ => &mut p.z }
}

/// `_findNextDirection(stroke, pointIndex, key, point, control)`
fn find_next_direction_stroke(stroke: &[StrokePoint], point_index: usize, key: char, point: &MPoint, control: &str) -> Option<f64> {
    let normal: i32 = if control == "out" { 1 } else { -1 };
    let mut increment = normal;
    let mut i = point_index as i32;
    let mut contour_key = key;
    let mut first = true;
    let len = stroke.len() as i32;
    loop {
        let last = i == point_index as i32 && !first;
        let r = get_direction(point, increment, sel(&stroke[i as usize], contour_key), control);
        first = false;
        if r.is_some() || last { return r; }
        if key == 'z' {
            if increment == 1 && i == len - 1 { i = 0; }
            else if increment == -1 && i == 0 { i = len - 1; }
            else { i += increment; }
        } else {
            increment = if contour_key == key { normal } else { -normal };
            if (increment == 1 && i == len - 1) || (increment == -1 && i == 0) {
                contour_key = if key == 'l' { 'r' } else { 'l' };
                increment = -increment;
            } else {
                i += increment;
            }
        }
    }
}

/// `_setTensions(stroke, key, metapoint, index, contour)`
fn set_tensions(stroke: &mut [StrokePoint], key: char, index: usize, len: usize) {
    if index != len - 1 {
        let point = sel(&stroke[index], key).clone();
        let next = sel(&stroke[index + 1], key).clone();
        let uv = hobby::magnitude2tension(point.on.v, point.out_dir, point.out_length, next.in_length, next.in_dir, next.on.v);
        sel_mut(&mut stroke[index], key).out_tension = uv[0];
        sel_mut(&mut stroke[index + 1], key).in_tension = uv[1];
    }
    if index == 0 && key == 'l' {
        let point = stroke[index].l.clone();
        let next = stroke[index].r.clone();
        let uv = hobby::magnitude2tension(point.on.v, point.in_dir + std::f64::consts::PI, point.in_length,
                                          next.in_length, next.in_dir, next.on.v);
        stroke[index].l.in_tension = uv[0];
        stroke[index].r.in_tension = uv[1];
    } else if index == len - 1 && key == 'r' {
        let point = stroke[index].r.clone();
        let next = stroke[index].l.clone();
        let uv = hobby::magnitude2tension(point.on.v, point.out_dir, point.out_length,
                                          next.out_length, next.out_dir + std::f64::consts::PI, next.on.v);
        stroke[index].r.out_tension = uv[0];
        stroke[index].l.out_tension = uv[1];
    }
}

// ------------------------------------------------------------- MOM construction

/// a property value as `toPropertyLanguage` + `makeProperty` would write it
enum PV { V(Vector), N(f64), S(&'static str) }

fn pv_string(v: &PV) -> String {
    match v {
        PV::V(v) => format!("Vector {} {}", js_num(v.x), js_num(v.y)),
        PV::N(n) => js_num(*n),
        PV::S(s) => s.to_string(),
    }
}

fn set_properties(mom: &mut Mom, n: NodeId, data: Vec<(&'static str, PV)>) -> Result<()> {
    if data.is_empty() { return Ok(()); }
    let mut props = vec![];
    for (k, v) in data { props.push(Property::make(k, &pv_string(&v))?); }
    mom.node_mut(n).properties = PropertyDict::from_properties(props);
    Ok(())
}

/// `_makeCPSPointData`
fn cps_point_data(p: &StrokePoint, index: usize, length: usize) -> [Vec<(&'static str, PV)>; 3] {
    let mut left = vec![];
    let mut center = vec![];
    let mut right = vec![];
    center.push(("on", PV::V(p.z.on.v)));
    center.push(("in", PV::V(p.z.in_.v)));
    center.push(("out", PV::V(p.z.out.v)));
    if p.z.in_length == 0.0 { center.push(("inDir", PV::N(p.z.in_dir))); }
    if p.z.out_length == 0.0 { center.push(("outDir", PV::N(p.z.out_dir))); }
    let right_on = p.r.on.v - p.z.on.v;
    right.push(("onLength", PV::N(right_on.magnitude())));
    right.push(("onDir", PV::N(right_on.angle())));
    if index == 0 {
        left.push(("inDir", PV::N(p.l.in_dir)));
        right.push(("inDir", PV::N(p.r.in_dir)));
    } else {
        left.push(("inDirIntrinsic", PV::N(p.l.in_dir - p.z.in_dir)));
        right.push(("inDirIntrinsic", PV::N(p.r.in_dir - p.z.in_dir)));
    }
    if index == length - 1 {
        left.push(("outDir", PV::N(p.l.out_dir)));
        right.push(("outDir", PV::N(p.r.out_dir)));
    } else {
        left.push(("outDirIntrinsic", PV::N(p.l.out_dir - p.z.out_dir)));
        right.push(("outDirIntrinsic", PV::N(p.r.out_dir - p.z.out_dir)));
    }
    left.push(("inTension", PV::N(p.l.in_tension)));
    right.push(("inTension", PV::N(p.r.in_tension)));
    left.push(("inLength", PV::N(p.l.in_length)));
    right.push(("inLength", PV::N(p.r.in_length)));
    if p.l.in_length == 0.0 { left.push(("in", PV::S("on"))); }
    if p.r.in_length == 0.0 { right.push(("in", PV::S("on"))); }
    left.push(("outTension", PV::N(p.l.out_tension)));
    right.push(("outTension", PV::N(p.r.out_tension)));
    left.push(("outLength", PV::N(p.l.out_length)));
    right.push(("outLength", PV::N(p.r.out_length)));
    if p.l.out_length == 0.0 { left.push(("out", PV::S("on"))); }
    if p.r.out_length == 0.0 { right.push(("out", PV::S("on"))); }
    [left, center, right]
}

fn set_name_classes(mom: &mut Mom, n: NodeId, name: Option<&str>) {
    for w in name.unwrap_or("").split_whitespace() {
        if !mom.node(n).classes.iter().any(|c| c == w) {
            mom.node_mut(n).classes.push(w.to_string());
        }
    }
}

fn make_penstroke(mom: &mut Mom, data: &[StrokePoint]) -> Result<NodeId> {
    let ps = mom.create(Kind::PenStroke);
    for (i, p) in data.iter().enumerate() {
        let [l, c, r] = cps_point_data(p, i, data.len());
        let point = mom.create(Kind::Center);
        set_name_classes(mom, point, p.z.on.name.as_deref());
        if let Some(id) = &p.z.on.identifier { mom.node_mut(point).id = Some(id.clone()); }
        set_properties(mom, point, c)?;
        let (left, right) = (mom.node(point).children[0], mom.node(point).children[1]);
        set_properties(mom, left, l)?;
        set_properties(mom, right, r)?;
        mom.add(ps, point)?;
    }
    Ok(ps)
}

fn make_contour(mom: &mut Mom, data: &[MPoint], open: bool) -> Result<NodeId> {
    let contour = mom.create(Kind::Contour);
    for p in data {
        let point = mom.create(Kind::P);
        set_name_classes(mom, point, p.on.name.as_deref());
        if let Some(id) = &p.on.identifier { mom.node_mut(point).id = Some(id.clone()); }
        let mut d = vec![
            ("on", PV::V(p.on.v)), ("inDir", PV::N(p.in_dir)), ("inLength", PV::N(p.in_length)),
            ("outDir", PV::N(p.out_dir)), ("outLength", PV::N(p.out_length)),
        ];
        if p.in_length == 0.0 { d.push(("in", PV::S("on"))); }
        if p.out_length == 0.0 { d.push(("out", PV::S("on"))); }
        set_properties(mom, point, d)?;
        mom.add(contour, point)?;
    }
    if open {
        mom.node_mut(contour).properties = PropertyDict::from_properties(vec![Property::make("open", "1")?]);
    }
    Ok(contour)
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum ImportType { PenStroke, Contour }

pub struct ImportOptions {
    pub default_type: ImportType,
    pub skip_open_contours: bool,
    /// glyph name -> class names (from the project's groups)
    pub glyph_classes: Option<std::collections::HashMap<String, Vec<String>>>,
}

impl Default for ImportOptions {
    fn default() -> Self {
        ImportOptions { default_type: ImportType::PenStroke, skip_open_contours: true, glyph_classes: None }
    }
}

fn contour_import_type(id: Option<&str>, opts: &ImportOptions) -> ImportType {
    if let Some(id) = id {
        if let Some(pos) = id.find(':') {
            match &id[..pos] {
                "C" => return ImportType::Contour,
                "P" => return ImportType::PenStroke,
                _ => {}
            }
        }
    }
    opts.default_type
}

/// `_importContour`: `Ok(None)` when the item is skipped
fn import_contour(mom: &mut Mom, ty: ImportType, commands: &[Cmd], closed: bool, opts: &ImportOptions) -> Result<Option<NodeId>> {
    match ty {
        ImportType::Contour => {
            if !closed && opts.skip_open_contours { return Ok(None); }
            let data = contour_from_contour(commands)?;
            Ok(Some(make_contour(mom, &data, !closed)?))
        }
        ImportType::PenStroke => {
            if commands.len() < 5 || commands.len() % 2 == 0 { return Ok(None); }
            let data = get_pen_stroke(commands)?;
            Ok(Some(make_penstroke(mom, &data)?))
        }
    }
}

/// `importGlyph(glyphName)`
pub fn import_glyph(mom: &mut Mom, glyph_set: &GlyphSet, name: &str, opts: &ImportOptions) -> Result<NodeId> {
    let mut pen = ImportOutlinePen::default();
    // reading errors are GlifLibErrors: the importer skips the glyph
    let data = glyph_set.read_glyph(name, Some(&mut pen)).map_err(|e| imp_err(format!("GlifLibError: {}", e.0)))?;
    if let Some(e) = pen.error { return Err(imp_err(e)); }
    // _makeGlyph
    let glyph = mom.create(Kind::Glyph);
    mom.node_mut(glyph).id = Some(name.to_string());
    let mut props = vec![];
    for k in ["width", "height"] {
        if let Some(v) = data.get(k).and_then(|v| v.as_f64()) {
            if v != 0.0 && !v.is_nan() { props.push(Property::make(k, &js_num(v))?); }
        }
    }
    if !props.is_empty() { mom.node_mut(glyph).properties = PropertyDict::from_properties(props); }
    for (k, v) in &data {
        if k != "width" && k != "height" { mom.set_attachment(glyph, k, v.clone()); }
    }
    if let Some(classes) = opts.glyph_classes.as_ref().and_then(|c| c.get(name)) {
        for c in classes {
            if !mom.node(glyph).classes.contains(c) { mom.node_mut(glyph).classes.push(c.clone()); }
        }
    }
    for item in pen.pen.contours {
        match item {
            OutlineItem::Component { glyph_name, transformation } => {
                let c = mom.create(Kind::Component);
                let t: Vec<String> = transformation.iter().map(|v| js_num(*v)).collect();
                mom.node_mut(c).properties = PropertyDict::from_properties(vec![
                    Property::make("baseGlyphName", &format!("\"{glyph_name}\""))?,
                    Property::make("transformation", &format!("Transformation {}", t.join(" ")))?,
                ]);
                mom.add(glyph, c)?;
            }
            OutlineItem::Contour { commands, closed, identifier } => {
                let mut ty = Some(contour_import_type(identifier.as_deref(), opts));
                let mut tried: HashSet<String> = HashSet::new();
                while let Some(t) = ty {
                    tried.insert(format!("{t:?}"));
                    if let Some(node) = import_contour(mom, t, &commands, closed, opts)? {
                        if let Some(id) = &identifier { mom.node_mut(node).id = Some(id.clone()); }
                        mom.add(glyph, node)?;
                        break;
                    }
                    // contourImportTypeFallbacks: PenStroke -> Contour
                    let fallback = if t == ImportType::PenStroke { Some(ImportType::Contour) } else { None };
                    match fallback {
                        Some(f) if tried.contains(&format!("{f:?}")) => break,
                        f => ty = f,
                    }
                }
            }
        }
    }
    Ok(glyph)
}

/// `UFOImporter.doImport()`: a new, detached master with all glyphs
pub fn import_ufo(mom: &mut Mom, reader: &UfoReader, master_name: Option<&str>, glyphs: Option<&[String]>,
                  opts: &ImportOptions) -> Result<NodeId> {
    let glyph_set = reader.glyph_set().map_err(|e| imp_err(e.0))?;
    let names: Vec<String> = match glyphs {
        None => glyph_set.keys(),
        Some(list) => {
            let missing: Vec<&String> = list.iter().filter(|n| !glyph_set.contents.contains_key(*n)).collect();
            if !missing.is_empty() {
                return Err(CpsError::key(format!("Some glyphs requested for import are missing in the source GlyphSet: {}",
                    missing.iter().map(|s| s.as_str()).collect::<Vec<_>>().join(", "))));
            }
            list.to_vec()
        }
    };
    let fontinfo = reader.read_info().map_err(|e| imp_err(e.0))?;
    let master = mom.create(Kind::Master);
    if let Some(n) = master_name { mom.node_mut(master).id = Some(n.to_string()); }
    mom.set_attachment(master, "fontinfo", Json::Object(fontinfo));
    for name in names {
        // GlifLibErrors skip the glyph, everything else aborts
        match import_glyph(mom, &glyph_set, &name, opts) {
            Ok(g) => mom.add(master, g)?,
            Err(e) if e.message.starts_with("GlifLib") => continue,
            Err(e) => return Err(e),
        }
    }
    Ok(master)
}

pub type Attachments = JsonMap;
