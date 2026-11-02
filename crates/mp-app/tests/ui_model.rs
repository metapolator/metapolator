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
use mp_app::params::{op_index, param_index, Elem, Level};
use mp_app::{specimen, zipio, App};
use mp_io::{Io, MemIo};
use serde_json::Value as Json;
use std::path::PathBuf;

fn repo() -> PathBuf { PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..") }
fn json(p: &str) -> Json { serde_json::from_str(&std::fs::read_to_string(repo().join(p)).unwrap()).unwrap() }
fn num(v: &Json) -> Option<f64> { v.as_str().map(|s| s.parse().unwrap()) }
fn level(s: &Json) -> Level { if s == "master" { Level::Master } else { Level::Glyph } }

/// JS `ParameterModel.clone` builds a `_BaseModel` (the prototype's
/// `constructor` is never set), which copies `_effectiveValue` but not the
/// `effectiveValue` accessor: a duplicated master's parameters read as
/// undefined until they are next recomputed. Those JS nulls are accepted
/// for duplicated masters (and counted).
fn same_value(have: Option<f64>, want: &Json, duplicate: bool, undefined_in_js: &mut usize) -> bool {
    if want.is_null() && duplicate && have.is_some() { *undefined_in_js += 1; return true; }
    have == num(want)
}

fn compare(app: &mut App, want: &Json, weight_glyphs: &[String], failures: &mut Vec<String>, undefined_in_js: &mut usize) {
    let step = want["step"].to_string();
    let (w, wt) = (param_index("Width").unwrap(), param_index("Weight").unwrap());
    let masters: Vec<String> = app.masters.iter().map(|m| m.name.clone()).collect();
    let want_masters: Vec<&String> = want["widths"].as_object().unwrap().keys().collect();
    if want_masters.iter().map(|s| s.as_str()).collect::<Vec<_>>() != masters.iter().map(|s| s.as_str()).collect::<Vec<_>>() {
        failures.push(format!("{step}: masters {masters:?}, JS {want_masters:?}"));
        return;
    }
    let mut diffs = 0;
    for m in &masters {
        for (g, v) in want["widths"][m].as_object().unwrap() {
            let have = app.params.get(&Elem::Glyph(m.clone(), g.clone()), w).and_then(|p| p.effective);
            if !same_value(have, v, m != "master-regular", undefined_in_js) {
                diffs += 1;
                if diffs < 5 { failures.push(format!("{step}: {m} {g} Width {have:?}, JS {v}")); }
            }
        }
        for g in weight_glyphs {
            for (i, ps) in want["weights"][m][g].as_array().unwrap().iter().enumerate() {
                for (j, v) in ps.as_array().unwrap().iter().enumerate() {
                    let have = app.params.get(&Elem::Point(m.clone(), g.clone(), i, j), wt).and_then(|p| p.effective);
                    if !same_value(have, v, m != "master-regular", undefined_in_js) {
                        diffs += 1;
                        if diffs < 5 { failures.push(format!("{step}: {m} {g} point {i}/{j} Weight {have:?}, JS {v}")); }
                    }
                }
            }
        }
    }
    if diffs >= 5 { failures.push(format!("{step}: {diffs} differences in all")); }
    let insts: Vec<Json> = app.instances.iter().map(|i| serde_json::json!({
        "name": i.name,
        "axes": i.axes.iter().map(|a| serde_json::json!([a.master, mp_math::js_num(a.axis_value), mp_math::js_num(a.metapolation_value)])).collect::<Vec<_>>(),
    })).collect();
    if Json::Array(insts.clone()) != want["instances"] { failures.push(format!("{step}: instances {insts:?}, JS {}", want["instances"])); }
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
    compare(&mut app, &want[0], &weight_glyphs, &mut failures, &mut undefined_in_js);
    for (k, s) in steps["steps"].as_array().unwrap().iter().enumerate() {
        let a = s.as_array().unwrap();
        match a[0].as_str().unwrap() {
            "selectMasters" => {
                let names: Vec<&str> = a[1].as_array().unwrap().iter().map(|x| x.as_str().unwrap()).collect();
                for m in app.masters.iter_mut() { m.edit = names.contains(&m.name.as_str()); }
                app.selected_glyphs.clear();
            }
            "selectGlyphs" => {
                app.selected_glyphs.clear();
                for p in a[1].as_array().unwrap() {
                    app.select_glyph(p[0].as_str().unwrap(), p[1].as_str().unwrap(), true);
                }
            }
            "set" => {
                let (p, o) = (param_index(a[2].as_str().unwrap()).unwrap(), op_index(a[3].as_str().unwrap()).unwrap());
                app.add_operator(level(&a[1]), p, o);
                app.set_operator_value(level(&a[1]), p, o, a[4].as_f64());
            }
            "remove" => {
                let (p, o) = (param_index(a[2].as_str().unwrap()).unwrap(), op_index(a[3].as_str().unwrap()).unwrap());
                app.remove_operator(level(&a[1]), p, o);
            }
            "duplicate" => { app.duplicate_selected_masters().unwrap(); }
            "designSpace" => app.add_master_to_design_space(a[1].as_str().unwrap()).unwrap(),
            "axes" => {
                let id = app.current_instance.unwrap();
                // the drag of the last (non-slack) slider sets the rest
                let vals = a[1].as_array().unwrap();
                app.set_axis_value(id, vals.len() - 1, vals[vals.len() - 1].as_f64().unwrap()).unwrap();
            }
            other => panic!("unknown step {other}"),
        }
        compare(&mut app, &want[k + 1], &weight_glyphs, &mut failures, &mut undefined_in_js);
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
