//! The specimen panel's text → glyph name logic: port of
//! `ui/metapolator/specimen-panel/specimen-field/specimen-field-controller.js`
//! (`stringToGlyphs`, `glyphsIn`, `glyphsOut` with the three "strict" mixer
//! modes, `filteredGlyphs`) and the sample texts of
//! `specimen-tools/specimen-samples`.
//!
//! JS indexes strings by UTF-16 code unit; this port indexes by `char`,
//! which differs only for characters outside the BMP.

/// `*n` line break, `*p` paragraph break, `*specimenbreak` between masters
pub const LINE_BREAK: &str = "*n";
pub const PARAGRAPH_BREAK: &str = "*p";
pub const SPECIMEN_BREAK: &str = "*specimenbreak";

/// (group, name, text) of `SpecimenSamplesController.samples`
pub const SAMPLES: &[(usize, &str, &str)] = &[
    (0, "[Enter your own text]", "Metapolator"),
    (1, "Metagram", "Incredibly, he makes a major life-change! For example: \"I’ll require that the system have two sizes.\""),
    (1, "3 Pangrams", "Quick wafting zephyrs vex bold Jim. The quick brown fox jumps over the lazy dog. Bright vixens jump dozy fowl quack."),
    (1, "Capitalised Pan", "Aladine Biopsia Cumbia Diego Espejo Flecha Gaveta Hockey Index Jaque Kurdos Ludwing Motivo Nylon Ortiz Profit Quiff Roving Sioux Tizzy Unwary Vertex Wrathy Xammar Yachts Zaque"),
    (1, "Ruder", "vertrag crainte screw, bibel malhabile modo. verwalter croyant science, biegen peuple punibile. verzicht fratricide sketchy, blind qualifier quindi. vorrede frivolité story, damals quelle dinamica. yankee instruction take, china quelque analiso. zwetschge lyre treaty, schaden salomon macchina. zypresse navette tricycle, schein sellier secondo. fraktur nocturne typograph, lager sommier singolo. kraft pervertir vanity, legion unique possibile. raffeln presto victory, mime unanime unico. reaktion prévoyant vivacity, mohn usuel legge. rekord priorité wayward, nagel abonner unione. revolte proscrire efficiency, puder agir punizione. tritt raviver without, quälen aiglon dunque. trotzkopf tactilité through, huldigen allégir quando. tyrann arrêt known, geduld alliance uomini."),
    (2, "Aa12%@…", "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz*n1234567890*n( { [ . , ¡ ! ¿ ? * ' ‘ ’ \" “ ” ] } ) $ € £ % @ & ¶ § ¢ † ‡"),
    (2, "Number Grid", "12345678901*n23456789012*n34567890123*n45678901234*n56789012345*n67890123456*n78901234567*n89012345678*n90123456789*n01234567890"),
    (3, "Paragraph", "Grumpy wizards make toxic brew for the evil Queen and Jack. One morning when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.*pHe lay on his armourlike back and if he lifted his head a little, he could see his brown belly slightly domed and divided by arches into stiff sections.*pThe bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs pitifully thin compared with the size of the rest of him, waved about helplessly as he looked."),
];

/// how the displayed masters alternate (`mixer.fontBy`)
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum FontBy { Glyph, Word, Specimen }

/// `stringToGlyphs(string, unique, includeSpaces)`
pub fn string_to_glyphs(s: &str, unique: bool, include_spaces: bool) -> Vec<String> {
    let c: Vec<char> = s.chars().collect();
    let mut glyphs: Vec<String> = vec![];
    let mut i = 0;
    while i < c.len() {
        let ch = c[i];
        let glyph: String = if ch == ' ' {
            "space".into()
        } else if ch == '*' && matches!(c.get(i + 1), Some('n') | Some('p')) {
            i += 1;
            format!("*{}", c[i])
        } else if ch == '<' {
            // a glyph name of up to 8 characters: <name>
            let mut name = String::new();
            let mut found_end = false;
            let mut len = 0;
            for q in 1..10 {
                if found_end { break; }
                match c.get(i + q) {
                    Some('>') => found_end = true,
                    Some(x) => { name.push(*x); len += 1; }
                    None => { len += 9; } // JS appends "undefined"; never found then
                }
            }
            if !found_end { "<".into() } else { i += len + 1; name }
        } else {
            // `substitute` always returns -1 (its fontMapping table is
            // commented out upstream): the character is the glyph name
            ch.to_string()
        };
        let is_space = glyph == "space";
        if unique {
            if !glyphs.contains(&glyph) || glyph == LINE_BREAK || glyph == PARAGRAPH_BREAK {
                if !is_space || include_spaces { glyphs.push(glyph); }
            }
        } else if !is_space || include_spaces {
            glyphs.push(glyph);
        }
        i += 1;
    }
    glyphs
}

