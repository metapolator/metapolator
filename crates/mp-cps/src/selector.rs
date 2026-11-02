//! Selectors: port of Atem-CPS `CPS/elements/{SimpleSelector,CompoundSelector,
//! ComplexSelector,Combinator,SelectorList}.js` plus the selector parts of
//! `parsing/selectorFactories.js` and `parsing/parseSelectorList.js`.

use crate::error::{CpsError, Result};
use crate::gonzales::{self, Ast};
use std::fmt;
use std::rc::Rc;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SimpleType {
    Universal,
    Type,
    Class,
    Id,
    PseudoClass,
    PseudoElement,
}

#[derive(Clone, Debug, PartialEq)]
pub struct SimpleSelector {
    /// `None`: an unsupported AST type (JS: `type === undefined`)
    pub ty: Option<SimpleType>,
    pub name: Option<String>,
    /// value of `:i(n)`
    pub value: Option<i64>,
    pub invalid: bool,
    pub message: Option<String>,
    /// the implicit `*` CompoundSelector prepends
    pub implicit: bool,
}

impl SimpleSelector {
    pub fn new(ty: Option<SimpleType>, name: Option<String>, value: Option<i64>) -> Self {
        // `name.replace('\\', '')`: removes the FIRST backslash only
        let name = name.map(|n| match n.find('\\') {
            Some(p) => format!("{}{}", &n[..p], &n[p + 1..]),
            None => n,
        });
        let (mut invalid, mut message) = (false, None);
        if ty.is_none() {
            invalid = true;
            message = Some("Type of SimpleSelector is unsupported:undefined".to_string());
        } else if name.is_none() {
            invalid = true;
            message = Some("Name of SimpleSelector is unkown!".to_string());
        } else if ty == Some(SimpleType::PseudoClass) && name.as_deref() == Some("i") && value.is_none() {
            invalid = true;
            message = Some("No valid value for pseudoclass \"i\": (undefined) undefined".to_string());
        }
        SimpleSelector { ty, name, value, invalid, message, implicit: false }
    }

    pub fn universal_implicit() -> Self {
        let mut s = SimpleSelector::new(Some(SimpleType::Universal), Some("*".into()), None);
        s.implicit = true;
        s
    }

    /// `SimpleSelector.prototype.escape`: `String.replace` with a string
    /// pattern only replaces the first occurrence of each character.
    pub fn escape(s: &str) -> String {
        let mut result = s.to_string();
        for c in "\\#.: (){}>+".chars() {
            if let Some(p) = result.find(c) {
                result = format!("{}\\{}{}", &result[..p], c, &result[p + c.len_utf8()..]);
            }
        }
        result
    }

    pub fn specificity(&self) -> [i64; 3] {
        match self.ty {
            Some(SimpleType::Id) => [1, 0, 0],
            Some(SimpleType::Class) | Some(SimpleType::PseudoClass) => [0, 1, 0],
            Some(SimpleType::Type) | Some(SimpleType::PseudoElement) => [0, 0, 1],
            _ => [0, 0, 0],
        }
    }

    pub fn to_string_escaped(&self, unescaped: bool) -> String {
        let raw = self.name.clone().unwrap_or_else(|| "undefined".into());
        let name = if unescaped { raw } else { Self::escape(&raw) };
        match self.ty {
            Some(SimpleType::Universal) | Some(SimpleType::Type) => name,
            Some(SimpleType::Class) => format!(".{name}"),
            Some(SimpleType::Id) => format!("#{name}"),
            Some(SimpleType::PseudoElement) => format!("::{name}"),
            Some(SimpleType::PseudoClass) => match self.value {
                Some(v) => format!(":{name}({v})"),
                None => format!(":{name}"),
            },
            None => "undefined".into(),
        }
    }

    fn order(&self) -> i32 {
        match self.ty {
            Some(SimpleType::Type) | Some(SimpleType::Universal) => 0,
            Some(SimpleType::Id) => 1,
            Some(SimpleType::PseudoClass) => 2,
            Some(SimpleType::Class) => 3,
            _ => 0,
        }
    }
}

impl fmt::Display for SimpleSelector {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.to_string_escaped(false))
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct CompoundSelector {
    pub value: Vec<SimpleSelector>,
    pub invalid: bool,
    pub message: Option<String>,
    /// what compiling this selector throws (see `check_compilable`)
    pub compile_error: Option<CpsError>,
}

