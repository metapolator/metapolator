//! UFO export: port of Atem-MOM `export/UFOExporter.es6.js`.

use crate::render::draw_glyph;
use crate::tree::Mom;
use mp_cps::{Engine, NodeId, Value};
use mp_io::Io;
use mp_ufo::{GlyphData, UfoWriter};
use serde_json::Value as Json;

fn value_to_json(v: &Value) -> Option<Json> {
    Some(match v {
        Value::Undefined => return None,
        Value::Null => Json::Null,
        Value::Bool(b) => Json::Bool(*b),
        Value::Number(n) => crate::js::num(*n),
        Value::String(s) => Json::String(s.to_string()),
        Value::Array(a) => Json::Array(a.iter().filter_map(value_to_json).collect()),
        other => Json::String(other.to_string()),
    })
}

/// `_getGLIFData(glyph)`
pub fn glif_data(engine: &Engine<Mom>, glyph: NodeId) -> GlyphData {
    let num = |key: &str| match engine.get_or(glyph, key, Value::Number(0.0)) {
        Value::Number(n) => Some(n),
        _ => Some(0.0),
    };
    let other = |key: &str| -> Option<Json> {
        match engine.get(glyph, key) {
            Ok(v) => value_to_json(&v),
            Err(_) => engine.model.attachment(glyph, key, true).cloned(),
        }
    };
    GlyphData {
        width: num("width"),
        height: num("height"),
        unicodes: other("unicodes"),
        note: other("note"),
        lib: other("lib"),
        image: other("image"),
        guidelines: other("guidelines"),
    }
}

/// `UFOExporter.doExport()` into `dir` (which should not exist yet).
/// `precision`: decimal places, `None` for no rounding.
pub fn export_ufo(engine: &Engine<Mom>, master: NodeId, io: &dyn Io, dir: &str, precision: Option<i64>) -> Result<(), String> {
    let mut w = UfoWriter::new(io, dir, precision)?;
    for glyph in engine.model.node(master).children.clone() {
        let name = engine.model.node(glyph).id.clone().ok_or("The glyph name is not properly formatted.")?;
        let data = glif_data(engine, glyph);
        let mut draw = |pen: &mut dyn mp_ufo::PointPen| draw_glyph(engine, glyph, pen).map_err(|e| e.to_string());
        w.write_glyph(&name, &data, &mut draw).map_err(|e| format!("glyph {name}: {e}"))?;
    }
    w.finish_glyphs()?;
    if let Some(info) = engine.model.attachment(master, "fontinfo", true) {
        w.write_info(info)?;
    }
    Ok(())
}
