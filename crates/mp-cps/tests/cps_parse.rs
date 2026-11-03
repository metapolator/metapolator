//! Differential test: CPS stylesheet and selector parsing vs the JS engine.
//! Data: tests/data/cps-parse.json from tests/probes/cps-parse.js.
use mp_cps::document::{parse_cps, Collection, CollectionItem, DictItem, ImportResolver};
use mp_cps::lang::{Item, Op};
use mp_cps::selector::SelectorList;
use mp_cps::Result;
use serde_json::{json, Value as J};
use std::rc::Rc;

/// like the probe's stub ruleController: every import is an empty collection
struct Stub;
impl ImportResolver for Stub {
    fn get_rule(&mut self, _: &str) -> Result<Rc<Collection>> { Ok(Rc::new(Collection::default())) }
}

fn bits(x: f64) -> String { format!("{:016x}", x.to_bits()) }

fn dump_selector_list(sl: &SelectorList) -> J {
    json!({
        "invalid": sl.invalid,
        "message": sl.message,
        "str": sl.to_string(),
        "selectors": sl.selectors.iter().map(|cs| json!({
            "str": cs.to_string(),
            "normalized": cs.normalized_name(),
            "invalid": cs.invalid,
            "message": cs.message,
            "specificity": if cs.invalid { J::Null } else { json!(cs.specificity()) },
        })).collect::<Vec<_>>(),
    })
}

fn dump_stack(items: &[Item]) -> J {
    J::Array(items.iter().map(|i| match i {
        Item::Number(n) => json!({"n": bits(*n)}),
        Item::Str(s) => json!({"s": &**s}),
        Item::Selector(s) => json!({"sel": s.to_string()}),
        Item::Name(n) => json!({"name": &**n}),
        Item::Op { op, consumes } => json!({"op": op_literal(*op), "consumes": consumes}),
    }).collect())
}

fn op_literal(op: Op) -> &'static str { op.literal() }

fn dump_items(items: &[CollectionItem]) -> J {
    J::Array(items.iter().map(|item| match item {
        CollectionItem::Rule(r) => json!({
            "rule": dump_selector_list(&r.selectors),
            "properties": r.properties.items().iter().map(|p| match p {
                DictItem::Property(p) => {
                    let mut o = json!({"name": p.name, "value": p.value.value_string, "invalid": p.invalid()});
                    match &p.value.expr {
                        Ok(e) => { o["stack"] = dump_stack(&e.items); }
                        Err(m) => { o["message"] = json!(m); }
                    }
                    o
                }
                DictItem::Comment(c) => json!({"comment": c}),
                DictItem::Generic(g) => json!({"generic": g}),
            }).collect::<Vec<_>>(),
        }),
        CollectionItem::Import { resource, .. } => json!({"import": resource}),
        CollectionItem::Namespace(n) => json!({"namespace": dump_selector_list(&n.selectors), "items": dump_items(&n.items)}),
        CollectionItem::Comment(c) => json!({"comment": c}),
    }).collect())
}

/// Compare, ignoring error/invalid *messages* (only whether there is one).
fn strip_messages(v: &J) -> J {
    match v {
        J::Object(m) => J::Object(m.iter().filter(|(k, _)| *k != "message" && *k != "error")
            .map(|(k, v)| (k.clone(), strip_messages(v))).collect()),
        J::Array(a) => J::Array(a.iter().map(strip_messages).collect()),
        other => other.clone(),
    }
}

#[test]
fn stylesheets_parse_like_js() {
    let data: J = serde_json::from_str(include_str!("data/cps-parse.json")).unwrap();
    let mut failures = vec![];
    let (mut both_err, mut compared) = (0, 0);
    let files = data["files"].as_array().unwrap();
    for f in files {
        let name = f["name"].as_str().unwrap();
        let src = f["source"].as_str().unwrap();
        let got = parse_cps(src, &mut Stub);
        match (got, f.get("error")) {
            (Err(_), Some(_)) => both_err += 1,
            (Err(e), None) => failures.push(format!("{name}: Rust error {e}, JS ok")),
            (Ok(_), Some(err)) => failures.push(format!("{name}: Rust ok, JS error {err}")),
            (Ok(c), None) => {
                compared += 1;
                let want = strip_messages(&f["items"]);
                let have = strip_messages(&dump_items(&c.items));
                if want != have {
                    failures.push(format!("{name}:\n  JS:   {}\n  Rust: {}",
                        serde_json::to_string(&want).unwrap(), serde_json::to_string(&have).unwrap()));
                }
            }
        }
    }
    for m in &failures { println!("{m}\n"); }
    println!("{} files: {compared} parsed and compared structurally, {both_err} rejected by both, {} mismatches",
             files.len(), failures.len());
    // the data must exercise both paths
    assert!(compared > 100 && both_err > 20);
    assert!(failures.is_empty());
}

#[test]
fn selectors_parse_like_js() {
    let data: J = serde_json::from_str(include_str!("data/cps-parse.json")).unwrap();
    let mut failures = vec![];
    for s in data["selectors"].as_array().unwrap() {
        let input = s["input"].as_str().unwrap();
        match (SelectorList::parse(input, false), s.get("error")) {
            (Err(_), Some(_)) => {}
            (Err(e), None) => failures.push(format!("{input:?}: Rust error {e}, JS ok")),
            (Ok(_), Some(err)) => failures.push(format!("{input:?}: Rust ok, JS error {err}")),
            (Ok(sl), None) => {
                let want = strip_messages(&s["result"]);
                let have = strip_messages(&dump_selector_list(&sl));
                if want != have { failures.push(format!("{input:?}:\n  JS:   {want}\n  Rust: {have}")); }
            }
        }
    }
    for m in &failures { println!("{m}\n"); }
    assert!(failures.is_empty(), "{} mismatches", failures.len());
}
