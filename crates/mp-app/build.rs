//! Embeds the project that the deployed v0.4.0 web app started with
//! (`tests/fixtures/v0.4.0-full`, fetched from upstream gh-pages; see
//! tools/js-reference/README.md) as `App::with_default_project`'s data.
use std::path::{Path, PathBuf};

fn walk(dir: &Path, out: &mut Vec<PathBuf>) {
    let mut entries: Vec<_> = std::fs::read_dir(dir).unwrap().map(|e| e.unwrap().path()).collect();
    entries.sort();
    for p in entries {
        if p.is_dir() { walk(&p, out) } else { out.push(p) }
    }
}

fn main() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../tests/fixtures/v0.4.0-full").canonicalize().unwrap();
    println!("cargo:rerun-if-changed={}", root.display());
    let mut files = vec![];
    walk(&root, &mut files);
    let mut src = String::from("pub const DEFAULT_PROJECT: &[(&str, &[u8])] = &[\n");
    for f in files {
        println!("cargo:rerun-if-changed={}", f.display());
        let rel = f.strip_prefix(&root).unwrap().to_str().unwrap().replace('\\', "/");
        src.push_str(&format!("    ({rel:?}, include_bytes!({:?})),\n", f.to_str().unwrap()));
    }
    src.push_str("];\n");
    let out = PathBuf::from(std::env::var("OUT_DIR").unwrap()).join("default_project.rs");
    std::fs::write(out, src).unwrap();
}
