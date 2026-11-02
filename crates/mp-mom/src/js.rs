//! JS value helpers: attachments and MOM data are JSON-like trees whose
//! numbers are JS numbers (f64) and whose objects keep insertion order.

use mp_math::js_num;

pub type Json = serde_json::Value;
pub type JsonMap = serde_json::Map<String, Json>;

/// `String(value)` as used by `[value].join('')` in `cpsTools.makeProperty`
/// (`null`/`undefined` become the empty string inside `join`).
pub fn js_string(v: &Json) -> String {
    match v {
        Json::Null => String::new(),
        Json::Bool(b) => b.to_string(),
        Json::Number(n) => js_num(n.as_f64().unwrap_or(f64::NAN)),
        Json::String(s) => s.clone(),
        Json::Array(a) => a.iter().map(js_string).collect::<Vec<_>>().join(","),
        Json::Object(_) => "[object Object]".into(),
    }
}

pub fn num(x: f64) -> Json {
    serde_json::Number::from_f64(x).map(Json::Number).unwrap_or(Json::Null)
}

/// js-yaml `safeLoad` → JSON value. Numbers become f64 (JS has no ints).
pub fn yaml_to_json(y: &serde_yaml::Value) -> Json {
    use serde_yaml::Value as Y;
    match y {
        Y::Null => Json::Null,
        Y::Bool(b) => Json::Bool(*b),
        Y::Number(n) => num(n.as_f64().unwrap_or(f64::NAN)),
        Y::String(s) => Json::String(s.clone()),
        Y::Sequence(s) => Json::Array(s.iter().map(yaml_to_json).collect()),
        Y::Mapping(m) => {
            let mut out = JsonMap::new();
            for (k, v) in m {
                let key = match k {
                    Y::String(s) => s.clone(),
                    Y::Number(n) => js_num(n.as_f64().unwrap_or(f64::NAN)),
                    Y::Bool(b) => b.to_string(),
                    Y::Null => "null".into(),
                    other => format!("{other:?}"),
                };
                out.insert(key, yaml_to_json(v));
            }
            Json::Object(out)
        }
        Y::Tagged(t) => yaml_to_json(&t.value),
    }
}

pub fn parse_yaml(src: &str) -> Result<Json, String> {
    let y: serde_yaml::Value = serde_yaml::from_str(src).map_err(|e| e.to_string())?;
    Ok(yaml_to_json(&y))
}

/// Keys of a JS object in JS enumeration order: array-index keys ascending
/// first, then the others in insertion order.
pub fn js_key_order(m: &JsonMap) -> Vec<&String> {
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
