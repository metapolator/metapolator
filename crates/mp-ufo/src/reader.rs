//! Reading UFOs like ufoJS does (`UFOReader`, `GlyphSet`, `readGlyph`,
//! `plistLib`), as far as Metapolator's importer uses it: metainfo, fontinfo
//! (with the UFO 2 → 3 conversion and ufoJS's attribute order), the default
//! layer's glyph set, and GLIF 1/2 glyphs drawn into a point pen.

use crate::filenames;
use mp_io::{join, Io};
use roxmltree::{Document, Node};
use serde_json::{Map, Value as Json};

pub type JsonMap = Map<String, Json>;

#[derive(Debug, Clone, PartialEq)]
pub struct UfoError(pub String);

impl std::fmt::Display for UfoError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { f.write_str(&self.0) }
}
impl std::error::Error for UfoError {}

type R<T> = Result<T, UfoError>;

fn err(m: impl Into<String>) -> UfoError { UfoError(m.into()) }

fn num(x: f64) -> Json { serde_json::Number::from_f64(x).map(Json::Number).unwrap_or(Json::Null) }

/// `main.isFloatString` + `parseFloat`, rejecting non-finite values
pub fn to_number(s: &str) -> R<f64> {
    let b = s.as_bytes();
    let mut i = 0;
    if matches!(b.first(), Some(b'+') | Some(b'-')) { i += 1; }
    let d1 = b[i..].iter().take_while(|c| c.is_ascii_digit()).count();
    let mut j = i + d1;
    let mut ok = d1 > 0;
    if b.get(j) == Some(&b'.') {
        let d2 = b[j + 1..].iter().take_while(|c| c.is_ascii_digit()).count();
        if d2 > 0 || d1 > 0 { ok = true; j += 1 + d2; }
    }
    if ok && matches!(b.get(j), Some(b'e') | Some(b'E')) {
        let mut k = j + 1;
        if matches!(b.get(k), Some(b'+') | Some(b'-')) { k += 1; }
        let d = b[k..].iter().take_while(|c| c.is_ascii_digit()).count();
        if d > 0 { j = k + d; } else { ok = false; }
    }
    if !ok || j != b.len() {
        return Err(err(format!("Could not convert \"{s}\" to an int or float.")));
    }
    let v: f64 = s.parse().map_err(|_| err(format!("Could not convert \"{s}\" to an int or float.")))?;
    if !v.is_finite() { return Err(err(format!("Could not convert \"{s}\" to an int or float."))); }
    Ok(v)
}

fn elements<'a, 'i>(n: Node<'a, 'i>) -> impl Iterator<Item = Node<'a, 'i>> + use<'a, 'i> {
    n.children().filter(|c| c.is_element())
}

// ------------------------------------------------------------------ plist

/// `plistLib.readPlistElement`
pub fn read_plist_element(e: Node) -> R<Json> {
    Ok(match e.tag_name().name() {
        "array" => Json::Array(elements(e).map(read_plist_element).collect::<R<_>>()?),
        "dict" => {
            let mut m = JsonMap::new();
            let mut key: Option<String> = None;
            for c in elements(e) {
                if c.tag_name().name() == "key" && key.is_none() {
                    key = Some(c.text().unwrap_or("").to_string());
                } else if let Some(k) = key.take() {
                    m.insert(k, read_plist_element(c)?);
                }
            }
            Json::Object(m)
        }
        "string" | "data" | "date" => Json::String(text_content(e)),
        "integer" => num(js_parse_int(&text_content(e))),
        "real" => num(js_parse_float(&text_content(e))),
        "true" => Json::Bool(true),
        "false" => Json::Bool(false),
        other => return Err(err(format!("A PlistElement of type \"{other}\" is not supported."))),
    })
}

fn text_content(e: Node) -> String {
    e.descendants().filter(|n| n.is_text()).map(|n| n.text().unwrap_or("")).collect()
}

fn js_parse_int(s: &str) -> f64 {
    let t = s.trim_start();
    let (neg, rest) = match t.as_bytes().first() { Some(b'-') => (true, &t[1..]), Some(b'+') => (false, &t[1..]), _ => (false, t) };
    let d: String = rest.chars().take_while(|c| c.is_ascii_digit()).collect();
    match d.parse::<f64>() { Ok(v) => if neg { -v } else { v }, Err(_) => f64::NAN }
}