impl CompoundSelector {
    pub fn new(selectors: Vec<SimpleSelector>) -> Result<Self> {
        if selectors.is_empty() {
            return Err(CpsError::cps("CompoundSelector has no SimpleSelector items"));
        }
        let mut value = selectors;
        if !matches!(value[0].ty, Some(SimpleType::Universal) | Some(SimpleType::Type)) {
            value.insert(0, SimpleSelector::universal_implicit());
        }
        let (mut invalid, mut message) = (false, None);
        for (i, s) in value.iter().enumerate() {
            if s.invalid {
                invalid = true;
                message = Some(format!("Invalid selector: {s}"));
                break;
            }
            if i != 0 && matches!(s.ty, Some(SimpleType::Universal) | Some(SimpleType::Type)) {
                invalid = true;
                message = Some(format!(
                    "Type Selector and Universal selector can only be the first in a CompoundSelector but found \"{s}\" at position: {}",
                    i + 1));
                break;
            }
        }
        let mut cs = CompoundSelector { value, invalid, message, compile_error: None };
        cs.compile_error = cs.check_compilable().err();
        Ok(cs)
    }

    pub fn specificity(&self) -> [i64; 3] {
        let mut r = [0; 3];
        for s in &self.value {
            let sp = s.specificity();
            for k in 0..3 { r[k] += sp[k]; }
        }
        r
    }

    /// `normalizedValue`: sorted with the (buggy) JS comparator
    /// `val || (a.name < b.name) ? -1 : (a.name > b.name ? 1 : 0)`.
    /// Only used for the cache key / display; matching is order independent.
    pub fn normalized_value(&self) -> Vec<SimpleSelector> {
        let mut v = self.value.clone();
        // JS Array.prototype.sort is stable (V8 >= 7.0); so is sort_by
        v.sort_by(|a, b| {
            let val = b.order() - a.order();
            let r = if val != 0 || a.name < b.name { -1 } else if a.name > b.name { 1 } else { 0 };
            r.cmp(&0)
        });
        v
    }

    pub fn normalized_name(&self) -> String {
        self.normalized_value().iter().map(|s| s.to_string()).collect()
    }

    /// The compiled selector check (`SelectorEngine._compileCompoundSelector`).
    /// Errors are raised when compiling an invalid selector or a
    /// pseudo-element, which the JS does at parse time when a selector engine
    /// is available and at match time otherwise.
    pub fn check_compilable(&self) -> Result<()> {
        if let Some(e) = &self.compile_error { return Err(e.clone()); }
        for s in self.normalized_value() {
            if s.invalid {
                return Err(CpsError::cps(format!(
                    "simpleSelector \"{}\" is invalid: {}", s, s.message.clone().unwrap_or_default())));
            }
            if s.ty == Some(SimpleType::PseudoElement) {
                return Err(CpsError::cps("simpleSelector.type \"pseudo-element\" is not implemented."));
            }
        }
        Ok(())
    }
}

