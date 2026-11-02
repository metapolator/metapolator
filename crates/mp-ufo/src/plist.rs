//! Property lists as ufoJS `plistLib` writes them.

use crate::xml::{Element, XML_DECLARATION};
use mp_math::js_num;
use serde_json::Value as Json;

const DOCTYPE: &str = "<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">";

/// JS object key enumeration order: array indexes ascending, then insertion order
pub fn js_key_order(m: &serde_json::Map<String, Json>) -> Vec<&String> {
    let is_index = |k: &str| -> Option<u32> {
        if k == "0" { return Some(0); }
        if k.is_empty() || k.starts_with('0') || !k.bytes().all(|b| b.is_ascii_digit()) { return None; }
        k.parse::<u32>().ok().filter(|v| *v != u32::MAX)
    };
    let mut idx: Vec<(u32, &String)> = m.keys().filter_map(|k| is_index(k).map(|v| (v, k))).collect();
    idx.sort();
    let mut out: Vec<&String> = idx.into_iter().map(|(_, k)| k).collect();
    out.extend(m.keys().filter(|k| is_index(k).is_none()));
    out
}

/// `plistLib._createElement(doc, value)`; `None` for values with no plist form
pub fn element(v: &Json) -> Option<Element> {
    Some(match v {
        Json::Null => return None,
        Json::Bool(b) => Element::new(if *b { "true" } else { "false" }),
        Json::Number(n) => {
            let x = n.as_f64().unwrap_or(f64::NAN);
            // value === (value|0)
            if x == ((x as i64 as i32) as f64) {
                Element::new("integer").with_text(js_num(x))
            } else {
                Element::new("real").with_text(js_num(x))
            }
        }
        Json::String(s) => Element::new("string").with_text(s.clone()),
        Json::Array(a) => {
            let mut e = Element::new("array");
            for item in a {
                if let Some(c) = element(item) { e.push(c); }
            }
            e
        }
        Json::Object(m) => {
            let mut e = Element::new("dict");
            for k in js_key_order(m) {
                let v = &m[k];
                if v.is_null() { continue; }
                if let Some(c) = element(v) {
                    e.push(Element::new("key").with_text(k.clone()));
                    e.push(c);
                }
            }
            e
        }
    })
}

/// a complete plist document
pub fn to_string(v: &Json) -> String {
    let mut root = Element::new("plist").attr("version", "1.0");
    if let Some(e) = element(v) { root.push(e); }
    let mut out = String::new();
    out.push_str(XML_DECLARATION);
    out.push('\n');
    out.push_str(DOCTYPE);
    root.serialize(&mut out);
    out
}