fn js_parse_float(s: &str) -> f64 {
    let t = s.trim_start();
    // longest prefix that parses
    let mut best = f64::NAN;
    for end in (1..=t.len()).rev() {
        if !t.is_char_boundary(end) { continue; }
        if let Ok(v) = t[..end].parse::<f64>() {
            if !t[..end].contains(char::is_alphabetic) || t[..end].contains(['e', 'E']) { best = v; break; }
        }
    }
    best
}

pub fn parse_plist(text: &str) -> R<Json> {
    let doc = Document::parse_with_options(text, roxmltree::ParsingOptions { allow_dtd: true, ..Default::default() })
        .map_err(|e| err(format!("XML: {e}")))?;
    let root = doc.root_element();
    if root.tag_name().name() != "plist" {
        return Err(err(format!("The documentElement is expected to be \"plist\", but it is \"{}\"", root.tag_name().name())));
    }
    let first = elements(root).next();
    let result = match first {
        Some(e) => read_plist_element(e),
        None => Ok(Json::Null),
    };
    result
}

// ------------------------------------------------------------------ fontinfo

/// `fontInfoAttributesVersion2ValueData` keys, in ufoJS order
pub const FONTINFO_V2: &[&str] = &[
    "familyName", "styleName", "styleMapFamilyName", "styleMapStyleName", "versionMajor", "versionMinor", "year",
    "copyright", "trademark", "unitsPerEm", "descender", "xHeight", "capHeight", "ascender", "italicAngle", "note",
    "openTypeHeadCreated", "openTypeHeadLowestRecPPEM", "openTypeHeadFlags", "openTypeHheaAscender",
    "openTypeHheaDescender", "openTypeHheaLineGap", "openTypeHheaCaretSlopeRise", "openTypeHheaCaretSlopeRun",
    "openTypeHheaCaretOffset", "openTypeNameDesigner", "openTypeNameDesignerURL", "openTypeNameManufacturer",
    "openTypeNameManufacturerURL", "openTypeNameLicense", "openTypeNameLicenseURL", "openTypeNameVersion",
    "openTypeNameUniqueID", "openTypeNameDescription", "openTypeNamePreferredFamilyName",
    "openTypeNamePreferredSubfamilyName", "openTypeNameCompatibleFullName", "openTypeNameSampleText",
    "openTypeNameWWSFamilyName", "openTypeNameWWSSubfamilyName", "openTypeOS2WidthClass", "openTypeOS2WeightClass",
    "openTypeOS2Selection", "openTypeOS2VendorID", "openTypeOS2Panose", "openTypeOS2FamilyClass",
    "openTypeOS2UnicodeRanges", "openTypeOS2CodePageRanges", "openTypeOS2TypoAscender", "openTypeOS2TypoDescender",
    "openTypeOS2TypoLineGap", "openTypeOS2WinAscent", "openTypeOS2WinDescent", "openTypeOS2Type",
    "openTypeOS2SubscriptXSize", "openTypeOS2SubscriptYSize", "openTypeOS2SubscriptXOffset",
    "openTypeOS2SubscriptYOffset", "openTypeOS2SuperscriptXSize", "openTypeOS2SuperscriptYSize",
    "openTypeOS2SuperscriptXOffset", "openTypeOS2SuperscriptYOffset", "openTypeOS2StrikeoutSize",
    "openTypeOS2StrikeoutPosition", "openTypeVheaVertTypoAscender", "openTypeVheaVertTypoDescender",
    "openTypeVheaVertTypoLineGap", "openTypeVheaCaretSlopeRise", "openTypeVheaCaretSlopeRun",
    "openTypeVheaCaretOffset", "postscriptFontName", "postscriptFullName", "postscriptSlantAngle",
    "postscriptUniqueID", "postscriptUnderlineThickness", "postscriptUnderlinePosition", "postscriptIsFixedPitch",
    "postscriptBlueValues", "postscriptOtherBlues", "postscriptFamilyBlues", "postscriptFamilyOtherBlues",
    "postscriptStemSnapH", "postscriptStemSnapV", "postscriptBlueFuzz", "postscriptBlueShift", "postscriptBlueScale",
    "postscriptForceBold", "postscriptDefaultWidthX", "postscriptNominalWidthX", "postscriptWeightName",
    "postscriptDefaultCharacter", "postscriptWindowsCharacterSet", "macintoshFONDFamilyID", "macintoshFONDName",
];

