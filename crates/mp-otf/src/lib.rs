//! OpenType (CFF) font writing: a port of the writing path of opentype.js
//! 0.6.3 (`Font.toArrayBuffer` → `tables/sfnt.js` and the `make` functions of
//! head, hhea, maxp, OS/2, name, cmap, post, CFF and hmtx), as used by
//! Atem-MOM's `OTFExporter`.
//!
//! The JS builds byte arrays of JS *numbers* that are only truncated to bytes
//! when copied into a `Uint8Array`; encoders use `>>`/`&` (ToInt32) on floats.
//! This port keeps bytes as f64 and applies ToInt32/ToUint8 at the same
//! places, so the output is byte-identical, quirks included (documented at
//! each place).

mod tables_data;

use mp_math::{fp, js_num};
use tables_data::{MAC_ROMAN_HIGH, UNICODE_RANGES};

pub type Bytes = Vec<f64>;

#[derive(Debug, Clone, PartialEq)]
pub struct OtfError(pub String);
impl std::fmt::Display for OtfError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { f.write_str(&self.0) }
}
impl std::error::Error for OtfError {}
type R<T> = Result<T, OtfError>;
fn err(m: impl Into<String>) -> OtfError { OtfError(m.into()) }

/// JS ToInt32
pub fn to_int32(v: f64) -> i32 {
    if !v.is_finite() { return 0; }
    let t = v.trunc();
    let m = t.rem_euclid(4294967296.0);
    (m as u64 as u32) as i32
}

/// JS ToUint8 (what `Uint8Array[i] = v` does)
pub fn to_uint8(v: f64) -> u8 {
    if !v.is_finite() { return 0; }
    (v.trunc().rem_euclid(256.0)) as u8
}

/// `Math.round`
fn js_round(x: f64) -> f64 {
    if !x.is_finite() || x == x.trunc() { return x; }
    let f = x.floor();
    let r = if x - f >= 0.5 { f + 1.0 } else { f };
    if r == 0.0 && x < 0.0 { -0.0 } else { r }
}

fn js_min(v: &[f64]) -> f64 {
    let mut m = f64::INFINITY;
    for &x in v {
        if x.is_nan() { return f64::NAN; }
        if x < m || (x == 0.0 && m == 0.0 && x.is_sign_negative()) { m = x; }
    }
    m
}
fn js_max(v: &[f64]) -> f64 {
    let mut m = f64::NEG_INFINITY;
    for &x in v {
        if x.is_nan() { return f64::NAN; }
        if x > m || (x == 0.0 && m == 0.0 && x.is_sign_positive()) { m = x; }
    }
    m
}

// ------------------------------------------------------------------ encoders

fn byte(v: f64) -> R<Bytes> {
    if !(v >= 0.0 && v <= 255.0) { return Err(err("Byte value should be between 0 and 255.")); }
    Ok(vec![v])
}
fn ushort(v: f64) -> Bytes {
    let i = to_int32(v);
    vec![((i >> 8) & 0xFF) as f64, (i & 0xFF) as f64]
}
fn short(v: f64) -> Bytes {
    let v = if v >= 32768.0 { -(2.0 * 32768.0 - v) } else { v };
    ushort(v)
}
fn uint24(v: f64) -> Bytes {
    let i = to_int32(v);
    vec![((i >> 16) & 0xFF) as f64, ((i >> 8) & 0xFF) as f64, (i & 0xFF) as f64]
}
fn ulong(v: f64) -> Bytes {
    let i = to_int32(v);
    vec![((i >> 24) & 0xFF) as f64, ((i >> 16) & 0xFF) as f64, ((i >> 8) & 0xFF) as f64, (i & 0xFF) as f64]
}
fn longdatetime() -> Bytes { vec![0.0; 8] }
fn chararray(s: &str) -> Bytes { s.encode_utf16().map(|u| u as f64).collect() }
fn tag(s: &str) -> R<Bytes> {
    let b = chararray(s);
    if b.len() != 4 { return Err(err("Tag should be exactly 4 ASCII characters.")); }
    Ok(b)
}
fn utf16(s: &str) -> Bytes {
    let mut b = vec![];
    for u in s.encode_utf16() { b.push(((u >> 8) & 0xFF) as f64); b.push((u & 0xFF) as f64); }
    b
}
/// `encode.MACSTRING(str, 'macintosh')`; None if a character can't be encoded
fn macstring(s: &str) -> Option<Bytes> {
    let table: Vec<u16> = MAC_ROMAN_HIGH.encode_utf16().collect();
    let mut out = vec![];
    for c in s.encode_utf16() {
        if c >= 0x80 {
            let pos = table.iter().position(|t| *t == c)?;
            out.push((pos + 0x80) as f64);
        } else {
            out.push(c as f64);
        }
    }
    Some(out)
}

