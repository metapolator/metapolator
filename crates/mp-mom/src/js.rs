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

/// Dump a JSON value as YAML in js-yaml's `safeDump` style (block style,
/// two-space indentation). Strings that YAML could read as something else
/// are single-quoted, so js-yaml and serde_yaml both read back the same data.
pub fn to_yaml(v: &Json) -> String {
    let mut out = String::new();
    yaml_value(v, 0, &mut out, true);
    if !out.ends_with('\n') { out.push('\n'); }
    out
}

fn yaml_scalar(v: &Json) -> Option<String> {
    Some(match v {
        Json::Null => "null".into(),
        Json::Bool(b) => b.to_string(),
        Json::Number(n) => {
            let x = n.as_f64().unwrap_or(f64::NAN);
            if x.is_nan() { ".nan".into() } else if x == f64::INFINITY { ".inf".into() }
            else if x == f64::NEG_INFINITY { "-.inf".into() } else { js_num(x) }
        }
        Json::String(s) => yaml_string(s),
        Json::Array(a) if a.is_empty() => "[]".into(),
        Json::Object(m) if m.is_empty() => "{}".into(),
        _ => return None,
    })
}

fn yaml_string(s: &str) -> String {
    let plain_ok = !s.is_empty()
        && !s.starts_with([' ', '-', '?', ':', ',', '[', ']', '{', '}', '#', '&', '*', '!', '|', '>', '\'', '"', '%', '@', '`'])
        && !s.ends_with(' ')
        && !s.contains(": ") && !s.contains(" #") && !s.ends_with(':')
        && !s.chars().any(|c| c.is_control())
        && serde_yaml::from_str::<serde_yaml::Value>(s).map(|v| matches!(v, serde_yaml::Value::String(ref t) if t == s)).unwrap_or(false)
        && !matches!(s.to_ascii_lowercase().as_str(), "y" | "n" | "yes" | "no" | "on" | "off" | "true" | "false" | "null" | "~");
    if plain_ok { return s.to_string(); }
    if !s.chars().any(|c| c.is_control()) {
        return format!("'{}'", s.replace('\'', "''"));
    }
    serde_json::to_string(s).unwrap()
}

fn yaml_value(v: &Json, indent: usize, out: &mut String, top: bool) {
    let pad = " ".repeat(indent);
    match v {
        Json::Array(a) if !a.is_empty() => {
            for item in a {
                out.push_str(&pad);
                out.push('-');
                match yaml_scalar(item) {
                    Some(s) => { out.push(' '); out.push_str(&s); out.push('\n'); }
                    None => {
                        // nested collection: compact form like js-yaml
                        let mut inner = String::new();
                        yaml_value(item, indent + 2, &mut inner, false);
                        let trimmed = inner.trim_start_matches(' ');
                        out.push(' ');
                        out.push_str(trimmed);
                    }
                }
            }
        }
        Json::Object(m) if !m.is_empty() => {
            for (k, val) in m {
                out.push_str(&pad);
                out.push_str(&yaml_string(k));
                out.push(':');
                match yaml_scalar(val) {
                    Some(s) => { out.push(' '); out.push_str(&s); out.push('\n'); }
                    None => {
                        out.push('\n');
                        yaml_value(val, indent + 2, out, false);
                    }
                }
            }
        }
        other => {
            let _ = top;
            out.push_str(&pad);
            out.push_str(&yaml_scalar(other).unwrap_or_default());
            out.push('\n');
        }
    }
}
