//! The cascade: port of Atem-CPS `_Controller.js` (rule lookup per element),
//! `SelectorEngine.js` (matching, `query`, `queryAll`), `StyleDict.js`
//! (computed values, caching, recursion detection) and the operator
//! implementations of `flavours/MOM/parser.js`.
//!
//! The JS keeps fine-grained dependency subscriptions so that edits only
//! invalidate what depends on them. Here the whole cache is dropped on any
//! change of the model or of the rules ([`Engine::invalidate`]); computing is
//! cheap enough for that.

use crate::document::PropertyDict;
use crate::error::{CpsError, ErrorKind, Result};
use crate::lang::{Item, Op};
use crate::rules::RuleController;
use crate::selector::{CombinatorType, ComplexSelector, CompoundSelector, Part, SelectorList, SimpleType};
use crate::value::{NodeId, Value};
use mp_math::{fp, hobby, js_num, Transform, Vector, IDENTITY};
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::rc::Rc;

/// The object model the cascade runs on (the OMA in the JS).
pub trait Model {
    fn root(&self) -> NodeId;
    fn parent(&self, n: NodeId) -> Option<NodeId>;
    fn children(&self, n: NodeId) -> &[NodeId];
    /// index in the parent's children
    fn index(&self, n: NodeId) -> Option<usize>;
    /// the CPS type name used by selectors (`glyph`, `center`, ...)
    fn node_type(&self, n: NodeId) -> &'static str;
    fn id(&self, n: NodeId) -> Option<&str>;
    fn has_class(&self, n: NodeId, class: &str) -> bool;
    /// `element.properties`: highest priority, unique to the element
    fn properties(&self, n: NodeId) -> &PropertyDict;
    /// whitelisted attributes (`element.cpsGet(key)`); errors for others
    fn cps_get(&self, n: NodeId, key: &str) -> Result<Value>;
    /// `element.checkPropertyValue(key, value)` (validators)
    fn check_property_value(&self, n: NodeId, key: &str, value: Value) -> Result<Value>;
    /// name of the CPS file whose rules apply (`controller.getCPSName`)
    fn cps_file(&self, n: NodeId) -> Option<String>;
    /// `element.particulars`, used in messages
    fn particulars(&self, n: NodeId) -> String;
}

pub struct Engine<M: Model> {
    pub model: M,
    pub rules: RuleController,
    cache: RefCell<HashMap<(NodeId, Rc<str>), std::result::Result<Value, CpsError>>>,
    getting: RefCell<HashSet<(NodeId, Rc<str>)>>,
    matched: RefCell<HashMap<NodeId, Rc<std::result::Result<Vec<Rc<PropertyDict>>, CpsError>>>>,
}

/// What a formula is evaluated for (`getAPI` in the JS).
#[derive(Clone, Copy)]
struct Ctx {
    element: NodeId,
}

enum Arg {
    Name(Rc<str>),
    Val(Value),
}

fn pl(msg: impl Into<String>) -> CpsError { CpsError::new(ErrorKind::PropertyLanguage, msg) }

/// JS `Math.min` for non-NaN numbers (keeps `-0 < +0`)
fn js_min(a: f64, b: f64) -> f64 {
    if a < b { a } else if b < a { b } else if a == 0.0 && (a.is_sign_negative() || b.is_sign_negative()) { -0.0 } else { a }
}
fn js_max(a: f64, b: f64) -> f64 {
    if a > b { a } else if b > a { b } else if a == 0.0 && (a.is_sign_positive() || b.is_sign_positive()) { 0.0 } else { a }
}
/// JS `Math.pow`: like C `pow` except `pow(±1, ±Infinity)` and `pow(1, NaN)` are NaN
pub fn js_pow(x: f64, y: f64) -> f64 {
    if y.is_nan() { return f64::NAN; }
    if y.is_infinite() && x.abs() == 1.0 { return f64::NAN; }
    fp::pow(x, y)
}