/// CFF `encode.NUMBER`
fn number(v: f64) -> Bytes {
    if v >= -107.0 && v <= 107.0 {
        vec![v + 139.0]
    } else if v >= 108.0 && v <= 1131.0 {
        let w = to_int32(v - 108.0);
        vec![((w >> 8) + 247) as f64, (w & 0xFF) as f64]
    } else if v >= -1131.0 && v <= -108.0 {
        let w = to_int32(-v - 108.0);
        vec![((w >> 8) + 251) as f64, (w & 0xFF) as f64]
    } else if v >= -32768.0 && v <= 32767.0 {
        number16(v)
    } else {
        number32(v)
    }
}
fn number16(v: f64) -> Bytes {
    let i = to_int32(v);
    vec![28.0, ((i >> 8) & 0xFF) as f64, (i & 0xFF) as f64]
}
fn number32(v: f64) -> Bytes {
    let i = to_int32(v);
    vec![29.0, ((i >> 24) & 0xFF) as f64, ((i >> 16) & 0xFF) as f64, ((i >> 8) & 0xFF) as f64, (i & 0xFF) as f64]
}

/// CFF `encode.REAL`
fn real(v: f64) -> Bytes {
    let mut value = js_num(v);
    // /\.(\d*?)(?:9{5,20}|0{5,20})\d{0,2}(?:e(.+)|$)/
    if let Some((m1, m2)) = real_regex(&value) {
        let exp = m2.map(|e| e.parse::<f64>().unwrap_or(f64::NAN)).unwrap_or(0.0) + m1.len() as f64;
        let epsilon: f64 = format!("1e{}", js_num(exp)).parse().unwrap_or(f64::NAN);
        value = js_num(js_round(v * epsilon) / epsilon);
    }
    let chars: Vec<char> = value.chars().collect();
    let mut nibbles = String::new();
    let mut i = 0;
    while i < chars.len() {
        let c = chars[i];
        if c == 'e' {
            i += 1;
            nibbles.push(if chars.get(i) == Some(&'-') { 'c' } else { 'b' });
        } else if c == '.' {
            nibbles.push('a');
        } else if c == '-' {
            nibbles.push('e');
        } else {
            nibbles.push(c);
        }
        i += 1;
    }
    nibbles.push_str(if nibbles.len() & 1 == 1 { "f" } else { "ff" });
    let mut out = vec![30.0];
    let nb: Vec<char> = nibbles.chars().collect();
    for pair in nb.chunks(2) {
        let s: String = pair.iter().collect();
        out.push(u8::from_str_radix(&s, 16).map(|x| x as f64).unwrap_or(f64::NAN));
    }
    out
}

