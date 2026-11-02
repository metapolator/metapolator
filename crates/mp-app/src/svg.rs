//! Glyph outlines as SVG, for the specimen views
//! (Atem-MOM-Toolkit `services/glyph/GlyphInterface` with the outlines
//! renderer).

use mp_cps::{Engine, NodeId, Value};
use mp_mom::render::draw_glyph;
use mp_mom::tree::Mom;
use mp_ufo::PointPen;

/// What the UI needs to draw one glyph.
#[derive(Clone, Debug, PartialEq)]
pub struct GlyphView {
    /// SVG path data in font units (y up)
    pub path: String,
    /// `viewBox = [0, 0, width, height]`: advance width × unitsPerEm
    pub width: f64,
    pub height: f64,
    /// `unitsPerEm + descender`: the `matrix(1,0,0,-1,0,move_up)` flip
    pub move_up: f64,
    /// the first rendering error, if any (the glyph is drawn up to it)
    pub error: Option<String>,
}

impl GlyphView {
    /// a standalone `<svg>` element, `height_px` high
    pub fn to_svg(&self, height_px: f64, fill: &str) -> String {
        let w = if self.height > 0.0 { self.width / self.height * height_px } else { 0.0 };
        format!(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 {} {}\" width=\"{}\" height=\"{}\"><g transform=\"matrix(1,0,0,-1,0,{})\"><path fill=\"{}\" d=\"{}\"/></g></svg>",
            fmt(self.width), fmt(self.height), fmt(w), fmt(height_px), fmt(self.move_up), fill, self.path)
    }
}

/// compact number formatting for path data
pub fn fmt(v: f64) -> String {
    if !v.is_finite() { return "0".into(); }
    let r = (v * 100.0).round() / 100.0;
    let s = format!("{r:.2}");
    let s = s.trim_end_matches('0').trim_end_matches('.');
    if s == "-0" { "0".into() } else { s.to_string() }
}

fn apply(t: &[f64; 6], p: [f64; 2]) -> [f64; 2] {
    [t[0] * p[0] + t[2] * p[1] + t[4], t[1] * p[0] + t[3] * p[1] + t[5]]
}

fn compose(outer: &[f64; 6], inner: &[f64; 6]) -> [f64; 6] {
    // inner first, then outer
    [
        outer[0] * inner[0] + outer[2] * inner[1],
        outer[1] * inner[0] + outer[3] * inner[1],
        outer[0] * inner[2] + outer[2] * inner[3],
        outer[1] * inner[2] + outer[3] * inner[3],
        outer[0] * inner[4] + outer[2] * inner[5] + outer[4],
        outer[1] * inner[4] + outer[3] * inner[5] + outer[5],
    ]
}

/// a PointPen writing SVG path data; components are collected and
/// drawn afterwards by [`glyph_view`]
struct SvgPen {
    transform: [f64; 6],
    contour: Option<Vec<([f64; 2], Option<String>)>>,
    d: String,
    components: Vec<(String, [f64; 6])>,
}

impl SvgPen {
    fn pt(&mut self, cmd: char, pts: &[[f64; 2]]) {
        self.d.push(cmd);
        for (i, p) in pts.iter().enumerate() {
            if i > 0 { self.d.push(' '); }
            self.d.push_str(&fmt(p[0]));
            self.d.push(' ');
            self.d.push_str(&fmt(p[1]));
        }
    }
    fn segment(&mut self, kind: &str, current: [f64; 2], pts: &[[f64; 2]]) {
        let end = *pts.last().unwrap();
        let off = &pts[..pts.len() - 1];
        match (kind, off.len()) {
            (_, 0) => self.pt('L', &[end]),
            ("qcurve", _) => {
                // TrueType: implied on-curve points between off-curves
                for i in 0..off.len() {
                    let next = if i + 1 < off.len() {
                        [0.5 * (off[i][0] + off[i + 1][0]), 0.5 * (off[i][1] + off[i + 1][1])]
                    } else { end };
                    self.pt('Q', &[off[i], next]);
                }
            }
            (_, 1) => self.pt('Q', &[off[0], end]),
            (_, 2) => self.pt('C', &[off[0], off[1], end]),
            _ => {
                // decomposeSuperBezierSegment (as in the OTF pen)
                let all: Vec<[f64; 2]> = pts.to_vec();
                let n = all.len();
                let mut pt1 = all[0];
                let mut pt2: Option<[f64; 2]> = None;
                for i in 2..n {
                    let nd = i.min(3).min(n - i + 1);
                    for j in 1..nd {
                        let f = j as f64 / nd as f64;
                        let (t1, t2) = (all[i - 1], all[i - 2]);
                        let temp = [t2[0] + f * (t1[0] - t2[0]), t2[1] + f * (t1[1] - t2[1])];
                        match pt2 {
                            None => pt2 = Some(temp),
                            Some(p2) => {
                                let pt3 = [0.5 * (p2[0] + temp[0]), 0.5 * (p2[1] + temp[1])];
                                self.pt('C', &[pt1, p2, pt3]);
                                pt1 = temp;
                                pt2 = None;
                            }
                        }
                    }
                }
                self.pt('C', &[pt1, all[n - 2], all[n - 1]]);
                let _ = current;
            }
        }
    }
}