/// complex `Vector['**'](z)`
fn complex_pow(base: Vector, z: Vector) -> Vector {
    // log(k=0): (ln|this|, angle + 0 * 2 * PI)
    let log = Vector::new(fp::ln(base.magnitude()), base.angle() + 0.0 * 2.0 * std::f64::consts::PI);
    let r = z * log;
    // exp(): fromPolar(exp(real), imag)
    Vector::from_polar(fp::exp(r.x), r.y)
}

impl<M: Model> Engine<M> {
    pub fn new(model: M, rules: RuleController) -> Self {
        Engine {
            model,
            rules,
            cache: RefCell::new(HashMap::new()),
            getting: RefCell::new(HashSet::new()),
            matched: RefCell::new(HashMap::new()),
        }
    }

    /// Drop all computed values and rule matches.
    pub fn invalidate(&self) {
        self.cache.borrow_mut().clear();
        self.matched.borrow_mut().clear();
    }

    /// Mutable access to the model; invalidates everything.
    pub fn model_mut(&mut self) -> &mut M {
        self.invalidate();
        &mut self.model
    }

    // ------------------------------------------------------------ matching

    fn compound_matches(&self, cs: &CompoundSelector, n: NodeId) -> Result<bool> {
        if let Some(e) = &cs.compile_error { return Err(e.clone()); }
        for s in &cs.value {
            let name = s.name.as_deref().unwrap_or("");
            let ok = match s.ty {
                Some(SimpleType::Type) => self.model.node_type(n) == name,
                Some(SimpleType::Id) => self.model.id(n) == Some(name),
                Some(SimpleType::Class) => self.model.has_class(n, name),
                Some(SimpleType::PseudoClass) => {
                    if name == "i" {
                        match self.model.parent(n) {
                            None => false,
                            Some(p) => {
                                let v = s.value.unwrap_or(0);
                                let idx = self.model.index(n).map(|i| i as i64);
                                if v < 0 {
                                    Some(self.model.children(p).len() as i64 + v) == idx
                                } else {
                                    Some(v) == idx
                                }
                            }
                        }
                    } else { false }
                }
                Some(SimpleType::Universal) => true,
                _ => false,
            };
            if !ok { return Ok(false); }
        }
        Ok(true)
    }

    /// `_complexSelectorMatches` (bottom-up, element and ancestors)
    fn complex_matches(&self, sel: &ComplexSelector, element: NodeId) -> Result<bool> {
        let mut parts: Vec<&Part> = sel.value.iter().collect();
        let mut combinator = CombinatorType::Child;
        let mut compound = match parts.pop() { Some(Part::Compound(c)) => c, _ => return Ok(false) };
        let mut el = Some(element);
        while let Some(e) = el {
            if self.compound_matches(compound, e)? {
                match parts.pop() {
                    None => return Ok(true),
                    Some(Part::Combinator(c)) => combinator = c.ty,
                    Some(Part::Compound(_)) => return Ok(false),
                }
                compound = match parts.pop() { Some(Part::Compound(c)) => c, _ => return Ok(false) };
                el = self.model.parent(e);
            } else if combinator == CombinatorType::Child {
                el = None;
            } else if combinator == CombinatorType::Descendant {
                el = self.model.parent(e);
            } else {
                return Err(CpsError::cps("Combinator type is unsuported"));
            }
        }
        Ok(false)
    }

    /// `[element.properties] + getRulesForElement(element)`, sorted.
    pub fn rules_for(&self, n: NodeId) -> Rc<std::result::Result<Vec<Rc<PropertyDict>>, CpsError>> {
        if let Some(r) = self.matched.borrow().get(&n) {
            return r.clone();
        }
        let r = Rc::new(self.compute_rules(n));
        self.matched.borrow_mut().insert(n, r.clone());
        r
    }

    fn compute_rules(&self, n: NodeId) -> std::result::Result<Vec<Rc<PropertyDict>>, CpsError> {
        let mut out: Vec<Rc<PropertyDict>> = vec![];
        let Some(file) = self.model.cps_file(n) else { return Ok(out); };
        let namespaced = self.rules.namespaced_rules(&file)?;
        let mut matching: Vec<([i64; 3], usize)> = vec![];
        for (i, rule) in namespaced.iter().enumerate() {
            for sel in &rule.selectors {
                if self.complex_matches(sel, n)? {
                    matching.push((sel.specificity(), i));
                    break;
                }
            }
        }
        // descending by [a, b, c, ruleIndex]
        matching.sort_by(|x, y| (y.0, y.1).cmp(&(x.0, x.1)));
        out.extend(matching.into_iter().map(|(_, i)| namespaced[i].properties.clone()));
        Ok(out)
    }

