//! `RuleController`: loads, parses and caches CPS files by name, runs CPS
//! generators (`generated://name/version/args`) and resolves `@import`.
//! Port of Atem-CPS `CPS/RuleController.js` (synchronous paths only), plus
//! the namespace flattening of `SelectorEngine._getNamespacedRules`.

use crate::document::{parse_cps, Collection, CollectionItem, ImportResolver, PropertyDict};
use crate::error::{CpsError, ErrorKind, Result};
use crate::selector::ComplexSelector;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::rc::Rc;

/// Where CPS sources come from (the project's CPS dir and the mounted libraries).
pub trait SourceLoader {
    fn read(&self, source_name: &str) -> Result<String>;
}

/// A CPS generator: arguments are numbers or strings (from the path).
pub type Generator = Box<dyn Fn(&[GenArg]) -> String>;

#[derive(Clone, Debug, PartialEq)]
pub enum GenArg { Number(f64), Str(String) }

/// One rule with the selectors that apply (namespace selectors multiplied in).
#[derive(Debug)]
pub struct NamespacedRule {
    /// sorted by specificity (descending), stable, then multiplied with the
    /// namespace selectors exactly like the JS does
    pub selectors: Vec<Rc<ComplexSelector>>,
    pub properties: Rc<PropertyDict>,
}

pub struct RuleController {
    loader: Box<dyn SourceLoader>,
    generators: HashMap<String, Generator>,
    rules: RefCell<HashMap<String, std::result::Result<Rc<Collection>, CpsError>>>,
    flat: RefCell<HashMap<String, Rc<Vec<NamespacedRule>>>>,
}

impl RuleController {
    pub fn new(loader: Box<dyn SourceLoader>) -> Self {
        RuleController {
            loader,
            generators: HashMap::new(),
            rules: RefCell::new(HashMap::new()),
            flat: RefCell::new(HashMap::new()),
        }
    }

    pub fn register_generator(&mut self, name: &str, generator: Generator) {
        self.generators.insert(name.to_string(), generator);
    }

    /// `getRule(false, sourceName)`
    pub fn get_rule(&self, source_name: &str) -> Result<Rc<Collection>> {
        let mut importing = HashSet::new();
        self.get_rule_importing(source_name, &mut importing)
    }

    fn get_rule_importing(&self, source_name: &str, importing: &mut HashSet<String>) -> Result<Rc<Collection>> {
        if let Some(r) = self.rules.borrow().get(source_name) {
            return r.clone();
        }
        if importing.contains(source_name) {
            let mut chain: Vec<&String> = importing.iter().collect();
            chain.sort();
            return Err(CpsError::new(ErrorKind::Recursion, format!("{source_name} @imports itself")));
        }
        importing.insert(source_name.to_string());
        let source = if let Some(path) = source_name.strip_prefix("generated://") {
            self.generate(path)
        } else {
            self.loader.read(source_name)
        };
        let result = source.and_then(|src| {
            let mut resolver = Resolver { rc: self, importing };
            parse_cps(&src, &mut resolver).map(Rc::new)
        });
        importing.remove(source_name);
        // a recursion error is a property of the import chain, not of the file
        if !matches!(&result, Err(e) if e.kind == ErrorKind::Recursion) {
            self.rules.borrow_mut().insert(source_name.to_string(), result.clone());
        }
        result
    }

    fn generate(&self, path: &str) -> Result<String> {
        let mut parts = path.split('/');
        let name = parts.next().unwrap_or("");
        let version = parts.next().map(js_parse_int_or_nan).unwrap_or(f64::NAN);
        let args: Vec<GenArg> = match parts.next() {
            Some(a) if !a.is_empty() => a.split(',').map(parse_generator_arg).collect(),
            _ => vec![],
        };
        if version != 0.0 {
            return Err(CpsError::new(ErrorKind::Cps, format!(
                "There's yet no versioning API for CPS generators. Version: {}", mp_math::js_num(version))));
        }
        let gen = self.generators.get(name)
            .ok_or_else(|| CpsError::key(format!("Unknown CPS generator \"{name}\"")))?;
        Ok(gen(&args))
    }

    /// Drop a cached file (e.g. after it was edited) and everything derived.
    pub fn invalidate(&self, source_name: &str) {
        self.rules.borrow_mut().remove(source_name);
        self.flat.borrow_mut().clear();
    }

    /// Replace the parsed contents of a source (e.g. edited in the UI).
    pub fn set_rule(&self, source_name: &str, collection: Collection) {
        self.rules.borrow_mut().insert(source_name.to_string(), Ok(Rc::new(collection)));
        self.flat.borrow_mut().clear();
    }

    pub fn cached_sources(&self) -> Vec<String> {
        self.rules.borrow().keys().cloned().collect()
    }

