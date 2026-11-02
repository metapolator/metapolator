//! End-to-end parity: load each project in tests/fixtures/, open every
//! master, export it as UFO and compare every file byte for byte with the
//! JS reference export in tests/golden/ (tools/js-reference/regen-golden.sh).
use mp_io::{DiskIo, Io, MemIo};
use mp_mom::export::export_ufo;
use mp_mom::Project;
use std::path::PathBuf;
use std::rc::Rc;

fn repo() -> PathBuf { PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..") }

/// the JS export rounds to 3 decimals (Project.exportUFOInstance passes
/// formatVersion as precision; see tools/js-reference/README.md)
const PRECISION: Option<i64> = Some(3);

fn check_fixture(name: &str) -> (usize, Vec<String>) {
    let root = repo();
    let io: Rc<dyn Io> = Rc::new(DiskIo::new(&root));
    let mut project = Project::load(io, &format!("tests/fixtures/{name}")).expect("load project");
    project.open_all_masters().expect("open masters");
    let golden = root.join("tests/golden").join(name);
    let manifest: serde_json::Value = serde_json::from_str(
        &std::fs::read_to_string(golden.join("manifest.json")).unwrap()).unwrap();
    let mut compared = 0;
    let mut failures = vec![];
    for m in manifest["masters"].as_array().unwrap() {
        let m = m.as_str().unwrap();
        let master = project.master_by_name(m).expect("master open");
        let mem = MemIo::new();
        if let Err(e) = export_ufo(&project.engine, master, &mem, "out", PRECISION) {
            failures.push(format!("{name}/{m}: export failed: {e}"));
            continue;
        }
        // OTF (opentype.js port): byte-identical, or failing like the JS
        let otf_status = manifest["otf"][m].as_str().unwrap_or("");
        match mp_mom::export_otf::export_otf(&project.engine, master, &serde_json::json!({})) {
            Ok(bytes) => {
                compared += 1;
                if otf_status != "ok" {
                    failures.push(format!("{name}/{m}.otf: Rust exported, JS failed: {otf_status}"));
                } else {
                    let want = std::fs::read(golden.join(format!("{m}.otf"))).unwrap();
                    if bytes != want {
                        let i = bytes.iter().zip(&want).take_while(|(a, b)| a == b).count();
                        failures.push(format!("{name}/{m}.otf differs (len {} vs {}) from byte {i}: JS {:?} Rust {:?}",
                            want.len(), bytes.len(), &want[i.saturating_sub(4)..(i + 12).min(want.len())],
                            &bytes[i.saturating_sub(4)..(i + 12).min(bytes.len())]));
                    }
                }
            }
            Err(e) => if otf_status == "ok" { failures.push(format!("{name}/{m}.otf: Rust failed: {e}")); },
        }
        // the UI's export: UFO 2, no rounding (full f64 coordinates)
        {
            let mem2 = MemIo::new();
            match mp_mom::export::export_ufo_format(&project.engine, master, &mem2, "out2", None, 2) {
                Err(e) => failures.push(format!("{name}/{m}.ufo2: export failed: {e}")),
                Ok(()) => {
                    let dir2 = golden.join(format!("{m}.ufo2"));
                    for p in walk(&dir2) {
                        let rel = p.strip_prefix(&dir2).unwrap().to_string_lossy().to_string();
                        let want = std::fs::read(&p).unwrap();
                        compared += 1;
                        match mem2.read(&format!("out2/{rel}")) {
                            Ok(have) if have == want => {}
                            Ok(have) => failures.push(format!("{name}/{m}.ufo2/{rel} differs:\n  JS:   {}\n  Rust: {}",
                                first_diff(&want, &have).0, first_diff(&want, &have).1)),
                            Err(_) => failures.push(format!("{name}/{m}.ufo2/{rel}: missing")),
                        }
                    }
                    if mem2.files().len() != walk(&dir2).len() {
                        failures.push(format!("{name}/{m}.ufo2: file count differs"));
                    }
                }
            }
        }
        let want_dir = golden.join(format!("{m}.ufo"));
        let mut want_files = vec![];
        for e in walk(&want_dir) {
            want_files.push(e.strip_prefix(&want_dir).unwrap().to_string_lossy().to_string());
        }
        let have_files: Vec<String> = mem.files().iter().map(|f| f.strip_prefix("out/").unwrap().to_string()).collect();
        let mut wf = want_files.clone(); wf.sort();
        let mut hf = have_files.clone(); hf.sort();
        if wf != hf {
            failures.push(format!("{name}/{m}: file lists differ\n  JS:   {wf:?}\n  Rust: {hf:?}"));
        }
        for f in &want_files {
            let want = std::fs::read(want_dir.join(f)).unwrap();
            match mem.read(&format!("out/{f}")) {
                Ok(have) => {
                    compared += 1;
                    if have != want {
                        failures.push(format!("{name}/{m}/{f} differs:\n  JS:   {}\n  Rust: {}",
                            first_diff(&want, &have).0, first_diff(&want, &have).1));
                    }
                }
                Err(_) => failures.push(format!("{name}/{m}/{f}: missing")),
            }
        }
    }
    (compared, failures)
}

fn first_diff(a: &[u8], b: &[u8]) -> (String, String) {
    let a = String::from_utf8_lossy(a);
    let b = String::from_utf8_lossy(b);
    let i = a.chars().zip(b.chars()).take_while(|(x, y)| x == y).count();
    let from = i.saturating_sub(60);
    let s = |t: &str| t.chars().skip(from).take(160).collect::<String>();
    (s(&a), s(&b))
}

fn walk(dir: &std::path::Path) -> Vec<PathBuf> {
    let mut out = vec![];
    for e in std::fs::read_dir(dir).unwrap() {
        let p = e.unwrap().path();
        if p.is_dir() { out.extend(walk(&p)); } else { out.push(p); }
    }
    out
}

fn run(name: &str) {
    let (compared, failures) = check_fixture(name);
    for f in failures.iter().take(15) { println!("{f}\n"); }
    println!("{name}: {compared} files compared byte for byte, {} failures", failures.len());
    assert!(failures.is_empty());
}

#[test]
fn golden_v040_min() { run("v0.4.0-min"); }

#[test]
fn golden_v040_full() { run("v0.4.0-full"); }