    /// First property `key` in `[element.properties] + rules`. Like
    /// `StyleDict._buildIndex`, the rules are loaded first: when the CPS file
    /// fails to load, even the element's own properties are unavailable.
    fn lookup_property(&self, n: NodeId, key: &str) -> Result<Option<Rc<crate::document::Property>>> {
        let rules = self.rules_for(n);
        let dicts = match &*rules {
            Err(e) => return Err(e.clone()),
            Ok(d) => d,
        };
        if let Some(p) = self.model.properties(n).get(key) {
            return Ok(Some(p.clone()));
        }
        for d in dicts {
            if let Some(p) = d.get(key) { return Ok(Some(p.clone())); }
        }
        Ok(None)
    }

    // ------------------------------------------------------------ queries

    /// `_combinateFirst` / `_combinateAll` (top-down, depth first, pre-order)
    fn combinate(&self, descendant: bool, element: NodeId, parts: &[Part], first_only: bool,
                 seen: &mut HashSet<NodeId>, results: &mut Vec<NodeId>) -> Result<bool> {
        let compound = match parts.first() { Some(Part::Compound(c)) => c, _ => return Ok(false) };
        let mut stack: Vec<(Vec<NodeId>, usize)> = vec![(self.model.children(element).to_vec(), 0)];
        while let Some((children, mut i)) = stack.pop() {
            while i < children.len() {
                let child = children[i];
                i += 1;
                if self.compound_matches(compound, child)? {
                    match parts.get(1) {
                        None => {
                            if first_only {
                                results.push(child);
                                return Ok(true);
                            }
                            if seen.insert(child) { results.push(child); }
                        }
                        Some(Part::Combinator(c)) => {
                            let desc = match c.ty {
                                CombinatorType::Descendant => true,
                                CombinatorType::Child => false,
                                _ => return Err(CpsError::cps("Combinator type is unsuported")),
                            };
                            if self.combinate(desc, child, &parts[2..], first_only, seen, results)? && first_only {
                                return Ok(true);
                            }
                        }
                        Some(Part::Compound(_)) => {}
                    }
                }
                if !descendant { continue; }
                if i < children.len() {
                    stack.push((children.clone(), i));
                }
                stack.push((self.model.children(child).to_vec(), 0));
                break;
            }
        }
        Ok(false)
    }

    /// `node.query(selector)`: first descendant of `scope` matching.
    pub fn query(&self, scope: NodeId, selector: &SelectorList) -> Result<Option<NodeId>> {
        for cs in &selector.selectors {
            let mut results = vec![];
            let mut seen = HashSet::new();
            if self.combinate(true, scope, &cs.value, true, &mut seen, &mut results)? {
                return Ok(results.pop());
            }
        }
        Ok(None)
    }

    /// `node.queryAll(selector)`
    pub fn query_all(&self, scope: NodeId, selector: &SelectorList) -> Result<Vec<NodeId>> {
        let mut seen = HashSet::new();
        let mut results = vec![];
        for cs in &selector.selectors {
            self.combinate(true, scope, &cs.value, false, &mut seen, &mut results)?;
        }
        Ok(results)
    }

    pub fn query_str(&self, scope: NodeId, selector: &str) -> Result<Option<NodeId>> {
        self.query(scope, &SelectorList::parse(selector, true)?)
    }

    pub fn query_all_str(&self, scope: NodeId, selector: &str) -> Result<Vec<NodeId>> {
        self.query_all(scope, &SelectorList::parse(selector, true)?)
    }

    // ------------------------------------------------------------ StyleDict