fn is_space_glyph(g: &str) -> bool { g == "space" || g == LINE_BREAK || g == PARAGRAPH_BREAK }

/// `glyphsOut()`: the sample text mixed with the filter
pub fn glyphs_out(text: &str, filter: &str, strict: u8) -> Vec<String> {
    let glyphs_in = if text.is_empty() { vec![] } else { string_to_glyphs(text, false, true) };
    if filter.is_empty() { return glyphs_in; }
    let filter_len = filter.encode_utf16().count() as f64;
    let mut out: Vec<String> = vec![];
    match strict {
        0 => {
            let fg = string_to_glyphs(filter, false, true);
            let interval = (2.0 * glyphs_in.len() as f64 / filter_len).sqrt();
            let (mut pushed, mut counter) = (0usize, 0.5f64);
            for (i, g) in glyphs_in.iter().enumerate() {
                out.push(g.clone());
                if (counter * interval).floor() == i as f64 {
                    out.push(fg.get(pushed).cloned().unwrap_or_default());
                    pushed += 1;
                    if pushed == fg.len() { pushed = 0; }
                    counter += 1.0;
                }
            }
        }
        1 => {
            let fg = string_to_glyphs(filter, false, true);
            let (mut pushed, mut without_spaces, mut counter) = (0usize, 0usize, 1usize);
            for g in &glyphs_in {
                if !is_space_glyph(g) {
                    if without_spaces == counter {
                        out.push(fg.get(pushed).cloned().unwrap_or_default());
                        counter += 2;
                        pushed += 1;
                        if pushed == fg.len() { pushed = 0; }
                    } else {
                        out.push(g.clone());
                    }
                    without_spaces += 1;
                } else {
                    out.push(g.clone());
                }
            }
        }
        _ => {
            let fg = string_to_glyphs(filter, true, false);
            let l = fg.len();
            if l == 1 {
                out.push(fg[0].clone());
            } else {
                for i in 0..l {
                    for j in i..l {
                        if i == j {
                            if i == 0 || i == l - 1 {
                                out.extend([fg[i].clone(), fg[i].clone()]);
                            } else {
                                out.extend(["space".into(), fg[i].clone(), fg[i].clone()]);
                            }
                        } else if (j - i) % 2 == 0 {
                            out.extend(["space".into(), fg[i].clone(), fg[j].clone(), fg[i].clone()]);
                        } else {
                            out.extend([fg[j].clone(), fg[i].clone()]);
                        }
                    }
                }
            }
        }
    }
    out
}

/// One cell of the specimen: a glyph of a displayed master, or a break.
#[derive(Clone, Debug, PartialEq)]
pub enum Cell {
    /// (index into the displayed masters, glyph name)
    Glyph(usize, String),
    LineBreak,
    ParagraphBreak,
    SpecimenBreak,
}

/// `filteredGlyphs()`: the cells for `n_masters` displayed masters.
/// `has_glyph(master_index, name)` filters glyphs the master lacks.
pub fn filtered_glyphs(glyphs_out: &[String], n_masters: usize, font_by: FontBy,
                       has_glyph: &dyn Fn(usize, &str) -> bool) -> Vec<Cell> {
    let mut out = vec![];
    for q in 0..n_masters {
        let mut master = q;
        let l = glyphs_out.len();
        for (i, name) in glyphs_out.iter().enumerate() {
            match name.as_str() {
                PARAGRAPH_BREAK => out.push(Cell::ParagraphBreak),
                LINE_BREAK => out.push(Cell::LineBreak),
                SPECIMEN_BREAK => out.push(Cell::SpecimenBreak),
                n => if has_glyph(master, n) { out.push(Cell::Glyph(master, n.to_string())); },
            }
            if font_by == FontBy::Glyph || (font_by == FontBy::Word && name == "space")
                || (font_by == FontBy::Specimen && i + 1 == l) {
                master += 1;
            }
            if master == n_masters { master = 0; }
        }
        if q + 1 < n_masters { out.push(Cell::SpecimenBreak); }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn v(s: &[&str]) -> Vec<String> { s.iter().map(|x| x.to_string()).collect() }

    #[test]
    fn breaks_and_names() {
        assert_eq!(string_to_glyphs("a b*nc<foo>d", false, true), v(&["a", "space", "b", "*n", "c", "foo", "d"]));
        assert_eq!(string_to_glyphs("a <b", false, false), v(&["a", "<", "b"]));
        assert_eq!(string_to_glyphs("aab a", true, false), v(&["a", "b"]));
    }

    #[test]
    fn strict_two() {
        assert_eq!(glyphs_out("x", "ab", 2), v(&["a", "a", "b", "a", "b", "b"]));
    }
}
