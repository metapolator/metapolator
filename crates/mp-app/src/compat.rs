//! `isInterpolationCompatible` of Atem-MOM `Master`, `Glyph` and
//! `_Contour` (penstroke, contour, component), collecting messages.

use mp_cps::NodeId;
use mp_mom::tree::{Kind, Mom};
use std::collections::BTreeMap;

fn glyph_compatible(mom: &Mom, a: NodeId, b: NodeId, msgs: &mut Vec<String>) -> bool {
    let id = mom.node(a).id.clone().unwrap_or_default();
    let (ca, cb) = (&mom.node(a).children, &mom.node(b).children);
    let mut ok = true;
    let diff = cb.len() as i64 - ca.len() as i64;
    if diff != 0 {
        ok = false;
        msgs.push(format!("{} \"{id}\": {} child elements ({diff}) in other glyph.", mom.describe(a), if diff > 0 { "too many" } else { "too few" }));
    }
    for i in 0..ca.len().min(cb.len()) {
        let (x, y) = (ca[i], cb[i]);
        let r = if mom.kind(x) != mom.kind(y) {
            Err(format!("{}:i({i}): types are different: {}", mom.describe(x), mom.describe(y)))
        } else {
            let d = mom.node(y).children.len() as i64 - mom.node(x).children.len() as i64;
            if d != 0 {
                Err(format!("{}:i({i}): {} child elements ({d}) in other {}.", mom.describe(x),
                    if d > 0 { "too many" } else { "too few" }, mom.kind(y).type_name()))
            } else { Ok(()) }
        };
        if let Err(m) = r {
            msgs.push(format!("{} \"{id}\": incompatible child at index {i} … ", mom.describe(a)));
            msgs.push(m);
        }
    }
    // a child mismatch alone does not flip the glyph result in the JS
    // (`compatible` is only cleared for a child count difference), but the
    // master test then marks the master incompatible
    ok && msgs.is_empty()
}

/// (compatible, messages) for metapolating `b` with `a` as the base
pub fn is_interpolation_compatible(mom: &Mom, a: NodeId, b: NodeId) -> (bool, Vec<String>) {
    let mut msgs = vec![];
    if mom.kind(a) != Kind::Master || mom.kind(b) != Kind::Master {
        return (false, vec!["other item is not a Master".into()]);
    }
    let names = |m: NodeId| -> BTreeMap<String, NodeId> {
        mom.node(m).children.iter().filter_map(|g| mom.node(*g).id.clone().map(|id| (id, *g))).collect()
    };
    let (na, nb) = (names(a), names(b));
    let ida = mom.node(a).id.clone().unwrap_or_default();
    let idb = mom.node(b).id.clone().unwrap_or_default();
    let missing: Vec<&str> = na.keys().filter(|k| !nb.contains_key(*k)).map(|s| s.as_str()).collect();
    let excess: Vec<&str> = nb.keys().filter(|k| !na.contains_key(*k)).map(|s| s.as_str()).collect();
    let mut ok = true;
    if !missing.is_empty() {
        ok = false;
        msgs.push(format!("{} \"{ida}\": missing glyphs in Master \"{idb}\": {}.", mom.describe(a), missing.join(", ")));
    }
    if !excess.is_empty() {
        ok = false;
        msgs.push(format!("{} \"{ida}\": excess glyphs in Master \"{idb}\": {}.", mom.describe(a), excess.join(", ")));
    }
    for (k, ga) in &na {
        if let Some(gb) = nb.get(k) {
            let mut m = vec![];
            if !glyph_compatible(mom, *ga, *gb, &mut m) { ok = false; }
            msgs.extend(m);
        }
    }
    (ok, msgs)
}