    /// `getComputedStyle(n).get(key)`
    pub fn get(&self, n: NodeId, key: &str) -> Result<Value> {
        let k: Rc<str> = Rc::from(key);
        if let Some(r) = self.cache.borrow().get(&(n, k.clone())) {
            return r.clone();
        }
        let result = self.get_uncached(n, &k);
        match &result {
            Err(e) if e.is_recursion() => {}
            _ => { self.cache.borrow_mut().insert((n, k), result.clone()); }
        }
        result
    }

    /// `getComputedStyle(n).get(key, default)`
    pub fn get_or(&self, n: NodeId, key: &str, default: Value) -> Value {
        self.get(n, key).unwrap_or(default)
    }

    fn get_uncached(&self, n: NodeId, key: &Rc<str>) -> Result<Value> {
        if &**key == "this" {
            return Ok(Value::Node(n));
        }
        let gk = (n, key.clone());
        if self.getting.borrow().contains(&gk) {
            return Err(CpsError::new(ErrorKind::Recursion, format!(
                "Looking up \"{key}\" is causing recursion in the element: {}", self.model.particulars(n))));
        }
        self.getting.borrow_mut().insert(gk.clone());
        let r = self.compute(n, key);
        self.getting.borrow_mut().remove(&gk);
        match r {
            Ok(v) => Ok(v),
            Err(e) if e.is_recursion() => Err(e),
            Err(e) => Err(CpsError::key(format!("{}: {}", self.model.particulars(n), e.message))),
        }
    }

    fn compute(&self, n: NodeId, key: &str) -> Result<Value> {
        match self.lookup_property(n, key)? {
            Some(prop) => {
                let expr = prop.value.expr.as_ref().map_err(|m| pl(m.clone()))?.clone();
                let v = self.execute(&expr.items, Ctx { element: n })?;
                if matches!(v, Value::Undefined) {
                    return Err(CpsError::value(format!(
                        "The formula of \"{key}\" in a {} returned `undefined` which is never valid",
                        self.model.particulars(n))));
                }
                self.model.check_property_value(n, key, v)
            }
            None => self.model.cps_get(n, key),
        }
    }

    /// `getAPI.genericGetter(item, key)`
    pub fn generic_getter(&self, item: &Value, key: &Value) -> Result<Value> {
        match item {
            Value::Undefined => Err(CpsError::type_error(format!("trying to read \"{key}\" from an undefined item"))),
            Value::Node(n) => {
                let k = match key {
                    Value::String(s) => s.to_string(),
                    Value::Number(x) => js_num(*x),
                    other => other.to_string(),
                };
                if !matches!(key, Value::String(_)) {
                    // a property can still be found under the stringified key;
                    // cpsGet rejects non-string keys
                    if let Some(_p) = self.lookup_property(*n, &k)? {
                        return self.get(*n, &k);
                    }
                    return Err(CpsError::key(format!("name must be string but it is: {}", key.type_name())));
                }
                self.get(*n, &k)
            }
            Value::Vector(v) => {
                let k = key.as_str().ok_or_else(|| CpsError::key(format!("name must be string but it is: {}", key.type_name())))?;
                match k {
                    "x" => Ok(Value::Number(v.x)),
                    "y" => Ok(Value::Number(v.y)),
                    "length" => Ok(Value::Number(v.magnitude())),
                    "angle" => Ok(Value::Number(v.angle())),
                    _ => Err(CpsError::key(format!("Name \"{k}\" is not whitelisted for item \"{v}\" x, y, length, angle"))),
                }
            }
            Value::Array(a) => array_get(a, key),
            Value::Null => Err(CpsError::type_error(format!("Cannot read properties of null (reading '{key}')"))),
            other => Err(CpsError::key(format!("Item \"{other}\" doesn't specify a whitelist for cps, trying to read {key}"))),
        }
    }

    // ------------------------------------------------------------ execution

