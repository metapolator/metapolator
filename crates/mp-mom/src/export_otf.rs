//! OTF export: port of Atem-MOM `export/OTFExporter.es6.js` (with
//! `MasterGlyphSet`, Atem-Pen-Case `PointToSegmentPen`/`BasePen`/`OpenTypePen`)
//! on top of the opentype.js port in `mp-otf`.
//!
//! Upstream behaviour kept on purpose:
//! - `MasterGlyphSet.get` never returns its result, so components are not
//!   drawn (only a missing base glyph raises a KeyError);
//! - `OpenTypePen` has no `_closePath`, so paths have no `Z`;
//! - `PointToSegmentPen` does not output the implied closing line.

use crate::render::draw_glyph;
use crate::tree::Mom;
use mp_cps::{CpsError, Engine, NodeId, Value};
use mp_otf::{FontOptions, Glyph as OtGlyph, PathCmd};
use mp_ufo::PointPen;
use serde_json::Value as Json;

/// `PointToSegmentPen(outputImpliedClosingLine=false)` → `OpenTypePen`
struct OtPen<'a> {
    mom: &'a Mom,
    master: NodeId,
    path: Option<Vec<([f64; 2], Option<String>)>>,
    cmds: Vec<PathCmd>,
    current: Option<[f64; 2]>,
    error: Option<String>,
}

impl OtPen<'_> {
    fn curve_to(&mut self, pts: Vec<[f64; 2]>) {
        let n = pts.len() as isize - 1;
        if n == 2 {
            self.curve_one(pts[0], pts[1], pts[2]);
        } else if n > 2 {
            // decomposeSuperBezierSegment
            let n = pts.len() - 1;
            let mut pt1 = pts[0];
            let mut pt2: Option<[f64; 2]> = None;
            for i in 2..=n {
                let nd = i.min(3).min(n - i + 2);
                for j in 1..nd {
                    let f = j as f64 / nd as f64;
                    let (t1, t2) = (pts[i - 1], pts[i - 2]);
                    let temp = [t2[0] + f * (t1[0] - t2[0]), t2[1] + f * (t1[1] - t2[1])];
                    match pt2 {
                        None => pt2 = Some(temp),
                        Some(p2) => {
                            let pt3 = [0.5 * (p2[0] + temp[0]), 0.5 * (p2[1] + temp[1])];
                            self.curve_one(pt1, p2, pt3);
                            pt1 = temp;
                            pt2 = None;
                        }
                    }
                }
            }
            self.curve_one(pt1, pts[pts.len() - 2], pts[pts.len() - 1]);
        } else if n == 1 {
            self.q_curve_to(pts);
        } else if n == 0 {
            self.line_to(pts[0]);
        }
    }
    fn q_curve_to(&mut self, pts: Vec<[f64; 2]>) {
        let n = pts.len() - 1;
        if n == 0 { return self.line_to(pts[0]); }
        let mut segs = vec![];
        for i in 0..n - 1 {
            let (a, b) = (pts[i], pts[i + 1]);
            segs.push((a, [0.5 * (a[0] + b[0]), 0.5 * (a[1] + b[1])]));
        }
        segs.push((pts[pts.len() - 2], pts[pts.len() - 1]));
        for (p1, p2) in segs {
            let p0 = match self.current { Some(p) => p, None => { self.error = Some("TypeError: no current point".into()); return; } };
            let k = 0.66666666666666667;
            let m1 = [p0[0] + k * (p1[0] - p0[0]), p0[1] + k * (p1[1] - p0[1])];
            let m2 = [p2[0] + k * (p1[0] - p2[0]), p2[1] + k * (p1[1] - p2[1])];
            self.curve_one(m1, m2, p2);
        }
    }
    fn curve_one(&mut self, a: [f64; 2], b: [f64; 2], c: [f64; 2]) {
        self.cmds.push(PathCmd::C(a[0], a[1], b[0], b[1], c[0], c[1]));
        self.current = Some(c);
    }
    fn line_to(&mut self, p: [f64; 2]) {
        self.cmds.push(PathCmd::L(p[0], p[1]));
        self.current = Some(p);
    }
}