/// match of `/\.(\d*?)(?:9{5,20}|0{5,20})\d{0,2}(?:e(.+)|$)/` → (group1, group2)
fn real_regex(s: &str) -> Option<(String, Option<String>)> {
    let b: Vec<char> = s.chars().collect();
    for start in 0..b.len() {
        if b[start] != '.' { continue; }
        let digits_end = (start + 1..b.len()).find(|&k| !b[k].is_ascii_digit()).unwrap_or(b.len());
        // lazy group 1: try shortest first
        for g1_end in start + 1..=digits_end {
            for rep in ['9', '0'] {
                let run = (g1_end..digits_end).take_while(|&k| b[k] == rep).count();
                if run < 5 { continue; }
                for run_len in (5..=run.min(20)).rev() {
                    let after = g1_end + run_len;
                    for extra in (0..=2usize).rev() {
                        let e = after + extra;
                        if e > digits_end { continue; }
                        if (after..e).any(|k| !b[k].is_ascii_digit()) { continue; }
                        let g1: String = b[start + 1..g1_end].iter().collect();
                        if e == b.len() { return Some((g1, None)); }
                        if b[e] == 'e' && e + 1 < b.len() {
                            return Some((g1, Some(b[e + 1..].iter().collect())));
                        }
                    }
                }
            }
        }
    }
    None
}

/// CFF INDEX of already-encoded objects
fn index(items: &[Bytes]) -> R<Bytes> {
    let mut offset = 1.0;
    let mut offsets = vec![offset];
    let mut data: Bytes = vec![];
    let mut data_size = 0.0;
    for v in items {
        data.extend_from_slice(v);
        data_size += v.len() as f64;
        offset += v.len() as f64;
        offsets.push(offset);
    }
    if data.is_empty() { return Ok(vec![0.0, 0.0]); }
    let off_size = to_int32(1.0 + (fp::ln(data_size) / fp::ln(2.0)).floor() / 8.0);
    let mut enc: Bytes = vec![];
    for o in offsets {
        match off_size {
            1 => enc.extend(byte(o)?),
            2 => enc.extend(ushort(o)),
            3 => enc.extend(uint24(o)),
            4 => enc.extend(ulong(o)),
            _ => return Err(err("offsetEncoder is not a function")),
        }
    }
    let mut out = ushort(items.len() as f64);
    out.extend(byte(off_size as f64)?);
    out.extend(enc);
    out.extend(data);
    Ok(out)
}

#[derive(Clone, Debug)]
enum Operand { Sid(f64), Number(f64), Offset(f64), Real(f64) }

fn operand(o: &Operand) -> Bytes {
    match o {
        Operand::Sid(v) | Operand::Number(v) => number(*v),
        Operand::Offset(v) => number32(*v),
        Operand::Real(v) => real(*v),
    }
}

/// `encode.DICT`: entries by numeric operator key (JS integer-key order)
fn dict(entries: &mut Vec<(u32, Vec<Operand>)>) -> Bytes {
    entries.sort_by_key(|e| e.0);
    let mut d = vec![];
    for (op, vals) in entries.iter() {
        for v in vals { d.extend(operand(v)); }
        if *op < 1200 { d.push(*op as f64); } else { d.push(12.0); d.push((*op - 1200) as f64); }
    }
    d
}

// ------------------------------------------------------------------ the font

#[derive(Clone, Debug, PartialEq)]
pub enum PathCmd {
    M(f64, f64),
    L(f64, f64),
    C(f64, f64, f64, f64, f64, f64),
}

/// An `opentype.Glyph` as OTFExporter creates it.
#[derive(Clone, Debug)]
pub struct Glyph {
    /// `glyph.id` (`options.name || null`)
    pub name: Option<String>,
    /// JS `ToNumber` of the *array* OTFExporter passes as `unicode`
    /// (`[]` → 0, `[n]` → n, longer → NaN)
    pub unicode: f64,
    /// `options.advanceWidth` if truthy, else undefined (`None`)
    pub advance_width: Option<f64>,
    pub path: Vec<PathCmd>,
}

pub struct FontOptions {
    pub family_name: String,
    pub style_name: String,
    pub units_per_em: f64,
    pub ascender: f64,
    pub descender: f64,
}

struct Metrics { x_min: f64, y_min: f64, x_max: f64, y_max: f64 }