/// additional `fontInfoAttributesVersion3ValueData` keys (appended in this order)
pub const FONTINFO_V3_EXTRA: &[&str] = &[
    "openTypeGaspRangeRecords", "openTypeNameRecords", "woffMajorVersion", "woffMinorVersion", "woffMetadataUniqueID",
    "woffMetadataVendor", "woffMetadataCredits", "woffMetadataDescription", "woffMetadataLicense",
    "woffMetadataCopyright", "woffMetadataTrademark", "woffMetadataLicensee", "woffMetadataExtensions", "guidelines",
];

const UFO2_TO_3_NON_NEGATIVE_INT: &[&str] = &["versionMinor", "openTypeHeadLowestRecPPEM", "openTypeOS2WinAscent", "openTypeOS2WinDescent"];
const UFO2_TO_3_NON_NEGATIVE: &[&str] = &["unitsPerEm"];
const UFO2_TO_3_FLOAT_TO_INT: &[&str] = &[
    "openTypeHeadLowestRecPPEM", "openTypeHheaAscender", "openTypeHheaDescender", "openTypeHheaLineGap",
    "openTypeHheaCaretOffset", "openTypeOS2TypoAscender", "openTypeOS2TypoDescender", "openTypeOS2TypoLineGap",
    "openTypeOS2WinAscent", "openTypeOS2WinDescent", "openTypeOS2SubscriptXSize", "openTypeOS2SubscriptYSize",
    "openTypeOS2SubscriptXOffset", "openTypeOS2SubscriptYOffset", "openTypeOS2SuperscriptXSize",
    "openTypeOS2SuperscriptYSize", "openTypeOS2SuperscriptXOffset", "openTypeOS2SuperscriptYOffset",
    "openTypeOS2StrikeoutSize", "openTypeOS2StrikeoutPosition", "openTypeVheaVertTypoAscender",
    "openTypeVheaVertTypoDescender", "openTypeVheaVertTypoLineGap", "openTypeVheaCaretOffset",
];

fn convert_v2_to_v3(attr: &str, v: &Json) -> Json {
    let Some(x) = v.as_f64() else { return v.clone() };
    let mut x = x;
    if UFO2_TO_3_FLOAT_TO_INT.contains(&attr) { x = crate::round::js_math_round(x); }
    if UFO2_TO_3_NON_NEGATIVE_INT.contains(&attr) { x = crate::round::js_math_round(x.abs()); }
    else if UFO2_TO_3_NON_NEGATIVE.contains(&attr) { x = x.abs(); }
    num(x)
}

// ------------------------------------------------------------------ glyphs

/// What the GLIF reader passes to the outline consumer.
pub trait ReadPen {
    fn begin_path(&mut self, identifier: Option<String>);
    fn add_point(&mut self, pt: [f64; 2], segment_type: Option<String>, smooth: bool, name: Option<String>, identifier: Option<String>);
    fn end_path(&mut self);
    fn add_component(&mut self, base: &str, transformation: [f64; 6], identifier: Option<String>);
}

#[derive(Debug, Clone)]
struct PointAttrs { x: f64, y: f64, segment_type: Option<String>, smooth: bool, name: Option<String>, identifier: Option<String> }