impl PointPen for OtPen<'_> {
    fn begin_path(&mut self) { self.path = Some(vec![]); }
    fn add_point(&mut self, pt: [f64; 2], segment_type: Option<&str>) {
        if let Some(p) = self.path.as_mut() { p.push((pt, segment_type.map(String::from))); }
    }
    fn end_path(&mut self) {
        let Some(mut points) = self.path.take() else { return };
        if points.is_empty() { return; }
        let mut segments: Vec<(String, Vec<Option<[f64; 2]>>)> = vec![];
        if points.len() == 1 {
            segments.push(("move".into(), vec![Some(points[0].0)]));
        } else {
            if points[0].1.as_deref() == Some("move") {
                let p = points.remove(0);
                segments.push(("move".into(), vec![Some(p.0)]));
            } else {
                match points.iter().position(|p| p.1.is_some()) {
                    None => { self.error = Some("TypeError: all-offcurve contour".into()); return; }
                    Some(first) => {
                        let head: Vec<_> = points.drain(0..=first).collect();
                        points.extend(head);
                    }
                }
            }
            let mut cur = vec![];
            for (pt, st) in points {
                cur.push(Some(pt));
                if let Some(t) = st { segments.push((t, std::mem::take(&mut cur))); }
            }
        }
        // _flushContour
        let closed = segments[0].0 != "move";
        let move_pt = if !closed { segments.remove(0).1[0] } else { *segments.last().unwrap().1.last().unwrap() };
        if let Some(m) = move_pt {
            self.cmds.push(PathCmd::M(m[0], m[1]));
            self.current = Some(m);
        }
        let n = segments.len();
        for (i, (ty, pts)) in segments.into_iter().enumerate() {
            let pts: Vec<[f64; 2]> = pts.into_iter().flatten().collect();
            match ty.as_str() {
                // outputImpliedClosingLine = false
                "line" => if i + 1 != n || !closed { self.line_to(pts[0]); },
                "curve" => self.curve_to(pts),
                "qcurve" => self.q_curve_to(pts),
                other => { self.error = Some(format!("illegal segmentType: {other}")); return; }
            }
        }
        // closePath/endPath: no path command (OpenTypePen has no _closePath)
        self.current = None;
    }
    fn add_component(&mut self, base: &str, _t: [f64; 6]) {
        // MasterGlyphSet.get: KeyError for a missing glyph, else returns undefined
        if self.mom.get_by_id(self.master, base).is_none() && self.error.is_none() {
            self.error = Some(format!("KeyError: Glyph \"{base}\" not found"));
        }
    }
}

fn js_to_number_array(v: Option<&Json>) -> f64 {
    let arr = match v { Some(Json::Array(a)) => a.clone(), Some(Json::Null) | None => vec![], Some(other) => vec![other.clone()] };
    match arr.len() {
        0 => 0.0,
        1 => match &arr[0] {
            Json::Number(n) => n.as_f64().unwrap_or(f64::NAN),
            Json::String(s) => { let t = s.trim(); if t.is_empty() { 0.0 } else { t.parse().unwrap_or(f64::NAN) } }
            Json::Bool(b) => if *b { 1.0 } else { 0.0 },
            Json::Null => 0.0,
            Json::Array(_) => js_to_number_array(Some(&arr[0])),
            Json::Object(_) => f64::NAN,
        },
        _ => f64::NAN,
    }
}

/// `project.getOTFInstance(masterName)`: `project_fontinfo` is the project's
/// `fontinfo.plist` data (`{}` if it has none).
pub fn export_otf(engine: &Engine<Mom>, master: NodeId, project_fontinfo: &Json) -> Result<Vec<u8>, String> {
    let mom = &engine.model;
    // Project._getOTFExporter: master.getAttachment('fontinfo') || projectFontinfo
    let info = mom.attachment(master, "fontinfo", false).cloned().unwrap_or_else(|| project_fontinfo.clone());
    let get = |k: &str| info.get(k).cloned();
    let truthy_num = |k: &str, d: f64| match get(k) { Some(Json::Number(n)) if n.as_f64().map(|x| x != 0.0 && !x.is_nan()).unwrap_or(false) => n.as_f64().unwrap(), _ => d };
    let truthy_str = |k: &str| match get(k) { Some(Json::String(s)) if !s.is_empty() => Some(s), _ => None };
    let mut glyphs = vec![];
    for g in mom.node(master).children.clone() {
        let mut pen = OtPen { mom, master, path: None, cmds: vec![], current: None, error: None };
        draw_glyph(engine, g, &mut pen).map_err(|e: CpsError| e.to_string())?;
        if let Some(e) = pen.error { return Err(e); }
        let width = match engine.get_or(g, "width", Value::Number(0.0)) { Value::Number(n) => n, _ => 0.0 };
        glyphs.push(OtGlyph {
            name: mom.node(g).id.clone(),
            unicode: js_to_number_array(mom.attachment(g, "unicodes", true)),
            advance_width: if width != 0.0 && !width.is_nan() { Some(width) } else { None },
            path: pen.cmds,
        });
    }
    let opts = FontOptions {
        family_name: truthy_str("familyName").or_else(|| mom.node(master).id.clone()).unwrap_or_default(),
        style_name: truthy_str("styleName").unwrap_or_else(|| "Regular".into()),
        units_per_em: truthy_num("unitsPerEm", 1000.0),
        ascender: truthy_num("ascender", 800.0),
        descender: truthy_num("descender", -200.0),
    };
    mp_otf::font_to_bytes(&opts, &glyphs).map_err(|e| e.0)
}