fn get_metrics(g: &Glyph) -> Metrics {
    let (mut xs, mut ys) = (vec![], vec![]);
    for c in &g.path {
        match *c {
            PathCmd::M(x, y) | PathCmd::L(x, y) => { xs.push(x); ys.push(y); }
            PathCmd::C(x1, y1, x2, y2, x, y) => { xs.extend([x, x1, x2]); ys.extend([y, y1, y2]); }
        }
    }
    let mut m = Metrics { x_min: js_min(&xs), y_min: js_min(&ys), x_max: js_max(&xs), y_max: js_max(&ys) };
    if !m.x_min.is_finite() { m.x_min = 0.0; }
    if !m.x_max.is_finite() { m.x_max = g.advance_width.unwrap_or(f64::NAN); }
    if !m.y_min.is_finite() { m.y_min = 0.0; }
    if !m.y_max.is_finite() { m.y_max = 0.0; }
    m
}

fn unicode_range(u: f64) -> i32 {
    for (i, (b, e)) in UNICODE_RANGES.iter().enumerate() {
        if u >= *b as f64 && u < *e as f64 { return i as i32; }
    }
    -1
}

fn checksum(bytes: &Bytes) -> u32 {
    let mut b = bytes.clone();
    while b.len() % 4 != 0 { b.push(0.0); }
    let mut sum: u32 = 0;
    for c in b.chunks(4) {
        let t = (to_int32(c[0]).wrapping_shl(24) as i64) + (to_int32(c[1]).wrapping_shl(16) as i64)
              + (to_int32(c[2]).wrapping_shl(8) as i64) + to_int32(c[3]) as i64;
        sum = sum.wrapping_add(t as u32);
    }
    sum
}

fn log2_int(v: f64) -> i32 { to_int32(fp::ln(v) / fp::ln(2.0)) }

/// returns the table and the language tags that need an `ltag` table
fn name_table(names: &[(u16, String)]) -> (Bytes, Vec<String>) {
    // (platform, encoding, language, nameID, length, offset)
    let mut records: Vec<[f64; 6]> = vec![];
    let mut pool: Bytes = vec![];
    let mut ltag: Vec<String> = vec![];
    let add = |s: &Bytes, pool: &mut Bytes| -> usize {
        let n = s.len();
        if pool.len() + 1 > n {
            for pos in 0..pool.len() + 1 - n {
                if pool[pos..pos + n] == s[..] { return pos; }
            }
        }
        let off = pool.len();
        pool.extend_from_slice(s);
        off
    };
    for (id, text) in names {
        let (platform, script, language, mac) = match macstring(text) {
            Some(b) => (1.0, 0.0, 0.0, b),
            None => {
                let lang = match ltag.iter().position(|l| l == "en") {
                    Some(p) => p,
                    None => { ltag.push("en".into()); ltag.len() - 1 }
                };
                (0.0, 4.0, lang as f64, utf16(text))
            }
        };
        let off = add(&mac, &mut pool);
        records.push([platform, script, language, *id as f64, mac.len() as f64, off as f64]);
        let win = utf16(text);
        let off = add(&win, &mut pool);
        records.push([3.0, 1.0, 0x0409 as f64, *id as f64, win.len() as f64, off as f64]);
    }
    // stable sort by platform, encoding, language, nameID
    records.sort_by(|a, b| {
        for k in 0..4 {
            let d = a[k] - b[k];
            if d != 0.0 { return d.partial_cmp(&0.0).unwrap(); }
        }
        std::cmp::Ordering::Equal
    });
    let mut t = ushort(0.0);
    t.extend(ushort(records.len() as f64));
    t.extend(ushort(6.0 + records.len() as f64 * 12.0));
    for r in &records { for v in r { t.extend(ushort(*v)); } }
    t.extend(pool);
    (t, ltag)
}