    /// The namespaced rules of a source, in document order (imports inline).
    pub fn namespaced_rules(&self, source_name: &str) -> Result<Rc<Vec<NamespacedRule>>> {
        if let Some(f) = self.flat.borrow().get(source_name) {
            return Ok(f.clone());
        }
        let collection = self.get_rule(source_name)?;
        let mut out = vec![];
        flatten(&collection.items, None, &mut out);
        let out = Rc::new(out);
        self.flat.borrow_mut().insert(source_name.to_string(), out.clone());
        Ok(out)
    }
}

struct Resolver<'a> {
    rc: &'a RuleController,
    importing: &'a mut HashSet<String>,
}

impl ImportResolver for Resolver<'_> {
    fn get_rule(&mut self, resource: &str) -> Result<Rc<Collection>> {
        self.rc.get_rule_importing(resource, self.importing)
    }
}

fn js_parse_int_or_nan(s: &str) -> f64 {
    crate::selector::js_parse_int(s).map(|v| v as f64).unwrap_or(f64::NAN)
}

/// `_parseCPSGeneratorArgument`
fn parse_generator_arg(arg: &str) -> GenArg {
    // /^([+-]?(((\d+(\.)?)|(\d*\.\d+))([eE][+-]?\d+)?))$/
    let b = arg.as_bytes();
    let mut i = 0;
    if matches!(b.first(), Some(b'+') | Some(b'-')) { i += 1; }
    let d1 = b[i..].iter().take_while(|c| c.is_ascii_digit()).count();
    let mut ok = false;
    let mut j = i + d1;
    if d1 > 0 {
        ok = true;
        if b.get(j) == Some(&b'.') { j += 1; }
        let d2 = b[j..].iter().take_while(|c| c.is_ascii_digit()).count();
        // (\d+(\.)?) can't take more digits; (\d*\.\d+) can
        if d2 > 0 && b.get(i + d1) == Some(&b'.') { j += d2; }
    } else if b.get(i) == Some(&b'.') {
        let d2 = b[i + 1..].iter().take_while(|c| c.is_ascii_digit()).count();
        if d2 > 0 { ok = true; j = i + 1 + d2; }
    }
    if ok && matches!(b.get(j), Some(b'e') | Some(b'E')) {
        let mut k = j + 1;
        if matches!(b.get(k), Some(b'+') | Some(b'-')) { k += 1; }
        let d = b[k..].iter().take_while(|c| c.is_ascii_digit()).count();
        if d > 0 { j = k + d; } else { ok = false; }
    }
    if ok && j == b.len() {
        if let Ok(n) = arg.parse::<f64>() {
            if !n.is_nan() { return GenArg::Number(n); }
        }
    }
    GenArg::Str(arg.to_string())
}

fn compare_specificity(a: &[i64; 3], b: &[i64; 3]) -> std::cmp::Ordering {
    // descending
    b.cmp(a)
}

/// `_getNamespacedRules` without the bloom filter (which only skips
/// selectors that can't match and therefore doesn't change the result).
fn flatten(items: &[CollectionItem], namespace: Option<&[Rc<ComplexSelector>]>, out: &mut Vec<NamespacedRule>) {
    for item in items {
        match item {
            CollectionItem::Rule(rule) => {
                let mut sel: Vec<Rc<ComplexSelector>> = rule.selectors.selectors.iter()
                    .filter(|s| !s.invalid).cloned().collect();
                if sel.is_empty() { continue; }
                sel.sort_by(|a, b| compare_specificity(&a.specificity(), &b.specificity()));
                let selectors = match namespace {
                    Some(ns) => multiply(ns, &sel),
                    None => sel,
                };
                out.push(NamespacedRule { selectors, properties: rule.properties.clone() });
            }
            CollectionItem::Namespace(ns) => {
                let mut sel: Vec<Rc<ComplexSelector>> = ns.selectors.selectors.iter()
                    .filter(|s| !s.invalid).cloned().collect();
                if sel.is_empty() { continue; }
                sel.sort_by(|a, b| compare_specificity(&a.specificity(), &b.specificity()));
                let selectors = match namespace {
                    Some(outer) => multiply(outer, &sel),
                    None => sel,
                };
                flatten(&ns.items, Some(&selectors), out);
            }
            CollectionItem::Import { collection, .. } => flatten(&collection.items, namespace, out),
            CollectionItem::Comment(_) => {}
        }
    }
}

/// `_multiplyComplexSelectorLists`: every `a` × every `b`, `a`-major.
fn multiply(a: &[Rc<ComplexSelector>], b: &[Rc<ComplexSelector>]) -> Vec<Rc<ComplexSelector>> {
    let mut out = vec![];
    for x in a {
        for y in b {
            out.push(Rc::new(x.add(y)));
        }
    }
    out
}
