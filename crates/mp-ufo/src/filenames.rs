//! ufoJS `ufoLib/filenames.js` (`userNameToFileName`) and
//! `glifLib/misc.js` (`glyphNameToFileName`).

use std::collections::HashSet;

const MAX_FILE_NAME_LENGTH: usize = 255;

fn is_illegal(c: char) -> bool {
    // '" * + / : < > ? [ \ ] | \0'.split(' ') -- `\ ` is an escaped space,
    // so the backslash itself is *not* illegal
    matches!(c, '"' | '*' | '+' | '/' | ':' | '<' | '>' | '?' | '[' | ']' | '|' | '\0')
        || ((c as u32) >= 1 && (c as u32) < 32) || c as u32 == 0x7F
}

const RESERVED: &[&str] = &["con", "prn", "aux", "clock$", "nul", "a:-z:", "com1", "lpt1", "lpt2", "lpt3", "com2", "com3", "com4"];

/// `existing` holds lower-cased names
pub fn user_name_to_file_name(user_name: &str, existing: &HashSet<String>, prefix: &str, suffix: &str) -> String {
    let mut name: String = user_name.to_string();
    if prefix.is_empty() && name.starts_with('.') {
        name = format!("_{}", &name[1..]);
    }
    let mut filtered = String::new();
    for c in name.chars() {
        if is_illegal(c) {
            filtered.push('_');
        } else {
            filtered.push(c);
            if c.to_string() != c.to_lowercase().to_string() { filtered.push('_'); }
        }
    }
    // clip (JS slices UTF-16 units; names are expected to be short)
    let slice_len = MAX_FILE_NAME_LENGTH - prefix.len() - suffix.len();
    let filtered: String = filtered.chars().take(slice_len).collect();
    let parts: Vec<String> = filtered.split('.').map(|p| {
        if RESERVED.contains(&p.to_lowercase().as_str()) { format!("_{p}") } else { p.to_string() }
    }).collect();
    let name = parts.join(".");
    let full = format!("{prefix}{name}{suffix}");
    if existing.contains(&full.to_lowercase()) {
        return handle_clash1(&name, existing, prefix, suffix);
    }
    full
}

fn handle_clash1(user_name: &str, existing: &HashSet<String>, prefix: &str, suffix: &str) -> String {
    let mut user_name: String = user_name.to_string();
    if prefix.len() + user_name.len() + suffix.len() + 15 > MAX_FILE_NAME_LENGTH {
        let l = prefix.len() + user_name.len() + suffix.len() + 15;
        // JS slice with a negative length
        let keep = (user_name.len() as isize + (MAX_FILE_NAME_LENGTH as isize - l as isize)).max(0) as usize;
        user_name = user_name.chars().take(keep).collect();
    }
    let fill = "000000000000000";
    let mut counter: u64 = 1;
    loop {
        let cs = counter.to_string();
        let name = format!("{user_name}{}{cs}", &fill[..fill.len().saturating_sub(cs.len())]);
        let full = format!("{prefix}{name}{suffix}");
        if !existing.contains(&full.to_lowercase()) { return full; }
        counter += 1;
        if counter >= 999_999_999_999_999 { break; }
    }
    let mut counter: u64 = 1;
    loop {
        let full = format!("{prefix}{counter}{suffix}");
        if !existing.contains(&full.to_lowercase()) { return full; }
        counter += 1;
    }
}

/// `glyphNameToFileName(glyphName, glyphSet)`: note that `existing` holds the
/// lower-cased *glyph names* of the glyph set, not file names (as in ufoJS).
pub fn glyph_name_to_file_name<'a>(glyph_name: &str, existing_glyph_names: impl Iterator<Item = &'a String>) -> String {
    let existing: HashSet<String> = existing_glyph_names.map(|n| n.to_lowercase()).collect();
    user_name_to_file_name(glyph_name, &existing, "", ".glif")
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn examples() {
        let e = HashSet::new();
        for (a, b) in [("a", "a"), ("A", "A_"), ("AE", "A_E_"), ("Ae", "A_e"), ("ae", "ae"), ("aE", "aE_"),
                       ("a.alt", "a.alt"), ("A.alt", "A_.alt"), ("A.Alt", "A_.A_lt"), ("A.aLt", "A_.aL_t"),
                       ("A.alT", "A_.alT_"), ("T_H", "T__H_"), ("T_h", "T__h"), ("t_h", "t_h"),
                       ("F_F_I", "F__F__I_"), ("f_f_i", "f_f_i"), ("Aacute_V.swash", "A_acute_V_.swash"),
                       (".notdef", "_notdef"), ("con", "_con"), ("CON", "C_O_N_"), ("con.alt", "_con.alt"),
                       ("alt.con", "alt._con")] {
            assert_eq!(user_name_to_file_name(a, &e, "", ""), b, "{a}");
        }
    }
}