/// `ltag.make(tags)`
fn ltag_table(tags: &[String]) -> Bytes {
    let mut t = ulong(1.0);
    t.extend(ulong(0.0));
    t.extend(ulong(tags.len() as f64));
    let mut pool = String::new();
    let pool_offset = 12.0 + tags.len() as f64 * 4.0;
    for tg in tags {
        let pos = match pool.find(tg.as_str()) { Some(p) => p, None => { let p = pool.len(); pool.push_str(tg); p } };
        t.extend(ushort(pool_offset + pos as f64));
        t.extend(ushort(tg.encode_utf16().count() as f64));
    }
    t.extend(chararray(&pool));
    t
}

fn cmap_table(glyphs: &[Glyph]) -> Bytes {
    // every glyph has exactly one "code": its unicode array, coerced
    let mut segs: Vec<(f64, f64, f64)> = vec![]; // (end/start code, delta)
    for (i, g) in glyphs.iter().enumerate() {
        segs.push((g.unicode, -(g.unicode - i as f64), 0.0));
        // stable sort by start; NaN comparisons count as equal
        segs.sort_by(|a, b| (a.0 - b.0).partial_cmp(&0.0).unwrap_or(std::cmp::Ordering::Equal));
    }
    segs.push((0xFFFF as f64, 1.0, 0.0));
    let seg_count = segs.len() as f64;
    let search_range = fp::pow(2.0, (fp::ln(seg_count) / fp::ln(2.0)).floor()) * 2.0;
    let entry_selector = fp::ln(search_range / 2.0) / fp::ln(2.0);
    let range_shift = seg_count * 2.0 - search_range;
    let length = 14.0 + seg_count * 2.0 + 2.0 + seg_count * 2.0 * 3.0;
    let mut t = vec![];
    for v in [0.0, 1.0, 3.0, 1.0] { t.extend(ushort(v)); }
    t.extend(ulong(12.0));
    for v in [4.0, length, 0.0, seg_count * 2.0, search_range, entry_selector, range_shift] { t.extend(ushort(v)); }
    for s in &segs { t.extend(ushort(s.0)); }
    t.extend(ushort(0.0));
    for s in &segs { t.extend(ushort(s.0)); }
    for s in &segs { t.extend(short(s.1)); }
    for s in &segs { t.extend(ushort(s.2)); }
    t
}

fn glyph_to_ops(g: &Glyph) -> Bytes {
    let mut d = number(g.advance_width.unwrap_or(f64::NAN));
    let (mut x, mut y) = (0.0, 0.0);
    for c in &g.path {
        match *c {
            PathCmd::M(cx, cy) | PathCmd::L(cx, cy) => {
                d.extend(number(js_round(cx - x)));
                d.extend(number(js_round(cy - y)));
                d.push(if matches!(c, PathCmd::M(..)) { 21.0 } else { 5.0 });
                x = js_round(cx);
                y = js_round(cy);
            }
            PathCmd::C(x1, y1, x2, y2, cx, cy) => {
                for v in [x1 - x, y1 - y, x2 - x1, y2 - y1, cx - x2, cy - y2] { d.extend(number(js_round(v))); }
                d.push(8.0);
                x = js_round(cx);
                y = js_round(cy);
            }
        }
    }
    d.push(14.0);
    d
}

const CFF_STANDARD_STRINGS: usize = 391;

