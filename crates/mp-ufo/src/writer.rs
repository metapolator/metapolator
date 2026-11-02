//! A UFO 3 writer with ufoJS's file layout (`UFOWriter` + `GlyphSet`).

use crate::filenames::glyph_name_to_file_name;
use crate::glif::{write_glyph, GlyphData};
use crate::plist;
use crate::PointPen;
use mp_io::{join, Io};
use serde_json::{json, Map, Value as Json};

pub struct UfoWriter<'a> {
    io: &'a dyn Io,
    dir: String,
    /// glyph name -> file name, in write order (`glyphSet.contents`)
    contents: Map<String, Json>,
    pub precision: Option<i64>,
}

impl<'a> UfoWriter<'a> {
    pub fn new(io: &'a dyn Io, dir: &str, precision: Option<i64>) -> Result<Self, String> {
        let w = UfoWriter { io, dir: dir.to_string(), contents: Map::new(), precision };
        // metainfo.plist is written when the writer is created
        w.write_plist("metainfo.plist", &json!({"creator": "org.ufojs.lib", "formatVersion": 3}))?;
        Ok(w)
    }

    fn write_plist(&self, name: &str, v: &Json) -> Result<(), String> {
        self.io.write(&join(&self.dir, name), plist::to_string(v).as_bytes()).map_err(|e| e.to_string())
    }

    pub fn write_glyph(&mut self, name: &str, data: &GlyphData,
                       draw: &mut dyn FnMut(&mut dyn PointPen) -> Result<(), String>) -> Result<(), String> {
        let text = write_glyph(name, data, draw, self.precision).map_err(|e| e.to_string())?;
        let file = match self.contents.get(name).and_then(|v| v.as_str()) {
            Some(f) => f.to_string(),
            None => {
                let f = glyph_name_to_file_name(name, self.contents.keys());
                self.contents.insert(name.to_string(), Json::String(f.clone()));
                f
            }
        };
        self.io.write(&join(&join(&self.dir, "glyphs"), &file), text.as_bytes()).map_err(|e| e.to_string())
    }

    /// `glyphSet.writeContents()` + `writeLayerContents()`
    pub fn finish_glyphs(&self) -> Result<(), String> {
        self.io.write(&join(&join(&self.dir, "glyphs"), "contents.plist"),
                      plist::to_string(&Json::Object(self.contents.clone())).as_bytes()).map_err(|e| e.to_string())?;
        self.write_plist("layercontents.plist", &json!([["public.default", "glyphs"]]))
    }

    pub fn write_info(&self, info: &Json) -> Result<(), String> {
        self.write_plist("fontinfo.plist", info)
    }
}
