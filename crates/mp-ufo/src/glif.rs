//! GLIF writing: port of ufoJS `glifLib/writeGlyph.js` and `GLIFPointPen.js`.

use crate::plist;
use crate::round::round;
use crate::xml::{Element, XML_DECLARATION};
use crate::PointPen;
use mp_math::js_num;
use serde_json::Value as Json;
use std::fmt;

#[derive(Debug, Clone, PartialEq)]
pub struct GlifError(pub String);

impl fmt::Display for GlifError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result { write!(f, "GlifLibError: {}", self.0) }
}
impl std::error::Error for GlifError {}

/// `glifData` as `UFOExporter._getGLIFData` builds it. `None` = undefined.
#[derive(Debug, Clone, Default)]
pub struct GlyphData {
    pub width: Option<f64>,
    pub height: Option<f64>,
    pub unicodes: Option<Json>,
    pub note: Option<Json>,
    pub lib: Option<Json>,
    pub image: Option<Json>,
    pub guidelines: Option<Json>,
}

const TRANSFORMATION_INFO: [(&str, f64); 6] = [
    ("xScale", 1.0), ("xyScale", 0.0), ("yxScale", 0.0), ("yScale", 1.0), ("xOffset", 0.0), ("yOffset", 0.0),
];

fn rnd(precision: Option<i64>, v: f64) -> f64 {
    match precision { None | Some(-1) => v, Some(p) => round(v, p) }
}

/// The GLIF `PointPen`.
pub struct GlifPen {
    pub outline: Element,
    current: Option<Element>,
    prev_point_types: Vec<&'static str>,
    prev_off_curve_count: usize,
    precision: Option<i64>,
    pub error: Option<GlifError>,
}

impl GlifPen {
    pub fn new(precision: Option<i64>) -> Self {
        GlifPen { outline: Element::new("outline"), current: None, prev_point_types: vec![],
                  prev_off_curve_count: 0, precision, error: None }
    }
    fn fail(&mut self, m: &str) {
        if self.error.is_none() { self.error = Some(GlifError(m.to_string())); }
    }
}

impl PointPen for GlifPen {
    fn begin_path(&mut self) {
        if self.current.is_some() { self.fail("currentPath is not null, call endPath"); }
        self.current = Some(Element::new("contour"));
        self.prev_off_curve_count = 0;
    }
    fn end_path(&mut self) {
        let Some(c) = self.current.take() else { return self.fail("currentPath is null, call beginPath"); };
        if self.prev_point_types.first() == Some(&"move") && self.prev_point_types.last() == Some(&"offcurve") {
            self.fail("open contour has loose offcurve point");
        }
        self.outline.push(c);
        self.prev_off_curve_count = 0;
        self.prev_point_types.clear();
    }
    fn add_point(&mut self, pt: [f64; 2], segment_type: Option<&str>) {
        if self.current.is_none() { return self.fail("currentPath is null, call beginPath"); }
        if pt.iter().any(|v| v.is_nan()) { return self.fail("coordinates must be int or float"); }
        let x = rnd(self.precision, pt[0]);
        let y = rnd(self.precision, pt[1]);
        let mut point = Element::new("point").attr("x", js_num(x)).attr("y", js_num(y));
        let mut st: Option<&'static str> = match segment_type {
            Some("offcurve") | None => None,
            Some("move") => Some("move"),
            Some("line") => Some("line"),
            Some("curve") => Some("curve"),
            Some("qcurve") => Some("qcurve"),
            Some(_) => Some("curve"),
        };
        if st == Some("move") && !self.prev_point_types.is_empty() {
            return self.fail("move occurs after a point has already been added to the contour.");
        }
        if st == Some("line") && self.prev_point_types.last() == Some(&"offcurve") {
            return self.fail("offcurve occurs before line point.");
        }
        if st == Some("curve") && self.prev_off_curve_count > 2 {
            return self.fail("too many offcurve points before curve point.");
        }
        if let Some(t) = st { point.set_attr("type", t); } else { st = Some("offcurve"); }
        if st == Some("offcurve") { self.prev_off_curve_count += 1; } else { self.prev_off_curve_count = 0; }
        self.prev_point_types.push(st.unwrap());
        self.current.as_mut().unwrap().push(point);
    }
    fn add_component(&mut self, base: &str, transformation: [f64; 6]) {
        let mut c = Element::new("component").attr("base", base);
        for (i, (attr, default)) in TRANSFORMATION_INFO.iter().enumerate() {
            let v = rnd(self.precision, transformation[i]);
            if v != *default { c.set_attr(attr, js_num(v)); }
        }
        self.outline.push(c);
    }
}