fn cff_table(glyphs: &[Glyph], version: &str, full_name: &str, family_name: &str, weight: &str,
             ps_name: &str, units_per_em: f64, font_bbox: [f64; 4]) -> R<Bytes> {
    let mut strings: Vec<String> = vec![];
    // upstream bug kept: the standard-string match is always overwritten,
    // every string goes into the String INDEX
    let encode_string = |s: &str, strings: &mut Vec<String>| -> f64 {
        match strings.iter().position(|x| x == s) {
            Some(i) => (i + CFF_STANDARD_STRINGS) as f64,
            None => { strings.push(s.to_string()); (CFF_STANDARD_STRINGS + strings.len() - 1) as f64 }
        }
    };
    let scale = 1.0 / units_per_em;
    let top_dict = |charset: f64, charstrings: f64, private: [f64; 2], strings: &mut Vec<String>| -> Bytes {
        let mut m: Vec<(u32, Vec<Operand>)> = vec![];
        m.push((0, vec![Operand::Sid(encode_string(version, strings))]));
        m.push((2, vec![Operand::Sid(encode_string(full_name, strings))]));
        m.push((3, vec![Operand::Sid(encode_string(family_name, strings))]));
        m.push((4, vec![Operand::Sid(encode_string(weight, strings))]));
        let fm = [scale, 0.0, 0.0, scale, 0.0, 0.0];
        if fm != [0.001, 0.0, 0.0, 0.001, 0.0, 0.0] {
            m.push((1207, fm.iter().map(|v| Operand::Real(*v)).collect()));
        }
        if font_bbox != [0.0, 0.0, 0.0, 0.0] {
            m.push((5, font_bbox.iter().map(|v| Operand::Number(*v)).collect()));
        }
        if charset != 0.0 { m.push((15, vec![Operand::Offset(charset)])); }
        // encoding: 0 equals the default and is omitted
        if charstrings != 0.0 { m.push((17, vec![Operand::Offset(charstrings)])); }
        if private != [0.0, 0.0] { m.push((18, vec![Operand::Number(private[0]), Operand::Offset(private[1])])); }
        dict(&mut m)
    };
    let header: Bytes = vec![1.0, 0.0, 4.0, 1.0];
    let name_index = index(&[chararray(ps_name)])?;
    let first_top = top_dict(999.0, 999.0, [0.0, 999.0], &mut strings);
    let _ = index(&[first_top])?;
    let global_subrs = index(&[])?;
    let mut charsets = byte(0.0)?;
    for g in glyphs.iter().skip(1) {
        let name = g.name.clone().unwrap_or_else(|| "null".into());
        charsets.extend(ushort(encode_string(&name, &mut strings)));
    }
    let charstrings = index(&glyphs.iter().map(glyph_to_ops).collect::<Vec<_>>())?;
    let private_dict: Bytes = vec![];
    let string_index = index(&strings.iter().map(|s| chararray(s)).collect::<Vec<_>>())?;
    // offsets: computed with the first (placeholder) Top DICT
    let first_top_index = index(&[top_dict(999.0, 999.0, [0.0, 999.0], &mut strings)])?;
    let start = (header.len() + name_index.len() + first_top_index.len() + string_index.len() + global_subrs.len()) as f64;
    let charset_off = start;
    let charstrings_off = charset_off + charsets.len() as f64;
    let private_off = charstrings_off + charstrings.len() as f64;
    let top_index = index(&[top_dict(charset_off, charstrings_off, [0.0, private_off], &mut strings)])?;
    let mut t = header;
    t.extend(name_index);
    t.extend(top_index);
    t.extend(string_index);
    t.extend(global_subrs);
    t.extend(charsets);
    t.extend(charstrings);
    t.extend(private_dict);
    Ok(t)
}

