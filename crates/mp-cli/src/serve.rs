//! `metapolator serve`: a minimal static HTTP server for the web UI
//! (replaces `bin/metapolator-red-pill`, which served the AngularJS app).
//! GET/HEAD only, one thread per connection, files below the root only.

use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Component, Path, PathBuf};

fn mime(path: &Path) -> &'static str {
    match path.extension().and_then(|e| e.to_str()).unwrap_or("") {
        "html" => "text/html; charset=utf-8",
        "js" | "mjs" => "text/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "wasm" => "application/wasm",
        "json" => "application/json",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "ico" => "image/x-icon",
        "otf" => "font/otf",
        "zip" => "application/zip",
        _ => "application/octet-stream",
    }
}

/// the file for a request path, refusing anything outside `root`
fn resolve(root: &Path, url: &str) -> Option<PathBuf> {
    let path = url.split(['?', '#']).next().unwrap_or("/");
    let decoded = percent_decode(path)?;
    let mut out = root.to_path_buf();
    for c in Path::new(decoded.trim_start_matches('/')).components() {
        match c { Component::Normal(p) => out.push(p), Component::CurDir => {}, _ => return None }
    }
    if out.is_dir() { out.push("index.html"); }
    out.is_file().then_some(out)
}

fn percent_decode(s: &str) -> Option<String> {
    let b = s.as_bytes();
    let mut out = Vec::with_capacity(b.len());
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'%' {
            let h = std::str::from_utf8(b.get(i + 1..i + 3)?).ok()?;
            out.push(u8::from_str_radix(h, 16).ok()?);
            i += 3;
        } else { out.push(b[i]); i += 1; }
    }
    String::from_utf8(out).ok()
}

/// the project directory as a ZIP whose top level directory is
/// `project/` (what `App::from_project_zip` reads); dot files and
/// directories (`.git`) are left out
pub fn project_zip(dir: &Path) -> Result<Vec<u8>, String> {
    fn walk(base: &Path, p: &Path, out: &mut Vec<(String, Vec<u8>)>) -> Result<(), String> {
        let mut entries: Vec<_> = std::fs::read_dir(p).map_err(|e| format!("{}: {e}", p.display()))?
            .filter_map(|e| e.ok()).map(|e| e.path()).collect();
        entries.sort();
        for e in entries {
            if e.file_name().and_then(|n| n.to_str()).map(|n| n.starts_with('.')).unwrap_or(true) { continue; }
            if e.is_dir() { walk(base, &e, out)?; continue; }
            let rel = e.strip_prefix(base).unwrap().to_string_lossy().replace('\\', "/");
            out.push((format!("project/{rel}"), std::fs::read(&e).map_err(|x| format!("{}: {x}", e.display()))?));
        }
        Ok(())
    }
    let mut files = vec![];
    walk(dir, dir, &mut files)?;
    mp_app::zipio::pack_files(&files)
}

fn handle(root: &Path, project: Option<&Path>, mut stream: TcpStream) -> std::io::Result<()> {
    let mut reader = BufReader::new(stream.try_clone()?);
    let mut line = String::new();
    reader.read_line(&mut line)?;
    // skip the headers
    let mut h = String::new();
    while reader.read_line(&mut h)? > 2 { h.clear(); }
    let mut parts = line.split_whitespace();
    let (method, url) = (parts.next().unwrap_or(""), parts.next().unwrap_or("/"));
    let reply = |s: &mut TcpStream, status: &str, ctype: &str, body: &[u8], head: bool| -> std::io::Result<()> {
        write!(s, "HTTP/1.1 {status}\r\nContent-Type: {ctype}\r\nContent-Length: {}\r\nCache-Control: no-cache\r\nConnection: close\r\n\r\n", body.len())?;
        if !head { s.write_all(body)?; }
        s.flush()
    };
    if method != "GET" && method != "HEAD" {
        return reply(&mut stream, "405 Method Not Allowed", "text/plain", b"method not allowed\n", false);
    }
    if url.split('?').next() == Some("/project.zip") {
        return match project.map(project_zip) {
            Some(Ok(zip)) => reply(&mut stream, "200 OK", "application/zip", &zip, method == "HEAD"),
            Some(Err(e)) => reply(&mut stream, "500 Internal Server Error", "text/plain", e.as_bytes(), method == "HEAD"),
            None => reply(&mut stream, "404 Not Found", "text/plain", b"no project\n", method == "HEAD"),
        };
    }
    match resolve(root, url) {
        Some(file) => {
            let body = std::fs::read(&file)?;
            reply(&mut stream, "200 OK", mime(&file), &body, method == "HEAD")
        }
        None => reply(&mut stream, "404 Not Found", "text/plain", b"not found\n", method == "HEAD"),
    }
}

pub fn serve(root: &Path, project: Option<&Path>, addr: &str) -> Result<(), String> {
    if !root.join("index.html").is_file() {
        return Err(format!("{} has no index.html; build the UI with tools/build-ui.sh", root.display()));
    }
    let listener = TcpListener::bind(addr).map_err(|e| format!("{addr}: {e}"))?;
    if let Some(p) = project {
        project_zip(p)?; // fail early on an unreadable project
        if !p.join("data/com.metapolator/project.yaml").is_file() {
            return Err(format!("{} is not a Metapolator project (no data/com.metapolator/project.yaml)", p.display()));
        }
    }
    println!("Metapolator: http://{}/  (UI: {}; project: {}; Ctrl-C stops)", listener.local_addr().map_err(|e| e.to_string())?,
             root.display(), project.map(|p| p.display().to_string()).unwrap_or_else(|| "the demo".into()));
    for stream in listener.incoming() {
        let Ok(stream) = stream else { continue };
        let root = root.to_path_buf();
        let project = project.map(Path::to_path_buf);
        std::thread::spawn(move || { let _ = handle(&root, project.as_deref(), stream); });
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn stays_below_the_root() {
        let root = std::env::temp_dir();
        assert!(resolve(&root, "/../etc/passwd").is_none());
        assert!(resolve(&root, "/%2e%2e/etc/passwd").is_none());
        assert_eq!(mime(Path::new("a/b.wasm")), "application/wasm");
    }
}
