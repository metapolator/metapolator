//! UFO import parity: import each test UFO with the Rust importer into a
//! fresh project, save it, export it again, and compare with what the JS
//! importer produced (tests/golden-import/, tools/js-reference/regen-import-golden.sh):
//!
//! - the saved MOM data (`MOM/*.yaml`) must be the same data (YAML parsed
//!   into JSON on both sides; formatting is free),
//! - the re-exported UFO must be byte-identical.
use mp_io::{DiskIo, Io, MemIo};
use mp_mom::export::export_ufo;
use mp_mom::js::parse_yaml;
use mp_mom::Project;
use std::path::PathBuf;
use std::rc::Rc;

fn repo() -> PathBuf { PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..") }

/// the golden of one UFO as a MemIo with `project/...` and `export.ufo/...`
fn load_golden(name: &str) -> MemIo {
    let mem = MemIo::new();
    let dir = repo().join("tests/golden-import").join(name);
    if dir.is_dir() {
        fn walk(base: &std::path::Path, p: &std::path::Path, mem: &MemIo) {
            for e in std::fs::read_dir(p).unwrap() {
                let p = e.unwrap().path();
                if p.is_dir() { walk(base, &p, mem); } else {
                    mem.write(&p.strip_prefix(base).unwrap().to_string_lossy(), &std::fs::read(&p).unwrap()).unwrap();
                }
            }
        }
        walk(&dir, &dir, &mem);
    } else {
        let xz = std::fs::read(repo().join(format!("tests/golden-import/{name}.tar.xz"))).unwrap();
        let mut tarball = vec![];
        lzma_rs::xz_decompress(&mut &xz[..], &mut tarball).unwrap();
        let mut ar = tar::Archive::new(&tarball[..]);
        for e in ar.entries().unwrap() {
            let mut e = e.unwrap();
            if !e.header().entry_type().is_file() { continue; }
            let path = e.path().unwrap().to_string_lossy().to_string();
            let rel = path.strip_prefix(&format!("{name}/")).unwrap().to_string();
            let mut data = vec![];
            std::io::Read::read_to_end(&mut e, &mut data).unwrap();
            mem.write(&rel, &data).unwrap();
        }
    }
    mem
}

/// Compare JSON trees; numeric *strings* (CPS property values like
/// "0.7837192940615443") may differ by float rounding noise: libm's sin/cos
/// are 1 ulp off V8's on ~1% of inputs (notes/rust-port/fp-v8-parity.md).
/// Counts (exact, near) leaves; returns false on a real difference.
fn json_eq(a: &serde_json::Value, b: &serde_json::Value, exact: &mut usize, near: &mut usize, worst: &mut f64) -> bool {
    use serde_json::Value as J;
    match (a, b) {
        (J::Object(x), J::Object(y)) => x.len() == y.len() && x.iter().zip(y.iter())
            .all(|((ka, va), (kb, vb))| ka == kb && json_eq(va, vb, exact, near, worst)),
        (J::Array(x), J::Array(y)) => x.len() == y.len() && x.iter().zip(y).all(|(p, q)| json_eq(p, q, exact, near, worst)),
        (J::String(x), J::String(y)) if x != y => {
            match (x.parse::<f64>(), y.parse::<f64>()) {
                (Ok(p), Ok(q)) => {
                    let rel = (p - q).abs() / p.abs().max(1.0);
                    if rel <= 1e-12 { *near += 1; *worst = worst.max(rel); true } else { false }
                }
                _ => false,
            }
        }
        _ => { if a == b { *exact += 1; true } else { false } }
    }
}

fn check(name: &str, ufo: &str) -> Vec<String> {
    let mut failures = vec![];
    let golden = load_golden(name);
    let disk = DiskIo::new(repo());
    let mem: Rc<dyn Io> = Rc::new(MemIo::new());
    let mut project = Project::init(mem.clone(), "project").unwrap();
    let master = match project.import_ufo(&format!("base-{name}"), &disk, ufo, None) {
        Ok(m) => m,
        Err(e) => return vec![format!("{name}: import failed: {e}")],
    };
    project.save().unwrap();
    // MOM data
    let mom_dir = "project/data/com.metapolator/MOM";
    for f in golden.read_dir(mom_dir).unwrap() {
        let want = parse_yaml(&golden.read_string(&format!("{mom_dir}/{f}")).unwrap()).unwrap();
        let have = match mem.read_string(&format!("{mom_dir}/{f}")) {
            Ok(s) => parse_yaml(&s).unwrap(),
            Err(e) => { failures.push(format!("{name}: {f}: {e}")); continue; }
        };
        let (mut exact, mut near, mut worst) = (0, 0, 0.0);
        let ok = json_eq(&want, &have, &mut exact, &mut near, &mut worst);
        println!("{name}: {f}: {exact} values identical, {near} within 1e-12 (worst {worst:.1e})");
        if !ok {
            let (w, h) = (serde_json::to_string_pretty(&want).unwrap(), serde_json::to_string_pretty(&have).unwrap());
            let line = w.lines().zip(h.lines()).position(|(a, b)| a != b).unwrap_or(0);
            failures.push(format!("{name}: {f} differs at line {line}:\n  JS:   {}\n  Rust: {}",
                w.lines().skip(line.saturating_sub(3)).take(6).collect::<Vec<_>>().join("\n        "),
                h.lines().skip(line.saturating_sub(3)).take(6).collect::<Vec<_>>().join("\n        ")));
        }
    }
    // export
    let out = MemIo::new();
    export_ufo(&project.engine, master, &out, "export.ufo", Some(3)).unwrap();
    let mut want_files: Vec<String> = golden.files().into_iter().filter(|f| f.starts_with("export.ufo/")).collect();
    let mut have_files = out.files();
    want_files.sort();
    have_files.sort();
    if want_files != have_files { failures.push(format!("{name}: export file lists differ")); }
    let mut same = 0;
    for f in &want_files {
        let w = golden.read(f).unwrap();
        match out.read(f) {
            Ok(h) if h == w => same += 1,
            Ok(h) => {
                let (a, b) = (String::from_utf8_lossy(&w).to_string(), String::from_utf8_lossy(&h).to_string());
                let i = a.chars().zip(b.chars()).take_while(|(x, y)| x == y).count();
                failures.push(format!("{name}: {f} differs:\n  JS:   {}\n  Rust: {}",
                    a.chars().skip(i.saturating_sub(40)).take(120).collect::<String>(),
                    b.chars().skip(i.saturating_sub(40)).take(120).collect::<String>()));
            }
            Err(_) => failures.push(format!("{name}: {f} missing")),
        }
    }
    println!("{name}: MOM data compared, {same}/{} exported files byte-identical", want_files.len());
    failures
}

fn run(cases: &[(&str, &str)]) {
    let mut failures = vec![];
    for (name, ufo) in cases { failures.extend(check(name, ufo)); }
    for f in failures.iter().take(10) { println!("{f}\n"); }
    assert!(failures.is_empty(), "{} failures", failures.len());
}

#[test]
fn import_test_ufos() {
    run(&[
        ("components", "data/fonts/test/components.ufo"),
        ("components-circular", "data/fonts/test/components-circular.ufo"),
        ("components-reverse", "data/fonts/test/components-reverse.ufo"),
        ("seanjacob", "data/fonts/test/seanjacob.ufo"),
    ]);
}

#[test]
fn import_merriweather_subsets() {
    run(&[
        ("Merriweather-Bold-Subset-nop", "data/fonts/subsets/Merriweather-Bold-Subset-nop.ufo"),
        ("Merriweather-Light-Subset-nop", "data/fonts/subsets/Merriweather-Light-Subset-nop.ufo"),
        ("Merriweather-Regular-Subset-nop", "data/fonts/subsets/Merriweather-Regular-Subset-nop.ufo"),
    ]);
}

#[test]
fn import_sean_hairline() {
    run(&[("sean_hairline-nop", "data/fonts/subsets/sean_hairline-nop.ufo")]);
}

/// the verbatim sean_hairline.ufo names a missing glyph file; JS fails too
#[test]
fn import_broken_ufo_fails() {
    let disk = DiskIo::new(repo());
    let mem: Rc<dyn Io> = Rc::new(MemIo::new());
    let mut project = Project::init(mem, "project").unwrap();
    let r = project.import_ufo("base-x", &disk, "data/fonts/verbatim/sean_hairline.ufo", None);
    assert!(r.is_err());
    assert!(r.unwrap_err().message.contains("does not exist"));
}