/// `new opentype.Font({...}).toArrayBuffer()`
pub fn font_to_bytes(opts: &FontOptions, glyphs: &[Glyph]) -> R<Vec<u8>> {
    if !(opts.descender < 0.0) { return Err(err("Descender should be negative (e.g. -512).")); }
    let (mut x_mins, mut y_mins, mut x_maxs, mut y_maxs) = (vec![], vec![], vec![], vec![]);
    let mut advance_widths = vec![];
    let mut last_char = 0.0;
    let (mut r1, mut r2, mut r3, mut r4): (i32, i32, i32, i32) = (0, 0, 0, 0);
    for (i, g) in glyphs.iter().enumerate() {
        let unicode = to_int32(g.unicode) as f64;
        let Some(aw) = g.advance_width else {
            return Err(err(format!("Glyph {} ({i}): advanceWidth is required.",
                g.name.clone().unwrap_or_else(|| "null".into()))));
        };
        // firstCharIndex is never assigned (`undefined > x` is false)
        if last_char < unicode { last_char = unicode; }
        let pos = unicode_range(unicode);
        if pos < 32 { r1 |= 1i32.wrapping_shl(pos as u32); }
        else if pos < 64 { r2 |= 1i32.wrapping_shl((pos - 32) as u32); }
        else if pos < 96 { r3 |= 1i32.wrapping_shl((pos - 64) as u32); }
        else if pos < 123 { r4 |= 1i32.wrapping_shl((pos - 96) as u32); }
        else { return Err(err("Unicode ranges bits > 123 are reserved for internal usage")); }
        if g.name.as_deref() == Some(".notdef") { continue; }
        let m = get_metrics(g);
        x_mins.push(m.x_min); y_mins.push(m.y_min); x_maxs.push(m.x_max); y_maxs.push(m.y_max);
        advance_widths.push(aw);
    }
    let x_min = js_min(&x_mins);
    let y_min = js_min(&y_mins);
    let x_max = js_max(&x_maxs);
    let y_max = js_max(&y_maxs);
    let aw_max = js_max(&advance_widths);
    let aw_avg = advance_widths.iter().sum::<f64>() / advance_widths.len() as f64;
    // leftSideBearing is never set on the glyphs: these are NaN (Infinity without glyphs)
    let lsb_nan = if advance_widths.is_empty() { f64::INFINITY } else { f64::NAN };

    let mut head = vec![];
    head.extend(ulong(0x00010000 as f64));
    head.extend(ulong(0x00010000 as f64));
    let head_adjust_at = head.len();
    head.extend(ulong(0.0));
    head.extend(ulong(0x5F0F3CF5u32 as f64));
    head.extend(ushort(3.0));
    head.extend(ushort(opts.units_per_em));
    head.extend(longdatetime());
    head.extend(longdatetime());
    for v in [x_min, y_min, x_max, y_max] { head.extend(short(v)); }
    head.extend(ushort(0.0));
    head.extend(ushort(3.0));
    head.extend(short(2.0));
    head.extend(short(0.0));
    head.extend(short(0.0));

    let mut hhea = ulong(0x00010000 as f64);
    for v in [opts.ascender, opts.descender, 0.0] { hhea.extend(short(v)); }
    hhea.extend(ushort(aw_max));
    let min_lsb = if advance_widths.is_empty() { f64::INFINITY } else { lsb_nan };
    hhea.extend(short(min_lsb));
    hhea.extend(short(if advance_widths.is_empty() { f64::INFINITY } else { f64::NAN }));
    hhea.extend(short(lsb_nan + (x_max - x_min)));
    for v in [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] { hhea.extend(short(v)); }
    hhea.extend(ushort(glyphs.len() as f64));

    let mut maxp = ulong(0x00005000 as f64);
    maxp.extend(ushort(glyphs.len() as f64));

    let mut os2 = vec![];
    os2.extend(ushort(3.0));
    os2.extend(short(js_round(aw_avg)));
    os2.extend(ushort(500.0));
    os2.extend(ushort(5.0));
    os2.extend(ushort(0.0));
    for v in [650.0, 699.0, 0.0, 140.0, 650.0, 699.0, 0.0, 479.0, 49.0, 258.0, 0.0] { os2.extend(short(v)); }
    for _ in 0..10 { os2.extend(byte(0.0)?); }
    for v in [r1, r2, r3, r4] { os2.extend(ulong(v as f64)); }
    os2.extend(chararray("XXXX"));
    os2.extend(ushort(64.0));
    os2.extend(ushort(0.0)); // usFirstCharIndex: undefined -> field default
    os2.extend(ushort(last_char));
    os2.extend(short(opts.ascender));
    os2.extend(short(opts.descender));
    os2.extend(short(0.0));
    os2.extend(ushort(y_max));
    os2.extend(ushort(y_min.abs()));
    os2.extend(ulong(1.0));
    os2.extend(ulong(0.0));
    // metricsForChar never finds a glyph (unicodes holds arrays)
    os2.extend(short(js_round(opts.ascender / 2.0)));
    os2.extend(short(y_max));
    // hasChar(' ') is always true (undefined !== null)
    os2.extend(ushort(32.0));
    os2.extend(ushort(32.0));
    os2.extend(ushort(0.0));

    let mut hmtx = vec![];
    for g in glyphs {
        hmtx.extend(ushort(g.advance_width.unwrap_or(0.0)));
        hmtx.extend(short(0.0));
    }

    let cmap = cmap_table(glyphs);

    let family = &opts.family_name;
    let style = &opts.style_name;
    let full = format!("{family} {style}");
    let ps = format!("{family}{style}");
    // font.names in insertion order + the additions of fontToSfntTable
    let names: Vec<(u16, String)> = vec![
        (1, family.clone()), (2, style.clone()), (4, full.clone()), (6, ps.clone()),
        (9, " ".into()), (12, " ".into()), (8, " ".into()), (11, " ".into()), (13, " ".into()),
        (14, " ".into()), (5, "Version 0.1".into()), (10, " ".into()), (0, " ".into()), (7, " ".into()),
        (3, format!(" :{full}")), (16, family.clone()), (17, style.clone()),
    ];
    let (name, ltag) = name_table(&names);
    let mut post = ulong(0x00030000 as f64);
    post.extend(ulong(0.0));
    post.extend(short(0.0));
    post.extend(short(0.0));
    for _ in 0..5 { post.extend(ulong(0.0)); }
    let cff = cff_table(glyphs, "Version 0.1", &full, family, style, &ps, opts.units_per_em,
                        [0.0, y_min, opts.ascender, aw_max])?;

    let mut tables: Vec<(&str, Bytes)> = vec![("head", head), ("hhea", hhea), ("maxp", maxp), ("OS/2", os2),
        ("name", name), ("cmap", cmap), ("post", post), ("CFF ", cff), ("hmtx", hmtx)];
    if !ltag.is_empty() { tables.push(("ltag", ltag_table(&ltag))); }
    let n = tables.len() as f64;
    let hp = fp::pow(2.0, log2_int(n) as f64);
    let mut sfnt = tag("OTTO")?;
    sfnt.extend(ushort(n));
    sfnt.extend(ushort(16.0 * hp));
    sfnt.extend(ushort(log2_int(hp) as f64));
    sfnt.extend(ushort(n * 16.0 - 16.0 * hp));
    let mut offset = 12.0 + 16.0 * n;
    let mut body: Bytes = vec![];
    while offset % 4.0 != 0.0 { offset += 1.0; body.push(0.0); }
    let mut records: Vec<(String, Bytes)> = vec![];
    let mut head_pos = 0;
    for (tname, t) in &tables {
        let mut rec = tag(tname)?;
        rec.extend(ulong(checksum(t) as f64));
        rec.extend(ulong(offset));
        rec.extend(ulong(t.len() as f64));
        records.push((tname.to_string(), rec));
        if *tname == "head" { head_pos = body.len(); }
        body.extend(t);
        offset += t.len() as f64;
        while offset % 4.0 != 0.0 { offset += 1.0; body.push(0.0); }
    }
    // sort by tag (JS string comparison; tags are unique)
    let mut sorted: Vec<&(String, Bytes)> = records.iter().collect();
    sorted.sort_by(|a, b| a.0.encode_utf16().collect::<Vec<_>>().cmp(&b.0.encode_utf16().collect::<Vec<_>>()));
    for r in sorted { sfnt.extend(r.1.iter().copied()); }
    let header_len = sfnt.len();
    sfnt.extend(body);
    let total = checksum(&sfnt);
    let adjust = 0xB1B0AFBAu32.wrapping_sub(total);
    let at = header_len + head_pos + head_adjust_at;
    for (k, b) in ulong(adjust as f64).into_iter().enumerate() { sfnt[at + k] = b; }
    Ok(sfnt.into_iter().map(to_uint8).collect())
}