    fn execute(&self, items: &[Item], ctx: Ctx) -> Result<Value> {
        let mut stack: Vec<Arg> = Vec::with_capacity(items.len());
        for item in items {
            match item {
                Item::Name(n) => stack.push(Arg::Name(n.clone())),
                Item::Number(x) => stack.push(Arg::Val(Value::Number(*x))),
                Item::Str(s) => stack.push(Arg::Val(Value::String(s.clone()))),
                Item::Selector(s) => stack.push(Arg::Val(Value::Selector(s.clone()))),
                Item::Op { op, consumes } => {
                    let args = stack.split_off(stack.len() - consumes);
                    let v = self.exec_op(*op, args, ctx)?;
                    stack.push(Arg::Val(v));
                }
            }
        }
        // CPSStack._finalizeMethod
        match stack.pop() {
            Some(Arg::Name(n)) => self.get(ctx.element, &n),
            Some(Arg::Val(Value::Selector(sl))) => {
                let host = self.get(ctx.element, "this")?;
                let node = self.generic_getter(&host, &Value::str("multivers"))?;
                let node = node.as_node().ok_or_else(|| CpsError::type_error("multivers is not a node"))?;
                self.query(node, &sl)?.map(Value::Node)
                    .ok_or_else(|| pl(format!("Not found: an element for {sl}")))
            }
            Some(Arg::Val(v)) => Ok(v),
            None => Err(pl("No result: stack is empty after execution.")),
        }
    }

    fn unbox(&self, a: Arg, ctx: Ctx) -> Result<Value> {
        match a {
            Arg::Name(n) => self.get(ctx.element, &n),
            Arg::Val(v) => Ok(v),
        }
    }

    fn unbox_all(&self, args: Vec<Arg>, ctx: Ctx) -> Result<Vec<Value>> {
        args.into_iter().map(|a| self.unbox(a, ctx)).collect()
    }

    fn no_impl(op: Op, args: &[Value]) -> CpsError {
        pl(format!("Can't find an implementation for the operator \"{}\" that matches the given combination of argument types:\n{}",
            op.literal(),
            args.iter().map(|a| format!("\"{a}\" (typeof: {})", a.type_name())).collect::<Vec<_>>().join(", ")))
    }

    fn exec_op(&self, op: Op, args: Vec<Arg>, ctx: Ctx) -> Result<Value> {
        use Value as V;
        match op {
            Op::Get => {
                // boxed methods first
                if let (Arg::Name(name), Arg::Val(V::String(key))) = (&args[0], &args[1]) {
                    let item = self.get(ctx.element, name)?;
                    return self.generic_getter(&item, &V::String(key.clone()));
                }
                if let (Arg::Name(n1), Arg::Name(n2)) = (&args[0], &args[1]) {
                    let item = self.get(ctx.element, n1)?;
                    let key = self.get(ctx.element, n2)?;
                    return self.generic_getter(&item, &key);
                }
                let v = self.unbox_all(args, ctx)?;
                if let (V::Node(n), V::Selector(sl)) = (&v[0], &v[1]) {
                    return self.query(*n, sl)?.map(V::Node).ok_or_else(|| pl(format!(
                        "Not found: an element for {sl} in {}", self.model.particulars(*n))));
                }
                if v[1].as_number().is_some() || matches!(v[1], V::String(_)) {
                    return self.generic_getter(&v[0], &v[1]);
                }
                Err(Self::no_impl(op, &v))
            }
            Op::Colon => {
                let key = match &args[1] {
                    Arg::Name(k) => k.clone(),
                    Arg::Val(v) => return Err(Self::no_impl(op, &[match &args[0] { Arg::Val(x) => x.clone(), Arg::Name(n) => V::String(n.clone()) }, v.clone()])),
                };
                match &args[0] {
                    Arg::Name(name) => {
                        let item = self.get(ctx.element, name)?;
                        self.generic_getter(&item, &V::String(key))
                    }
                    Arg::Val(V::Selector(sl)) => {
                        let host = self.get(ctx.element, "this")?;
                        let node = self.generic_getter(&host, &V::str("multivers"))?;
                        let node = node.as_node().ok_or_else(|| CpsError::type_error("multivers is not a node"))?;
                        let item = self.query(node, sl)?.ok_or_else(|| pl(format!("Not found: an element for {sl}")))?;
                        self.generic_getter(&V::Node(item), &V::String(key))
                    }
                    Arg::Val(item) => self.generic_getter(item, &V::String(key)),
                }
            }
            Op::List => Ok(V::Array(Rc::new(self.unbox_all(args, ctx)?))),
            Op::Print => {
                let v = self.unbox_all(args, ctx)?;
                Ok(v.into_iter().next().unwrap_or(V::Undefined))
            }
            Op::Identity => Ok(V::Transform(IDENTITY)),
            _ => {
                let v = self.unbox_all(args, ctx)?;
                self.exec_unboxed(op, v)
            }
        }
    }

