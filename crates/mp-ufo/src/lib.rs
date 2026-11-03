//! Writing UFOs exactly like ufoJS does (pinned in tools/js-reference),
//! byte for byte, so exports can be compared with the JS goldens by hash.

pub mod filenames;
pub mod glif;
pub mod plist;
pub mod reader;
pub mod round;
pub mod writer;
pub mod xml;

pub use glif::GlyphData;
pub use writer::UfoWriter;

/// fontTools/ufoJS point pen protocol (only what the renderer uses)
pub trait PointPen {
    fn begin_path(&mut self);
    fn end_path(&mut self);
    /// `segment_type`: None for off-curve points, else "move"/"line"/"curve"/"qcurve"
    fn add_point(&mut self, pt: [f64; 2], segment_type: Option<&str>);
    fn add_component(&mut self, base: &str, transformation: [f64; 6]);
}

/// JS `String(value)` for attribute values
pub fn js_string(v: &serde_json::Value) -> String {
    match v {
        serde_json::Value::Null => "null".into(),
        serde_json::Value::Bool(b) => b.to_string(),
        serde_json::Value::Number(n) => mp_math::js_num(n.as_f64().unwrap_or(f64::NAN)),
        serde_json::Value::String(s) => s.clone(),
        serde_json::Value::Array(a) => a.iter().map(js_string).collect::<Vec<_>>().join(","),
        serde_json::Value::Object(_) => "[object Object]".into(),
    }
}