impl fmt::Display for CompoundSelector {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let skip = if self.value.first().map(|s| s.implicit).unwrap_or(false) { 1 } else { 0 };
        for s in &self.value[skip..] { write!(f, "{s}")?; }
        Ok(())
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CombinatorType {
    Child,
    Descendant,
    NextSibling,
    FollowingSibling,
    Unknown,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Combinator {
    pub value: String,
    pub ty: CombinatorType,
}

impl Combinator {
    pub fn new(value: &str) -> Self {
        let ty = match value {
            ">" => CombinatorType::Child,
            " " => CombinatorType::Descendant,
            "+" => CombinatorType::NextSibling,
            "~" => CombinatorType::FollowingSibling,
            _ => CombinatorType::Unknown,
        };
        Combinator { value: value.to_string(), ty }
    }
}

impl fmt::Display for Combinator {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.value == " " { f.write_str(" ") } else { write!(f, " {} ", self.value) }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum Part {
    Compound(CompoundSelector),
    Combinator(Combinator),
}

#[derive(Clone, Debug, PartialEq)]
pub struct ComplexSelector {
    pub value: Vec<Part>,
    pub invalid: bool,
    pub message: Option<String>,
}

impl ComplexSelector {
    pub fn new(value: Vec<Part>) -> Self {
        let (mut invalid, mut message) = (false, None::<String>);
        if value.is_empty() {
            invalid = true;
            message = Some("A selector must not be empty".into());
        } else if let Some(Part::Combinator(c)) = value.last() {
            invalid = true;
            message = Some(format!("The last item of a selector must not be a combinator, found: {}", c.value));
        } else {
            for (i, item) in value.iter().enumerate() {
                match item {
                    Part::Combinator(c) => {
                        if i == 0 {
                            invalid = true;
                            message = Some("The first item in a selector must not be a combinator".into());
                        } else if !matches!(c.ty, CombinatorType::Child | CombinatorType::Descendant) {
                            invalid = true;
                            message = Some(format!("The combinator type \"{}\" is alien to us", match c.ty {
                                CombinatorType::NextSibling => "next-sibling",
                                CombinatorType::FollowingSibling => "following-sibling",
                                _ => "unknown",
                            }));
                        }
                    }
                    Part::Compound(cs) => {
                        if cs.invalid {
                            invalid = true;
                            message = cs.message.clone();
                        }
                    }
                }
                if invalid { break; }
            }
        }
        ComplexSelector { value, invalid, message }
    }

    pub fn specificity(&self) -> [i64; 3] {
        let mut r = [0; 3];
        for p in &self.value {
            if let Part::Compound(c) = p {
                let s = c.specificity();
                for k in 0..3 { r[k] += s[k]; }
            }
        }
        r
    }

    pub fn normalized_name(&self) -> String {
        self.value.iter().map(|p| match p {
            Part::Compound(c) => c.normalized_name(),
            Part::Combinator(c) => c.to_string(),
        }).collect()
    }

    /// `ComplexSelector.add(a, b)`: `a b` (descendant)
    pub fn add(&self, b: &ComplexSelector) -> ComplexSelector {
        let mut value = self.value.clone();
        value.push(Part::Combinator(Combinator::new(" ")));
        value.extend(b.value.iter().cloned());
        ComplexSelector::new(value)
    }

    pub fn compounds(&self) -> impl Iterator<Item = &CompoundSelector> {
        self.value.iter().filter_map(|p| match p { Part::Compound(c) => Some(c), _ => None })
    }
}

impl fmt::Display for ComplexSelector {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for p in &self.value {
            match p {
                Part::Compound(c) => write!(f, "{c}")?,
                Part::Combinator(c) => write!(f, "{c}")?,
            }
        }
        Ok(())
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct SelectorList {
    pub selectors: Vec<Rc<ComplexSelector>>,
    pub invalid: bool,
    pub message: Option<String>,
}

impl SelectorList {
    pub fn new(selectors: Vec<Rc<ComplexSelector>>) -> Self {
        let (mut invalid, mut message) = (false, None);
        let mut count = 0;
        for s in &selectors {
            if s.invalid {
                invalid = true;
                message = s.message.clone();
                break;
            }
            count += 1;
        }
        if !invalid && count == 0 {
            invalid = true;
            message = Some("SelectorList has no valid selector".into());
        }
        SelectorList { selectors, invalid, message }
    }

    pub fn selects(&self) -> bool { !self.invalid }

    /// `parseSelectorList.fromString`. `compile`: whether a selector engine is
    /// passed (then invalid / pseudo-element simple selectors throw here).
    pub fn parse(string: &str, compile: bool) -> Result<SelectorList> {
        let ast = gonzales::parse_selector_source(string).map_err(|e| CpsError::new(
            crate::error::ErrorKind::Cps,
            format!("Error parsing \"{string}\" as a selector. Message: {}", e.message)))?;
        let ast = ast.ok_or_else(|| CpsError::cps("No selector found."))?;
        let mut result: Option<SelectorList> = None;
        for item in ast.items() {
            match item.ty() {
                Some("s") => continue,
                Some("comment") => continue,
                Some("ruleset") => {
                    let rs = item.items();
                    let sel = rs.first().filter(|a| a.ty() == Some("selector"))
                        .ok_or_else(|| CpsError::cps("The first child of \"ruleset\" is expected to be a \"selector\""))?;
                    if rs.get(1).and_then(|a| a.ty()) != Some("block") {
                        return Err(CpsError::cps("The second child of \"ruleset\" is expected to be a \"block\""));
                    }
                    let sl = selector_list_from_ast(sel, compile)?;
                    // a Rule with an invalid selector list can't be inserted
                    if sl.invalid {
                        return Err(CpsError::value(format!("Trying to insert an invalid item: {} {{}}", sl)));
                    }
                    if result.is_some() {
                        return Err(CpsError::cps(format!(
                            "The argument string described more than a selectorlist is contained: {sl} {{}}")));
                    }
                    result = Some(sl);
                }
                _ => return Err(CpsError::value(format!(
                    "Trying to insert an invalid item: {}", gonzales::cssp_to_src(item)))),
            }
        }
        let sl = result.ok_or_else(|| CpsError::cps("No selector found."))?;
        if !sl.selects() {
            return Err(CpsError::cps(format!("SelectorList will not select anything: {}",
                sl.message.clone().unwrap_or_default())));
        }
        Ok(sl)
    }
}

impl fmt::Display for SelectorList {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let v: Vec<String> = self.selectors.iter().map(|s| s.to_string()).collect();
        f.write_str(&v.join(",\n"))
    }
}

// ----------------------------------------------------------- from the AST

/// `selectorFactories.selector`: the `simpleselector` children (gonzales'
/// "simpleselector" is a full complex selector).
pub fn selector_list_from_ast(sel: &Ast, compile: bool) -> Result<SelectorList> {
    let mut list = vec![];
    for item in sel.items() {
        if item.ty() == Some("simpleselector") {
            list.push(Rc::new(complex_from_ast(item, compile)?));
        }
    }
    Ok(SelectorList::new(list))
}

enum El<'a> {
    Generic(&'a Ast),
    Combinator(Combinator),
    Comment,
}

/// `selectorFactories.simpleselector`
fn complex_from_ast(node: &Ast, compile: bool) -> Result<ComplexSelector> {
    let elements: Vec<El> = node.items().iter().map(|a| match a.ty() {
        Some("combinator") => El::Combinator(Combinator::new(a.items().first().and_then(|s| s.as_str()).unwrap_or(""))),
        Some("comment") => El::Comment,
        _ => El::Generic(a),
    }).collect();
    enum V<'a> { C(Combinator), Els(Vec<&'a Ast>) }
    let mut value: Vec<V> = vec![];
    let mut open = false;
    for item in elements {
        let is_ws = matches!(item, El::Generic(a) if a.ty() == Some("s"));
        if is_ws && value.is_empty() { continue; }
        match item {
            El::Comment => continue,
            El::Combinator(c) => {
                open = false;
                value.push(V::C(c));
                continue;
            }
            El::Generic(a) => {
                if is_ws {
                    open = false;
                    continue;
                }
                if !open {
                    if !value.is_empty() && !matches!(value.last(), Some(V::C(_))) {
                        value.push(V::C(Combinator::new(" ")));
                    }
                    value.push(V::Els(vec![]));
                    open = true;
                }
                if let Some(V::Els(v)) = value.last_mut() { v.push(a); }
            }
        }
    }
    let mut parts = vec![];
    for v in value {
        match v {
            V::C(c) => parts.push(Part::Combinator(c)),
            V::Els(els) => {
                let simples: Vec<SimpleSelector> = els.into_iter().map(simple_from_ast).collect();
                let cs = CompoundSelector::new(simples)?;
                if compile { cs.check_compilable()?; }
                parts.push(Part::Compound(cs));
            }
        }
    }
    Ok(ComplexSelector::new(parts))
}

fn simple_from_ast(el: &Ast) -> SimpleSelector {
    let items = el.items();
    // _getSimpleSelectorName
    let name: Option<String> = match items.first() {
        Some(Ast::Str(s)) => Some(s.clone()),
        Some(n @ Ast::Node(t, sub)) => {
            if *t == "ident" {
                sub.first().and_then(|s| s.as_str()).map(String::from)
            } else if *t == "funktion" {
                match sub.first() {
                    Some(id) if id.ty() == Some("ident") => id.items().first().and_then(|s| s.as_str()).map(String::from),
                    _ => { let _ = n; None }
                }
            } else { None }
        }
        None => None,
    };
    let ty = match el.ty() {
        Some("ident") => Some(if name.as_deref() == Some("*") { SimpleType::Universal } else { SimpleType::Type }),
        Some("clazz") => Some(SimpleType::Class),
        Some("shash") => Some(SimpleType::Id),
        Some("pseudoc") => Some(SimpleType::PseudoClass),
        Some("pseudoe") => Some(SimpleType::PseudoElement),
        _ => None,
    };
    let mut value = None;
    if ty == Some(SimpleType::PseudoClass) && name.as_deref() == Some("i") {
        value = index_value(el);
    }
    SimpleSelector::new(ty, name, value)
}

/// `_getSimpleSelectorClassValueForIndex`
fn index_value(el: &Ast) -> Option<i64> {
    let f = el.items().first()?;
    if f.ty() != Some("funktion") { return None; }
    let body = f.items().get(1)?;
    if body.ty() != Some("functionBody") { return None; }
    let mut items: Vec<&Ast> = body.items().iter()
        .filter(|a| !matches!(a.ty(), Some("s") | Some("comment"))).collect();
    let mut sign = "+".to_string();
    if items.len() == 2 && items[0].ty() == Some("unary") {
        sign = items[0].items().first().and_then(|s| s.as_str()).unwrap_or("+").to_string();
        items.remove(0);
    }
    if items.len() == 1 && items[0].ty() == Some("number") {
        let n = items[0].items().first().and_then(|s| s.as_str()).unwrap_or("");
        return js_parse_int(&format!("{sign}{n}"));
    }
    None
}

/// `parseInt(s, 10)`: optional sign, leading digits, ignore the rest.
pub fn js_parse_int(s: &str) -> Option<i64> {
    let s = s.trim_start();
    let (neg, rest) = match s.as_bytes().first() {
        Some(b'-') => (true, &s[1..]),
        Some(b'+') => (false, &s[1..]),
        _ => (false, s),
    };
    let digits: String = rest.chars().take_while(|c| c.is_ascii_digit()).collect();
    if digits.is_empty() { return None; }
    let v: i64 = digits.parse().ok()?;
    Some(if neg { -v } else { v })
}