    fn exec_unboxed(&self, op: Op, v: Vec<Value>) -> Result<Value> {
        use Value as V;
        let num = |i: usize| v.get(i).and_then(|x| x.as_number());
        let vec = |i: usize| v.get(i).and_then(|x| x.as_vector());
        let tr = |i: usize| v.get(i).and_then(|x| x.as_transform());
        let r = match op {
            Op::Negate => {
                if let Some(a) = num(0) { Some(V::Number(-a)) }
                else if let Some(a) = vec(0) { Some(V::Vector(-a)) }
                else { tr(0).map(|t| V::Transform(t.inverse())) }
            }
            Op::Add => match (&v[0], &v[1]) {
                _ if num(0).is_some() && num(1).is_some() => Some(V::Number(num(0).unwrap() + num(1).unwrap())),
                (V::String(a), V::String(b)) => Some(V::String(Rc::from(format!("{a}{b}")))),
                (V::Array(a), V::Array(b)) => Some(V::Array(Rc::new(a.iter().chain(b.iter()).cloned().collect()))),
                (V::Vector(a), V::Vector(b)) => Some(V::Vector(*a + *b)),
                (V::Vector(a), _) if num(1).is_some() => Some(V::Vector(*a + Vector::new(num(1).unwrap(), 0.0))),
                _ => None,
            },
            Op::Sub => match (&v[0], &v[1]) {
                _ if num(0).is_some() && num(1).is_some() => Some(V::Number(num(0).unwrap() - num(1).unwrap())),
                (V::Vector(a), V::Vector(b)) => Some(V::Vector(*a - *b)),
                (V::Vector(a), _) if num(1).is_some() => Some(V::Vector(*a - Vector::new(num(1).unwrap(), 0.0))),
                _ => None,
            },
            Op::Mul => match (&v[0], &v[1]) {
                _ if num(0).is_some() && num(1).is_some() => Some(V::Number(num(0).unwrap() * num(1).unwrap())),
                (V::Vector(a), V::Vector(b)) => Some(V::Vector(*a * *b)),
                (V::Vector(a), _) if num(1).is_some() => Some(V::Vector(*a * num(1).unwrap())),
                (V::Transform(t), V::Vector(p)) => Some(V::Vector(Vector::from(t.transform_point([p.x, p.y])))),
                (V::Transform(t1), V::Transform(t2)) => Some(V::Transform(t1.transform(t2))),
                _ => None,
            },
            Op::Div => match (&v[0], &v[1]) {
                _ if num(0).is_some() && num(1).is_some() => Some(V::Number(num(0).unwrap() / num(1).unwrap())),
                (V::Vector(a), V::Vector(b)) => Some(V::Vector(*a / *b)),
                (V::Vector(a), _) if num(1).is_some() => Some(V::Vector(*a / num(1).unwrap())),
                _ => None,
            },
            Op::Pow => match (&v[0], &v[1]) {
                _ if num(0).is_some() && num(1).is_some() => Some(V::Number(js_pow(num(0).unwrap(), num(1).unwrap()))),
                (V::Vector(a), V::Vector(b)) => Some(V::Vector(complex_pow(*a, *b))),
                (V::Vector(a), _) if num(1).is_some() => Some(V::Vector(complex_pow(*a, Vector::new(num(1).unwrap(), 0.0)))),
                _ => None,
            },
            Op::Min => match (num(0), num(1)) { (Some(a), Some(b)) => Some(V::Number(js_min(a, b))), _ => None },
            Op::Max => match (num(0), num(1)) { (Some(a), Some(b)) => Some(V::Number(js_max(a, b))), _ => None },
            Op::Vector => match (num(0), num(1)) { (Some(a), Some(b)) => Some(V::Vector(Vector::new(a, b))), _ => None },
            Op::Polar => match (num(0), num(1)) { (Some(a), Some(b)) => Some(V::Vector(Vector::from_polar(a, b))), _ => None },
            Op::Tension2ControlOut | Op::Tension2ControlIn | Op::Tension2MagnitudeIn | Op::Tension2MagnitudeOut
            | Op::Magnitude2TensionOut | Op::Magnitude2TensionIn => {
                match (vec(0), num(1), num(2), num(3), vec(4)) {
                    (Some(z0), Some(a), Some(b), Some(c), Some(z1)) => Some(match op {
                        Op::Tension2ControlOut => V::Vector(hobby::tension2control_out(z0, a, b, c, z1)),
                        Op::Tension2ControlIn => V::Vector(hobby::tension2control_in(z0, a, b, c, z1)),
                        Op::Tension2MagnitudeIn => V::Number(hobby::tension2magnitude_in(z0, a, b, c, z1)),
                        Op::Tension2MagnitudeOut => V::Number(hobby::tension2magnitude_out(z0, a, b, c, z1)),
                        Op::Magnitude2TensionOut => V::Number(hobby::magnitude2tension_out(z0, a, b, c, z1)),
                        _ => V::Number(hobby::magnitude2tension_in(z0, a, b, c, z1)),
                    }),
                    _ => None,
                }
            }
            Op::Deg => num(0).map(|a| V::Number(a * std::f64::consts::PI / 180.0)),
            Op::NormalizeAngle => num(0).map(|a| V::Number(mp_math::normalize_angle(a))),
            Op::Scaling => match (num(0), num(1)) { (Some(x), Some(y)) => Some(V::Transform(Transform::scaling(x, Some(y)))), _ => None },
            Op::Translation => match (num(0), num(1)) { (Some(x), Some(y)) => Some(V::Transform(Transform::offset(x, y))), _ => None },
            Op::Skew => match (num(0), num(1)) { (Some(x), Some(y)) => Some(V::Transform(IDENTITY.skew(x, y))), _ => None },
            Op::Rotation => num(0).map(|a| V::Transform(IDENTITY.rotate(a))),
            // upstream bug kept: `new Transformation(xx, xy, ...)` passes the six
            // numbers as separate arguments to a constructor that expects one
            // array, so the result is always the identity
            Op::Transformation => if (0..6).all(|i| num(i).is_some()) { Some(V::Transform(IDENTITY)) } else { None },
            Op::Selector => match &v[0] {
                V::String(s) => return SelectorList::parse(s, false).map(|sl| V::Selector(Rc::new(sl))),
                _ => None,
            },
            Op::List | Op::Get | Op::Colon | Op::Print | Op::Identity => unreachable!(),
        };
        r.ok_or_else(|| Self::no_impl(op, &v))
    }
}

/// `whitelisting.arrayGet`
fn array_get(a: &[Value], key: &Value) -> Result<Value> {
    if key.as_str() == Some("length") {
        return Ok(Value::Number(a.len() as f64));
    }
    let k: Option<f64> = match key {
        Value::String(s) => {
            let t = s.trim_start_matches(['+', '-']);
            let ok = !t.is_empty() && t.chars().all(|c| c.is_ascii_digit()) && s.len() - t.len() <= 1;
            if ok { s.parse::<f64>().ok() } else { None }
        }
        Value::Number(n) => Some(*n),
        _ => None,
    };
    // isInt: n === (n|0)
    let k = match k {
        Some(n) if n == ((n as i64 as i32) as f64) && !n.is_nan() => n as i64,
        _ => return Err(CpsError::key(format!("Key must be \"length\" or an integer but it is: {key} {}", key.type_name()))),
    };
    let idx = if k < 0 { a.len() as i64 + k } else { k };
    if idx < 0 || idx >= a.len() as i64 {
        return Err(CpsError::key(format!("The index \"{k}\" is not in the array. Length: {}", a.len())));
    }
    Ok(a[idx as usize].clone())
}
