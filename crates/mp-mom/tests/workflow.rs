//! The UI workflow end to end, against tests/golden-workflow/
//! (tools/js-reference/workflow-golden.js): import two UFOs as
//! base-/master- pairs, metapolate an instance 50/50, save, export every
//! master as UFO 3 (precision 3), unrounded UFO 2 and OTF.
//!
//! The saved project must hold the same data (YAML compared as data, CPS
//! files as text), every export must be byte-identical, and where the JS
//! export failed (`<master>.<kind>.error`) the Rust export must fail too,
//! having written the same partial files.
use mp_io::{DiskIo, Io, MemIo};
use mp_mom::js::parse_yaml;
use mp_mom::Project;
use std::path::{Path, PathBuf};
use std::rc::Rc;

fn repo() -> PathBuf { PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..") }

fn walk(base: &Path, p: &Path, out: &mut Vec<String>) {
    for e in std::fs::read_dir(p).unwrap() {
        let p = e.unwrap().path();
        if p.is_dir() { walk(base, &p, out); } else { out.push(p.strip_prefix(base).unwrap().to_string_lossy().to_string()); }
    }
}

#[test]
fn merriweather_light_bold_workflow() {
    let golden = repo().join("tests/golden-workflow/merriweather-light-bold");
    let disk = DiskIo::new(repo());
    let mem: Rc<dyn Io> = Rc::new(MemIo::new());
    let mut p = Project::init(mem.clone(), "project").unwrap();
    p.import_ui_master("light", &disk, "data/fonts/subsets/Merriweather-Light-Subset-nop.ufo").unwrap();
    p.import_ui_master("bold", &disk, "data/fonts/subsets/Merriweather-Bold-Subset-nop.ufo").unwrap();
    p.create_instance("instance-0", &[("master-light".into(), 0.5), ("master-bold".into(), 0.5)]).unwrap();
    p.save().unwrap();

    let mut failures = vec![];
    let mut files = vec![];
    walk(&golden, &golden, &mut files);
    // the project
    let mut checked = 0;
    for f in files.iter().filter(|f| f.starts_with("project/")) {
        let want = std::fs::read_to_string(golden.join(f)).unwrap();
        let have = match mem.read_string(f) { Ok(h) => h, Err(e) => { failures.push(format!("{f}: {e}")); continue } };
        checked += 1;
        let same = if f.ends_with(".yaml") { parse_yaml(&want).unwrap() == parse_yaml(&have).unwrap() } else { want == have };
        if !same { failures.push(format!("{f} differs")); }
    }
    println!("project: {checked} files compared");
    // exports
    let manifest: serde_json::Value = serde_json::from_str(&std::fs::read_to_string(golden.join("manifest.json")).unwrap()).unwrap();
    let fontinfo = p.project_fontinfo();
    let mut same = 0;
    for m in manifest["masters"].as_array().unwrap() {
        let m = m.as_str().unwrap();
        let node = p.master_by_name(m).unwrap();
        for kind in ["ufo", "ufo2", "otf"] {
            let out = MemIo::new();
            let target = format!("{m}.{kind}");
            let result = match kind {
                "ufo" => mp_mom::export::export_ufo_format(&p.engine, node, &out, &target, Some(3), 3),
                "ufo2" => mp_mom::export::export_ufo_format(&p.engine, node, &out, &target, None, 2),
                _ => mp_mom::export_otf::export_otf(&p.engine, node, &fontinfo).and_then(|b| out.write(&target, &b).map_err(|e| e.to_string())),
            };
            let js_failed = golden.join(format!("{target}.error")).exists();
            match (&result, js_failed) {
                (Ok(()), true) => { failures.push(format!("{target}: Rust exported, JS failed")); continue }
                (Err(e), false) => { failures.push(format!("{target}: Rust failed: {e}")); continue }
                (Err(_), true) if kind != "ufo" => { same += 1; continue } // JS wrote nothing
                _ => {}
            }
            // compare (partial on failure) output
            let want_files: Vec<&String> = files.iter().filter(|f| f.starts_with(&format!("{target}/")) || **f == target).collect();
            let mut have_files = out.files();
            have_files.sort();
            let mut wf: Vec<String> = want_files.iter().map(|s| s.to_string()).collect();
            wf.sort();
            if wf != have_files { failures.push(format!("{target}: files differ: JS {} Rust {}", wf.len(), have_files.len())); continue; }
            for f in &wf {
                if std::fs::read(golden.join(f)).unwrap() == out.read(f).unwrap() { same += 1; }
                else { failures.push(format!("{f} differs")); }
            }
        }
    }
    println!("exports: {same} files/failures identical");
    for f in failures.iter().take(15) { println!("{f}"); }
    assert!(failures.is_empty(), "{} failures", failures.len());
}