/// `_validateAndMassagePointStructures` (the parts that change the data)
fn massage_points(contour: Node, open_leniency: bool) -> R<Vec<PointAttrs>> {
    let mut out = vec![];
    for (i, p) in elements(contour).enumerate() {
        if p.tag_name().name() != "point" { return Err(err("Unknown child element of contour element.")); }
        let get = |k: &str| p.attribute(k);
        let x = to_number(get("x").ok_or_else(|| err("Required x attribute is missing in point element."))?)?;
        let y = to_number(get("y").ok_or_else(|| err("Required y attribute is missing in point element."))?)?;
        let st = match get("type") { None | Some("offcurve") => None, Some(t) => Some(t.to_string()) };
        if let Some(t) = &st {
            if !matches!(t.as_str(), "move" | "line" | "curve" | "qcurve") { return Err(err(format!("Unknown point type: {t}"))); }
            if t == "move" && i != 0 { return Err(err("A move point occurs after the first point in the contour.")); }
        }
        let smooth = match get("smooth") { None => false, Some("yes") => true, Some("no") => false, Some(s) => return Err(err(format!("Unknown point smooth value: {s}"))) };
        if smooth && st.is_none() { return Err(err("smooth attribute set in an offcurve point.")); }
        out.push(PointAttrs { x, y, segment_type: st, smooth, name: get("name").map(String::from), identifier: get("identifier").map(String::from) });
    }
    if open_leniency && out.first().and_then(|p| p.segment_type.as_deref()) == Some("move") {
        // drop trailing off-curve points of an open contour
        while out.last().map(|p| p.segment_type.is_none()).unwrap_or(false) { out.pop(); }
    }
    Ok(out)
}

const TRANSFORMATION_INFO: [(&str, f64); 6] = [
    ("xScale", 1.0), ("xyScale", 0.0), ("yxScale", 0.0), ("yScale", 1.0), ("xOffset", 0.0), ("yOffset", 0.0),
];

fn component_transform(c: Node) -> R<[f64; 6]> {
    let mut t = [0.0; 6];
    for (i, (attr, default)) in TRANSFORMATION_INFO.iter().enumerate() {
        t[i] = match c.attribute(*attr) { Some(s) => to_number(s)?, None => *default };
    }
    Ok(t)
}

/// `readGlyphFromString` into a glyph object (attributes in JS assignment
/// order) while drawing the outline into `pen`.
pub fn read_glif(text: &str, pen: Option<&mut dyn ReadPen>) -> R<JsonMap> {
    let doc = Document::parse(text).map_err(|e| err(format!("GLIF XML: {e}")))?;
    let root = doc.root_element();
    if root.tag_name().name() != "glyph" { return Err(err("The root element is not glyph.")); }
    let format = root.attribute("format").map(to_number).transpose()?.unwrap_or(1.0);
    let mut g = JsonMap::new();
    let name = root.attribute("name").filter(|n| !n.is_empty()).ok_or_else(|| err("Empty glyph name in GLIF."))?;
    g.insert("name".into(), Json::String(name.into()));
    let mut unicodes: Vec<f64> = vec![];
    let mut anchors: Vec<Json> = vec![];
    let mut guidelines: Vec<Json> = vec![];
    let mut pen = pen;
    for node in elements(root) {
        match node.tag_name().name() {
            "outline" => {
                if let Some(p) = pen.as_deref_mut() {
                    if format < 2.0 {
                        let a = build_outline_format1(p, node)?;
                        if !a.is_empty() { g.insert("anchors".into(), Json::Array(a)); }
                    } else {
                        build_outline_format2(p, node)?;
                    }
                }
            }
            "advance" => {
                for k in ["width", "height"] {
                    let v = match node.attribute(k) { None => 0.0, Some(s) => to_number(s)? };
                    g.insert(k.into(), num(v));
                }
            }
            "unicode" => {
                let v = i64::from_str_radix(node.attribute("hex").unwrap_or(""), 16)
                    .map_err(|_| err("Illegal value for hex attribute of unicode element."))? as f64;
                if !unicodes.contains(&v) { unicodes.push(v); }
            }
            "note" => {
                let s: Vec<String> = elements(node).map(text_content).collect::<Vec<_>>().join("\n")
                    .split('\n').map(|l| l.trim().to_string()).collect();
                g.insert("note".into(), Json::String(s.join("\n")));
            }
            "lib" => {
                let mut els = elements(node);
                let d = els.next().ok_or_else(|| err("lib node may have only one child"))?;
                if d.tag_name().name() != "dict" { return Err(err("The child node of lib must be \"dict\"")); }
                g.insert("lib".into(), read_plist_element(d)?);
            }
            "guideline" if format >= 2.0 => {
                let mut m = JsonMap::new();
                for a in node.attributes() {
                    let v = if matches!(a.name(), "x" | "y" | "angle") { num(to_number(a.value())?) } else { Json::String(a.value().into()) };
                    m.insert(a.name().into(), v);
                }
                guidelines.push(Json::Object(m));
            }
            "anchor" if format >= 2.0 => {
                let mut m = JsonMap::new();
                for a in node.attributes() {
                    let v = if matches!(a.name(), "x" | "y") { num(to_number(a.value())?) } else { Json::String(a.value().into()) };
                    m.insert(a.name().into(), v);
                }
                anchors.push(Json::Object(m));
            }
            "image" if format >= 2.0 => {
                let mut m = JsonMap::new();
                for a in node.attributes() {
                    let v = if TRANSFORMATION_INFO.iter().any(|(k, _)| *k == a.name()) { num(to_number(a.value())?) } else { Json::String(a.value().into()) };
                    m.insert(a.name().into(), v);
                }
                g.insert("image".into(), Json::Object(m));
            }
            other => return Err(err(format!("Unknown element in GLIF: {other}."))),
        }
    }
    if !guidelines.is_empty() { g.insert("guidelines".into(), Json::Array(guidelines)); }
    if !anchors.is_empty() { g.insert("anchors".into(), Json::Array(anchors)); }
    if !unicodes.is_empty() { g.insert("unicodes".into(), Json::Array(unicodes.into_iter().map(num).collect())); }
    Ok(g)
}

