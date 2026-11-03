//! ZIP packing and unpacking between byte buffers and an [`Io`]
//! (Atem-IO `tools/zipUtil`, which used JSZip).
//!
//! Packed archives are deterministic: entries in path order, deflated,
//! with the DOS epoch (1980-01-01) as modification time.

use mp_io::{join, Io, MemIo};
use std::io::{Cursor, Read, Write};
use zip::write::SimpleFileOptions;

/// `zipUtil.unpack`: every file of `data` into `io` below `target`
/// (directories are implicit in [`MemIo`]).
pub fn unpack(data: &[u8], io: &dyn Io, target: &str) -> Result<(), String> {
    let mut archive = zip::ZipArchive::new(Cursor::new(data)).map_err(|e| format!("not a ZIP file: {e}"))?;
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        if file.is_dir() { continue; }
        let name = file.name().map_err(|e| e.to_string())?.to_string();
        // never let an entry escape `target`
        if name.split('/').any(|s| s == "..") || name.starts_with('/') {
            return Err(format!("unsafe path in ZIP: {name}"));
        }
        let mut buf = Vec::with_capacity(file.size() as usize);
        file.read_to_end(&mut buf).map_err(|e| format!("{name}: {e}"))?;
        io.write(&join(target, &name), &buf).map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn collect(io: &dyn Io, dir: &str, prefix: &str, out: &mut Vec<(String, String)>) -> Result<(), String> {
    let mut entries = io.read_dir(dir).map_err(|e| e.to_string())?;
    entries.sort();
    for e in entries {
        if let Some(d) = e.strip_suffix('/') {
            collect(io, &join(dir, d), &format!("{prefix}{d}/"), out)?;
        } else {
            out.push((join(dir, &e), format!("{prefix}{e}")));
        }
    }
    Ok(())
}

/// `zipUtil.pack`: the directory `dir` of `io` as a ZIP whose single top
/// level entry is `dir`'s last path component (as JSZip did).
pub fn pack_dir(io: &dyn Io, dir: &str) -> Result<Vec<u8>, String> {
    let top = dir.trim_end_matches('/').rsplit('/').next().unwrap_or(dir).to_string();
    let mut files = vec![];
    collect(io, dir, &format!("{top}/"), &mut files)?;
    let mut entries = vec![];
    for (src, name) in files {
        entries.push((name, io.read(&src).map_err(|e| e.to_string())?));
    }
    pack_files(&entries)
}

/// a ZIP of `(path, data)` entries, in the given order
pub fn pack_files(entries: &[(String, Vec<u8>)]) -> Result<Vec<u8>, String> {
    let mut w = zip::ZipWriter::new(Cursor::new(Vec::new()));
    let opts = SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .last_modified_time(zip::DateTime::default());
    for (name, data) in entries {
        w.start_file(name.as_str(), opts).map_err(|e| e.to_string())?;
        w.write_all(data).map_err(|e| e.to_string())?;
    }
    Ok(w.finish().map_err(|e| e.to_string())?.into_inner())
}

/// all files of a [`MemIo`] below `prefix`, as `(relative path, data)`
pub fn mem_files(io: &MemIo, prefix: &str) -> Vec<(String, Vec<u8>)> {
    let p = format!("{}/", prefix.trim_end_matches('/'));
    io.files().into_iter()
        .filter_map(|f| f.strip_prefix(&p).map(|r| (r.to_string(), f.clone())))
        .map(|(r, f)| (r, io.read(&f).unwrap_or_default()))
        .collect()
}
