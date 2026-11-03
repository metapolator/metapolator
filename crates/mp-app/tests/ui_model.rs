//! The UI model against the JS golden of tests/golden-ui-model/
//! (tools/js-reference/ui-model-golden.js, steps in
//! tools/js-reference/ui-model-steps.json): parameter operators on master
//! and glyph level, master duplication, a design space with an instance,
//! and the specimen text logic.
//!
//! After every step the effective Width of every glyph and the effective
//! Weight of every point of a few glyphs must equal the JS values exactly;
//! after the last step every master's and the instance's UI exports
//! (unrounded UFO 2, OTF) must be byte-identical.
use mp_app::{specimen, zipio, App};
use mp_io::{Io, MemIo};
use serde_json::Value as Json;
use std::path::PathBuf;

fn repo() -> PathBuf { PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..") }
fn json(p: &str) -> Json { serde_json::from_str(&std::fs::read_to_string(repo().join(p)).unwrap()).unwrap() }

/// JS `ParameterModel.clone` builds a `_BaseModel` (the prototype's
/// `constructor` is never set), which copies `_effectiveValue` but not the
/// `effectiveValue` accessor: a duplicated master's parameters read as
/// undefined until they are next recomputed. Those JS nulls are accepted
/// for duplicated masters (and counted).
fn compare(have: &Json, want: &Json, failures: &mut Vec<String>, undefined_in_js: &mut usize) {
    let step = want["step"].to_string();
    let mut diffs = vec![];
    fn walk(path: &str, h: &Json, w: &Json, dup: bool, diffs: &mut Vec<String>, undef: &mut usize) {
        match (h, w) {
            (Json::Object(a), Json::Object(b)) => {
                if a.keys().collect::<Vec<_>>() != b.keys().collect::<Vec<_>>() { diffs.push(format!("{path}: keys differ")); return; }
                for (k, v) in a { walk(&format!("{path}/{k}"), v, &b[k], dup || (path == "/widths" || path == "/weights") && k != "master-regular", diffs, undef); }
            }
            (Json::Array(a), Json::Array(b)) if a.len() == b.len() => {
                for (i, v) in a.iter().enumerate() { walk(&format!("{path}/{i}"), v, &b[i], dup, diffs, undef); }
            }
            (Json::String(_), Json::Null) if dup => *undef += 1,
            _ => if h != w { diffs.push(format!("{path}: {h}, JS {w}")) },
        }
    }
    for k in ["widths", "weights", "instances"] {
        walk(&format!("/{k}"), &have[k], &want[k], false, &mut diffs, undefined_in_js);
    }
    for d in diffs.iter().take(4) { failures.push(format!("{step}: {d}")); }
    if diffs.len() > 4 { failures.push(format!("{step}: {} differences in all", diffs.len())); }
}

#[test]
fn ui_model_matches_js() {
    let golden = repo().join("tests/golden-ui-model/default-project");
    let steps = json("tools/js-reference/ui-model-steps.json");
    let want = json("tests/golden-ui-model/default-project/steps.json");
    let weight_glyphs: Vec<String> = steps["weightGlyphs"].as_array().unwrap().iter().map(|g| g.as_str().unwrap().to_string()).collect();
    let mut app = App::with_default_project().unwrap();
    app.params.ensure_measured(&app.project, "master-regular");
    let mut failures = vec![];
    let mut undefined_in_js = 0;
    compare(&app.ui_snapshot(&weight_glyphs), &want[0], &mut failures, &mut undefined_in_js);
    for (k, s) in steps["steps"].as_array().unwrap().iter().enumerate() {
        app.apply_ui_step(s).unwrap();
        compare(&app.ui_snapshot(&weight_glyphs), &want[k + 1], &mut failures, &mut undefined_in_js);
    }

    // exports after the last step
    let manifest = json("tests/golden-ui-model/default-project/manifest.json");
    let mut same = 0;
    for name in manifest["exported"].as_array().unwrap() {
        let name = name.as_str().unwrap();
        let otf = app.export_otf(name).unwrap();
        if otf == std::fs::read(golden.join(format!("{name}.otf"))).unwrap() { same += 1 } else { failures.push(format!("{name}.otf differs")) }
        let zip = app.export_ufo_zip(name, name).unwrap();
        let out = MemIo::new();
        zipio::unpack(&zip, &out, "").unwrap();
        let mut n = 0;
        for f in out.files() {
            let rel = f.strip_prefix(&format!("{name}.ufo/")).unwrap();
            n += 1;
            match std::fs::read(golden.join(format!("{name}.ufo2/{rel}"))) {
                Ok(w) if w == out.read(&f).unwrap() => same += 1,
                _ => if failures.len() < 40 { failures.push(format!("{name} UFO 2: {rel} differs")) },
            }
        }
        let want_n = walkdir(&golden.join(format!("{name}.ufo2")));
        if n != want_n { failures.push(format!("{name}: {n} UFO files, JS {want_n}")) }
    }
    println!("exports: {same} files identical; {undefined_in_js} values undefined in the JS after duplication");

    // the specimen
    for case in json("tests/golden-ui-model/default-project/specimen.json").as_array().unwrap() {
        let have = specimen::glyphs_out(case["text"].as_str().unwrap(), case["filter"].as_str().unwrap(), case["strict"].as_u64().unwrap() as u8);
        let want: Vec<String> = case["glyphsOut"].as_array().unwrap().iter().map(|g| g.as_str().unwrap_or("").to_string()).collect();
        if have != want { failures.push(format!("specimen {case}: {have:?}")) }
    }
    assert!(failures.is_empty(), "{} failures:\n{}", failures.len(), failures.join("\n"));
    assert!(same > 500, "{same}");
}

fn walkdir(p: &std::path::Path) -> usize {
    std::fs::read_dir(p).unwrap().map(|e| { let p = e.unwrap().path(); if p.is_dir() { walkdir(&p) } else { 1 } }).sum()
}