fn build_outline_format1(pen: &mut dyn ReadPen, outline: Node) -> R<Vec<Json>> {
    let mut anchors = vec![];
    for node in elements(outline) {
        match node.tag_name().name() {
            "contour" => {
                let kids: Vec<Node> = elements(node).collect();
                if kids.len() == 1 {
                    let child = kids[0];
                    if child.tag_name().name() == "point" && child.attribute("type") == Some("move") {
                        let mut m = JsonMap::new();
                        m.insert("x".into(), num(to_number(child.attribute("x").ok_or_else(|| err("Required x attribute is missing in point element."))?)?));
                        m.insert("y".into(), num(to_number(child.attribute("y").ok_or_else(|| err("Required y attribute is missing in point element."))?)?));
                        m.insert("name".into(), child.attribute("name").map(|s| Json::String(s.into())).unwrap_or(Json::Null));
                        anchors.push(Json::Object(m));
                    }
                } else {
                    pen.begin_path(None);
                    if !kids.is_empty() {
                        for p in massage_points(node, true)? {
                            pen.add_point([p.x, p.y], p.segment_type, p.smooth, p.name, None);
                        }
                    }
                    pen.end_path();
                }
            }
            "component" => {
                let base = node.attribute("base").ok_or_else(|| err("The base attribute is not defined in the component."))?;
                pen.add_component(base, component_transform(node)?, None);
            }
            other => return Err(err(format!("Unknown element in outline element {other}"))),
        }
    }
    Ok(anchors)
}

fn build_outline_format2(pen: &mut dyn ReadPen, outline: Node) -> R<()> {
    for node in elements(outline) {
        match node.tag_name().name() {
            "contour" => {
                pen.begin_path(node.attribute("identifier").map(String::from));
                for p in massage_points(node, false)? {
                    pen.add_point([p.x, p.y], p.segment_type, p.smooth, p.name, p.identifier);
                }
                pen.end_path();
            }
            "component" => {
                let base = node.attribute("base").ok_or_else(|| err("The base attribute is not defined in the component."))?;
                pen.add_component(base, component_transform(node)?, node.attribute("identifier").map(String::from));
            }
            other => return Err(err(format!("Unknown element in outline element: {other}"))),
        }
    }
    Ok(())
}

// ------------------------------------------------------------------ the UFO

pub struct UfoReader<'a> {
    io: &'a dyn Io,
    pub path: String,
    pub format_version: i64,
}

impl<'a> UfoReader<'a> {
    pub fn new(io: &'a dyn Io, path: &str) -> R<Self> {
        let meta = parse_plist(&io.read_string(&join(path, "metainfo.plist")).map_err(|e| err(e.to_string()))?)?;
        let fv = meta.get("formatVersion").and_then(|v| v.as_f64())
            .ok_or_else(|| err("metainfo.plist has no formatVersion"))? as i64;
        if !(1..=3).contains(&fv) { return Err(err(format!("Unsupported UFO format ({fv}) in {path}."))); }
        Ok(UfoReader { io, path: path.to_string(), format_version: fv })
    }