impl PointPen for SvgPen {
    fn begin_path(&mut self) { self.contour = Some(vec![]); }
    fn add_point(&mut self, pt: [f64; 2], segment_type: Option<&str>) {
        let p = apply(&self.transform, pt);
        if let Some(c) = self.contour.as_mut() { c.push((p, segment_type.map(String::from))); }
    }
    fn end_path(&mut self) {
        let Some(mut pts) = self.contour.take() else { return };
        if pts.is_empty() { return; }
        let open = pts[0].1.as_deref() == Some("move");
        if !open {
            // start right after the last on-curve point
            let Some(last_on) = pts.iter().rposition(|p| p.1.is_some()) else {
                // all off-curve: a TrueType closed quadratic contour
                let n = pts.len();
                let mid = |a: [f64; 2], b: [f64; 2]| [0.5 * (a[0] + b[0]), 0.5 * (a[1] + b[1])];
                let start = mid(pts[n - 1].0, pts[0].0);
                self.pt('M', &[start]);
                for i in 0..n {
                    let next = mid(pts[i].0, pts[(i + 1) % n].0);
                    self.pt('Q', &[pts[i].0, next]);
                }
                self.d.push('Z');
                return;
            };
            pts.rotate_left(last_on + 1);
        }
        let start = if open { pts.remove(0).0 } else { pts.last().unwrap().0 };
        self.pt('M', &[start]);
        let mut current = start;
        let mut buf: Vec<[f64; 2]> = vec![];
        for (p, st) in pts {
            buf.push(p);
            if let Some(kind) = st {
                self.segment(&kind, current, &buf);
                current = p;
                buf.clear();
            }
        }
        if !open { self.d.push('Z'); }
    }
    fn add_component(&mut self, base: &str, t: [f64; 6]) {
        self.components.push((base.to_string(), compose(&self.transform, &t)));
    }
}

fn number(engine: &Engine<Mom>, n: NodeId, key: &str) -> Option<f64> {
    match engine.get(n, key) { Ok(Value::Number(v)) if v.is_finite() => Some(v), _ => None }
}

fn draw_into(engine: &Engine<Mom>, glyph: NodeId, pen: &mut SvgPen, depth: u32) -> Result<(), String> {
    draw_glyph(engine, glyph, pen).map_err(|e| e.to_string())?;
    let comps = std::mem::take(&mut pen.components);
    if depth > 8 { return Ok(()); }
    let master = engine.model.master_of(glyph);
    for (base, t) in comps {
        let Some(m) = master else { continue };
        let Some(g) = engine.model.get_by_id(m, &base) else { continue };
        let saved = pen.transform;
        pen.transform = t;
        let r = draw_into(engine, g, pen, depth + 1);
        pen.transform = saved;
        r?;
    }
    Ok(())
}

/// render `glyph` like the UI's glyph directive
pub fn glyph_view(engine: &Engine<Mom>, glyph: NodeId) -> GlyphView {
    let mom = &engine.model;
    let fontinfo = mom.master_of(glyph).and_then(|m| mom.attachment(m, "fontinfo", true));
    let info = |k: &str| fontinfo.and_then(|f| f.get(k)).and_then(|v| v.as_f64());
    let upm = info("unitsPerEm").filter(|v| *v != 0.0).unwrap_or(1000.0);
    let move_up = upm + info("descender").unwrap_or(0.0);
    let width = number(engine, glyph, "width").unwrap_or(upm).max(0.0);
    let mut pen = SvgPen { transform: [1.0, 0.0, 0.0, 1.0, 0.0, 0.0], contour: None, d: String::new(), components: vec![] };
    let error = draw_into(engine, glyph, &mut pen, 0).err();
    GlyphView { path: pen.d, width, height: upm.max(0.0), move_up, error }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn closed_cubic_contour() {
        let mut pen = SvgPen { transform: [1.0, 0.0, 0.0, 1.0, 0.0, 0.0], contour: None, d: String::new(), components: vec![] };
        pen.begin_path();
        pen.add_point([0.0, 0.0], Some("line"));
        pen.add_point([10.0, 0.0], None);
        pen.add_point([20.0, 10.0], None);
        pen.add_point([20.0, 20.0], Some("curve"));
        pen.add_point([0.0, 20.0], Some("line"));
        pen.end_path();
        assert_eq!(pen.d, "M0 20L0 0C10 0 20 10 20 20L0 20Z");
    }

    #[test]
    fn open_contour() {
        let mut pen = SvgPen { transform: [2.0, 0.0, 0.0, 2.0, 1.0, 0.0], contour: None, d: String::new(), components: vec![] };
        pen.begin_path();
        pen.add_point([0.0, 0.0], Some("move"));
        pen.add_point([5.0, 0.5], Some("line"));
        pen.end_path();
        assert_eq!(pen.d, "M1 0L11 1");
    }

    #[test]
    fn number_format() {
        assert_eq!(fmt(1.0), "1");
        assert_eq!(fmt(-0.001), "0");
        assert_eq!(fmt(12.345), "12.35");
        assert_eq!(fmt(f64::NAN), "0");
    }
}
