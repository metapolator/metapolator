//! A small virtual file system, replacing Atem-IO: an in-memory backend
//! (browser/WASM, tests) and a disk backend (native).
//!
//! Paths are `/`-separated and relative to the backend's root.

use std::cell::RefCell;
use std::collections::BTreeMap;
use std::fmt;

#[derive(Clone, Debug, PartialEq)]
pub enum IoError {
    NotFound(String),
    Other(String),
}

impl fmt::Display for IoError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            IoError::NotFound(p) => write!(f, "ENOENT: no such file or directory, open '{p}'"),
            IoError::Other(m) => f.write_str(m),
        }
    }
}

impl std::error::Error for IoError {}

pub type IoResult<T> = Result<T, IoError>;

pub trait Io {
    fn read(&self, path: &str) -> IoResult<Vec<u8>>;
    fn read_string(&self, path: &str) -> IoResult<String> {
        String::from_utf8(self.read(path)?).map_err(|e| IoError::Other(e.to_string()))
    }
    fn write(&self, path: &str, data: &[u8]) -> IoResult<()>;
    /// entry names; directories end with `/` (Atem-IO convention)
    fn read_dir(&self, path: &str) -> IoResult<Vec<String>>;
    fn exists(&self, path: &str) -> bool;
    fn remove_file(&self, path: &str) -> IoResult<()>;
    /// remove a directory and everything below it
    fn remove_dir_all(&self, path: &str) -> IoResult<()>;
}

pub fn join(a: &str, b: &str) -> String {
    if a.is_empty() || a == "." { return b.to_string(); }
    format!("{}/{}", a.trim_end_matches('/'), b.trim_start_matches('/'))
}

fn norm(p: &str) -> String {
    let mut parts: Vec<&str> = vec![];
    for seg in p.split('/') {
        match seg {
            "" | "." => {}
            ".." => { parts.pop(); }
            s => parts.push(s),
        }
    }
    parts.join("/")
}

/// Everything in memory: `path -> bytes`. Directories are implicit.
#[derive(Default)]
pub struct MemIo {
    files: RefCell<BTreeMap<String, Vec<u8>>>,
}

impl MemIo {
    pub fn new() -> Self { Self::default() }
    pub fn files(&self) -> Vec<String> { self.files.borrow().keys().cloned().collect() }
    /// copy every file below `prefix` into another backend under `target`
    pub fn copy_to(&self, prefix: &str, other: &dyn Io, target: &str) -> IoResult<()> {
        let prefix = norm(prefix);
        for (k, v) in self.files.borrow().iter() {
            let rel = if prefix.is_empty() { Some(k.as_str()) } else { k.strip_prefix(&format!("{prefix}/")) };
            if let Some(rel) = rel {
                other.write(&join(target, rel), v)?;
            }
        }
        Ok(())
    }
}

impl Io for MemIo {
    fn read(&self, path: &str) -> IoResult<Vec<u8>> {
        self.files.borrow().get(&norm(path)).cloned().ok_or_else(|| IoError::NotFound(path.to_string()))
    }
    fn write(&self, path: &str, data: &[u8]) -> IoResult<()> {
        self.files.borrow_mut().insert(norm(path), data.to_vec());
        Ok(())
    }
    fn read_dir(&self, path: &str) -> IoResult<Vec<String>> {
        let dir = norm(path);
        let prefix = if dir.is_empty() { String::new() } else { format!("{dir}/") };
        let mut out: Vec<String> = vec![];
        for k in self.files.borrow().keys() {
            if let Some(rest) = k.strip_prefix(&prefix) {
                let name = match rest.find('/') {
                    Some(p) => format!("{}/", &rest[..p]),
                    None => rest.to_string(),
                };
                if !out.contains(&name) { out.push(name); }
            }
        }
        if out.is_empty() && !dir.is_empty() {
            return Err(IoError::NotFound(path.to_string()));
        }
        Ok(out)
    }
    fn exists(&self, path: &str) -> bool {
        let p = norm(path);
        let files = self.files.borrow();
        files.contains_key(&p) || files.keys().any(|k| k.starts_with(&format!("{p}/")))
    }
    fn remove_file(&self, path: &str) -> IoResult<()> {
        self.files.borrow_mut().remove(&norm(path)).map(|_| ()).ok_or_else(|| IoError::NotFound(path.to_string()))
    }
    fn remove_dir_all(&self, path: &str) -> IoResult<()> {
        let p = format!("{}/", norm(path));
        self.files.borrow_mut().retain(|k, _| !k.starts_with(&p));
        Ok(())
    }
}

/// The local file system below `root` (native builds only).
#[cfg(not(target_arch = "wasm32"))]
pub struct DiskIo {
    pub root: std::path::PathBuf,
}

#[cfg(not(target_arch = "wasm32"))]
impl DiskIo {
    pub fn new(root: impl Into<std::path::PathBuf>) -> Self { DiskIo { root: root.into() } }
    fn path(&self, p: &str) -> std::path::PathBuf {
        if p.starts_with('/') { std::path::PathBuf::from(p) } else { self.root.join(p) }
    }
}

#[cfg(not(target_arch = "wasm32"))]
fn map_err(e: std::io::Error, path: &str) -> IoError {
    if e.kind() == std::io::ErrorKind::NotFound { IoError::NotFound(path.to_string()) } else { IoError::Other(format!("{path}: {e}")) }
}

#[cfg(not(target_arch = "wasm32"))]
impl Io for DiskIo {
    fn read(&self, path: &str) -> IoResult<Vec<u8>> {
        std::fs::read(self.path(path)).map_err(|e| map_err(e, path))
    }
    fn write(&self, path: &str, data: &[u8]) -> IoResult<()> {
        let p = self.path(path);
        if let Some(d) = p.parent() { std::fs::create_dir_all(d).map_err(|e| map_err(e, path))?; }
        std::fs::write(p, data).map_err(|e| map_err(e, path))
    }
    fn read_dir(&self, path: &str) -> IoResult<Vec<String>> {
        let mut out = vec![];
        for e in std::fs::read_dir(self.path(path)).map_err(|e| map_err(e, path))? {
            let e = e.map_err(|e| map_err(e, path))?;
            let mut name = e.file_name().to_string_lossy().to_string();
            if e.file_type().map(|t| t.is_dir()).unwrap_or(false) { name.push('/'); }
            out.push(name);
        }
        out.sort();
        Ok(out)
    }
    fn exists(&self, path: &str) -> bool { self.path(path).exists() }
    fn remove_file(&self, path: &str) -> IoResult<()> {
        std::fs::remove_file(self.path(path)).map_err(|e| map_err(e, path))
    }
    fn remove_dir_all(&self, path: &str) -> IoResult<()> {
        let p = self.path(path);
        if !p.exists() { return Ok(()); }
        std::fs::remove_dir_all(p).map_err(|e| map_err(e, path))
    }
}