fn int_value(v: &Json) -> Option<i64> {
    let x = v.as_f64()?;
    if x == ((x as i64 as i32) as f64) { Some(x as i64) } else { None }
}

/// `writeGlyphToString(glyphName, glyphObject, drawPointsFunc, formatVersion=2, {precision})`
pub fn write_glyph(name: &str, data: &GlyphData, draw: &mut dyn FnMut(&mut dyn PointPen) -> Result<(), String>,
                   precision: Option<i64>) -> Result<String, Box<dyn std::error::Error>> {
    if name.is_empty() { return Err(Box::new(GlifError("The glyph name is empty.".into()))); }
    let mut glyph = Element::new("glyph").attr("name", name).attr("format", "2");
    // advance
    let mut adv = Element::new("advance");
    for (k, v) in [("width", data.width), ("height", data.height)] {
        match v {
            None => continue,
            Some(x) if x == 0.0 => continue,
            Some(x) => adv.set_attr(k, js_num(rnd(precision, x))),
        }
    }
    if !adv.attrs.is_empty() { glyph.push(adv); }
    // unicodes
    if let Some(u) = &data.unicodes {
        let list: Vec<Json> = match u {
            Json::Array(a) => a.clone(),
            other if int_value(other).is_some() => vec![other.clone()],
            _ => return Err(Box::new(GlifError("unicode values must be int".into()))),
        };
        let mut seen = vec![];
        for code in &list {
            let c = int_value(code).ok_or_else(|| GlifError("unicode values must be int".into()))?;
            if seen.contains(&c) { continue; }
            seen.push(c);
            let mut hex = format!("{:X}", c);
            if hex.len() < 4 { hex = format!("{}{hex}", "0".repeat(4 - hex.len())); }
            glyph.push(Element::new("unicode").attr("hex", hex));
        }
    }
    // note
    if let Some(n) = &data.note {
        let s = n.as_str().ok_or_else(|| GlifError("note attribute must be string".into()))?;
        let s: Vec<&str> = s.split('\n').map(|l| l.trim()).collect();
        glyph.push(Element::new("note").with_text(s.join("\n")));
    }
    // image
    if let Some(Json::Object(img)) = &data.image {
        let mut e = Element::new("image");
        e.set_attr("fileName", img.get("fileName").and_then(|v| v.as_str()).unwrap_or(""));
        for (attr, default) in TRANSFORMATION_INFO {
            if let Some(v) = img.get(attr).and_then(|v| v.as_f64()) {
                let v = rnd(precision, v);
                if v != default { e.set_attr(attr, js_num(v)); }
            }
        }
        if let Some(c) = img.get("color") { e.set_attr("color", crate::js_string(c)); }
        glyph.push(e);
    }
    // guidelines
    if let Some(Json::Array(gs)) = &data.guidelines {
        for g in gs {
            let mut e = Element::new("guideline");
            if let Json::Object(m) = g {
                for k in plist::js_key_order(m) {
                    let v = &m[k];
                    let s = if matches!(k.as_str(), "x" | "y" | "angle") {
                        v.as_f64().map(|x| js_num(rnd(precision, x))).unwrap_or_else(|| crate::js_string(v))
                    } else { crate::js_string(v) };
                    e.set_attr(k, s);
                }
            }
            glyph.push(e);
        }
    }
    // outline
    let mut pen = GlifPen::new(precision);
    draw(&mut pen).map_err(GlifError)?;
    if let Some(e) = pen.error { return Err(Box::new(e)); }
    glyph.push(pen.outline);
    // lib
    if let Some(lib) = &data.lib {
        if !lib.is_object() { return Err(Box::new(GlifError("lib must be a dict".into()))); }
        let mut e = Element::new("lib");
        if let Some(d) = plist::element(lib) { e.push(d); }
        glyph.push(e);
    }
    let mut out = String::from(XML_DECLARATION);
    out.push('\n');
    glyph.serialize(&mut out);
    Ok(out)
}