    fn plist_or(&self, name: &str, default: Json) -> R<Json> {
        match self.io.read_string(&join(&self.path, name)) {
            Ok(s) => parse_plist(&s),
            Err(mp_io::IoError::NotFound(_)) => Ok(default),
            Err(e) => Err(err(e.to_string())),
        }
    }

    /// `readInfo()` as ufoJS returns it (UFO 2 data converted to UFO 3)
    pub fn read_info(&self) -> R<JsonMap> {
        let data = self.plist_or("fontinfo.plist", Json::Object(JsonMap::new()))?;
        let data = data.as_object().cloned().unwrap_or_default();
        let mut out = JsonMap::new();
        match self.format_version {
            2 => for attr in FONTINFO_V2 {
                if let Some(v) = data.get(*attr) { out.insert(attr.to_string(), convert_v2_to_v3(attr, v)); }
            },
            3 => for attr in FONTINFO_V2.iter().chain(FONTINFO_V3_EXTRA) {
                if let Some(v) = data.get(*attr) { out.insert(attr.to_string(), v.clone()); }
            },
            _ => return Err(err("readInfo formatVersion 1 is not supported")),
        }
        Ok(out)
    }

    pub fn read_groups(&self) -> R<JsonMap> {
        Ok(self.plist_or("groups.plist", Json::Object(JsonMap::new()))?.as_object().cloned().unwrap_or_default())
    }

    /// the directory of the default layer
    pub fn default_layer_dir(&self) -> R<String> {
        if self.format_version < 3 { return Ok("glyphs".into()); }
        let lc = self.plist_or("layercontents.plist", Json::Array(vec![]))?;
        for item in lc.as_array().cloned().unwrap_or_default() {
            let pair = item.as_array().cloned().unwrap_or_default();
            if pair.first().and_then(|v| v.as_str()) == Some("public.default") {
                return Ok(pair.get(1).and_then(|v| v.as_str()).unwrap_or("glyphs").to_string());
            }
        }
        Ok("glyphs".into())
    }

    /// `getGlyphSet()`: glyph name → file name, in `contents.plist` order;
    /// fails like ufoJS when a referenced file does not exist
    pub fn glyph_set(&self) -> R<GlyphSet<'a>> {
        let dir = join(&self.path, &self.default_layer_dir()?);
        let contents = parse_plist(&self.io.read_string(&join(&dir, "contents.plist")).map_err(|e| err(e.to_string()))?)?;
        let contents = contents.as_object().cloned().ok_or_else(|| err("contents.plist is not properly formatted"))?;
        for (name, file) in &contents {
            let f = file.as_str().ok_or_else(|| err(format!("contents.plist is not properly formatted the value at \"{name}\"")))?;
            if !self.io.exists(&join(&dir, f)) {
                return Err(err(format!("GlifLibError: contents.plist references a file that does not exist: {}", join(&dir, f))));
            }
        }
        Ok(GlyphSet { io: self.io, dir, contents })
    }
}

pub struct GlyphSet<'a> {
    io: &'a dyn Io,
    pub dir: String,
    pub contents: JsonMap,
}

impl GlyphSet<'_> {
    /// `glyphSet.keys()` (JS object key order)
    pub fn keys(&self) -> Vec<String> {
        crate::plist::js_key_order(&self.contents).into_iter().cloned().collect()
    }
    pub fn read_glyph(&self, name: &str, pen: Option<&mut dyn ReadPen>) -> R<JsonMap> {
        let file = self.contents.get(name).and_then(|f| f.as_str())
            .ok_or_else(|| err(format!("The glyph \"{name}\" is not in the glyph set.")))?;
        let text = self.io.read_string(&join(&self.dir, file)).map_err(|e| err(e.to_string()))?;
        read_glif(&text, pen)
    }
}

/// re-exported for writers that need the same name translation
pub use filenames::glyph_name_to_file_name;
