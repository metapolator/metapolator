//! CPS documents: port of Atem-CPS `CPS/elements/{PropertyCollection,
//! AtNamespaceCollection,AtImportCollection,Rule,PropertyDict,Property,
//! PropertyValue,Comment}.js` and of the factory layer in `CPS/parsing/`
//! (`engine.js`, `baseFactories.js`, `selectorFactories.js`,
//! `propertyFactories.js`, `atImportFactories.js`, `atDictionaryFactories.js`)
//! that turns the gonzales AST into these elements.

use crate::error::{CpsError, ErrorKind, Result};
use crate::gonzales::{self, cssp_to_src, Ast};
use crate::lang::{self, CompileError, Expr};
use crate::selector::{selector_list_from_ast, SelectorList};
use std::collections::HashMap;
use std::fmt;
use std::rc::Rc;

#[derive(Clone, Debug)]
pub struct PropertyValue {
    /// `valueString`: the concatenated value tokens, comments removed
    pub value_string: String,
    pub comments: Vec<String>,
    /// the compiled formula or the PropertyLanguageError message
    pub expr: std::result::Result<Rc<Expr>, String>,
}

impl PropertyValue {
    /// `PropertyValue.initialize(name, Expression.factory)`
    pub fn new(value_string: String, comments: Vec<String>) -> std::result::Result<Self, CpsError> {
        let expr = match lang::compile(&value_string) {
            Ok(e) => Ok(Rc::new(e)),
            Err(CompileError::Invalid(m)) => Err(m),
            Err(CompileError::Fatal(e)) => return Err(e),
        };
        Ok(PropertyValue { value_string, comments, expr })
    }
    pub fn invalid(&self) -> bool { self.expr.is_err() }
}

#[derive(Clone, Debug)]
pub struct Property {
    pub name: String,
    pub value: PropertyValue,
}

impl Property {
    /// `cpsTools.makeProperty(name, value)`: `value` is the string form
    /// (`[value].join('')` in JS).
    pub fn make(name: &str, value: &str) -> Result<Property> {
        Ok(Property { name: name.to_string(), value: PropertyValue::new(value.to_string(), vec![])? })
    }
    pub fn invalid(&self) -> bool { self.value.invalid() }
}

impl fmt::Display for Property {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let comments = self.value.comments.iter().map(|c| format!("/*{c}*/")).collect::<Vec<_>>().join("\n");
        write!(f, "{}: {}{}{};", self.name, comments, if comments.is_empty() { "" } else { " " },
               self.value.value_string.trim())
    }
}

#[derive(Clone, Debug)]
pub enum DictItem {
    Property(Rc<Property>),
    Comment(String),
    /// other AST nodes kept inside a block (JS GenericCPSNode)
    Generic(String),
}

/// `PropertyDict`: the declarations of a rule (or of an element). For each
/// name the *last valid* property wins.
#[derive(Clone, Debug, Default)]
pub struct PropertyDict {
    items: Vec<DictItem>,
    index: HashMap<String, usize>,
    keys: Vec<String>,
}

impl PropertyDict {
    pub fn new(items: Vec<DictItem>) -> Self {
        let mut d = PropertyDict { items, index: HashMap::new(), keys: vec![] };
        d.rebuild();
        d
    }
    pub fn from_properties(props: Vec<Property>) -> Self {
        Self::new(props.into_iter().map(|p| DictItem::Property(Rc::new(p))).collect())
    }
    fn rebuild(&mut self) {
        self.index.clear();
        self.keys.clear();
        for (i, item) in self.items.iter().enumerate().rev() {
            if let DictItem::Property(p) = item {
                if p.invalid() { continue; }
                if !self.index.contains_key(&p.name) {
                    self.index.insert(p.name.clone(), i);
                    self.keys.push(p.name.clone());
                }
            }
        }
    }
    pub fn get(&self, key: &str) -> Option<&Rc<Property>> {
        self.index.get(key).and_then(|i| match &self.items[*i] { DictItem::Property(p) => Some(p), _ => None })
    }
    pub fn has(&self, key: &str) -> bool { self.index.contains_key(key) }
    /// keys of the active properties (JS order: last-defined first)
    pub fn keys(&self) -> &[String] { &self.keys }
    pub fn items(&self) -> &[DictItem] { &self.items }
    pub fn len(&self) -> usize { self.items.len() }
    pub fn is_empty(&self) -> bool { self.items.is_empty() }

    /// replace all items (`splice(0, length, items)`)
    pub fn set_items(&mut self, items: Vec<DictItem>) {
        self.items = items;
        self.rebuild();
    }
    /// `setProperty`: replace the active property of that name or append
    pub fn set_property(&mut self, prop: Property) {
        let prop = Rc::new(prop);
        match self.index.get(&prop.name) {
            Some(i) => self.items[*i] = DictItem::Property(prop),
            None => self.items.push(DictItem::Property(prop)),
        }
        self.rebuild();
    }
    /// `erase(key)`: remove every item with that name
    pub fn erase(&mut self, key: &str) {
        self.items.retain(|i| !matches!(i, DictItem::Property(p) if p.name == key));
        self.rebuild();
    }
}

impl fmt::Display for PropertyDict {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        writeln!(f, "{{")?;
        for item in &self.items {
            match item {
                DictItem::Property(p) => writeln!(f, "    {p}")?,
                DictItem::Comment(c) => writeln!(f, "    /*{c}*/")?,
                DictItem::Generic(g) => writeln!(f, "    {g};")?,
            }
        }
        write!(f, "}}")
    }
}

#[derive(Clone, Debug)]
pub struct Rule {
    pub selectors: Rc<SelectorList>,
    pub properties: Rc<PropertyDict>,
}

#[derive(Clone, Debug)]
pub struct Namespace {
    pub selectors: Rc<SelectorList>,
    pub items: Vec<CollectionItem>,
}

#[derive(Clone, Debug)]
pub enum CollectionItem {
    Rule(Rc<Rule>),
    Namespace(Rc<Namespace>),
    Import { resource: String, collection: Rc<Collection> },
    Comment(String),
}

/// A parsed CPS file (`PropertyCollection`).
#[derive(Clone, Debug, Default)]
pub struct Collection {
    pub items: Vec<CollectionItem>,
}

fn fmt_items(f: &mut fmt::Formatter<'_>, items: &[CollectionItem], sep: &str) -> fmt::Result {
    for (i, item) in items.iter().enumerate() {
        if i > 0 { f.write_str(sep)?; }
        match item {
            CollectionItem::Rule(r) => write!(f, "{} {}", r.selectors, r.properties)?,
            CollectionItem::Namespace(n) => {
                write!(f, "@namespace({}) {{\n", n.selectors)?;
                fmt_items(f, &n.items, "\n\n")?;
                f.write_str("\n}")?;
            }
            CollectionItem::Import { resource, .. } => write!(f, "@import \"{resource}\";")?,
            CollectionItem::Comment(c) => write!(f, "/*{c}*/")?,
        }
    }
    Ok(())
}

impl fmt::Display for Collection {
    /// serialization used when saving a changed CPS file
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt_items(f, &self.items, "\n\n")
    }
}

// ----------------------------------------------------------------- factories

/// Resolves `@import` resources while parsing (`ruleController.getRule`).
pub trait ImportResolver {
    fn get_rule(&mut self, resource: &str) -> Result<Rc<Collection>>;
}

/// A resolver that refuses every import.
pub struct NoImports;
impl ImportResolver for NoImports {
    fn get_rule(&mut self, resource: &str) -> Result<Rc<Collection>> {
        Err(CpsError::key(format!("no import resolver for \"{resource}\"")))
    }
}

#[derive(Clone, Copy, PartialEq)]
enum Factories { Property, AtImport, AtDictionary }

/// What a factory produced for an AST node.
enum Inst {
    Collection(Collection),
    Namespace(Option<Rc<SelectorList>>, Vec<CollectionItem>),
    Import(String, Rc<Collection>),
    Rule(Rule),
    Dict(PropertyDict),
    Property(Property),
    Name(String),
    AtRuleName(String),
    Value(PropertyValue),
    SelectorList(SelectorList),
    Comment(String),
    Generic(Ast),
    /// `ruleset` and `combinator` etc. that only exist inside selectors are
    /// handled by `selector_list_from_ast`; never stored separately
    Selector(Ast),
}

fn generic_type(a: &Ast) -> Option<&'static str> { a.ty() }

struct Ctx<'r> {
    resolver: &'r mut dyn ImportResolver,
}

fn invalid_item(desc: String) -> CpsError {
    CpsError::new(ErrorKind::Value, format!("Trying to insert an invalid item: {desc}"))
}

/// Does `set` have a constructor for AST type `ty`?
fn has_constructor(set: Factories, ty: &str) -> bool {
    let base = matches!(ty, "stylesheet" | "comment");
    let selector = matches!(ty, "ruleset" | "block" | "selector" | "simpleselector" | "combinator");
    let property = matches!(ty, "declaration" | "property" | "value" | "atruler" | "atkeyword" | "atrulerq" | "atrulers");
    match set {
        Factories::Property => base || selector || property,
        Factories::AtImport => base || selector || property || ty == "atrules",
        Factories::AtDictionary => base || selector || property,
    }
}

fn switch_for(ast: &Ast) -> Option<Factories> {
    let ty = ast.ty()?;
    let first = ast.items().first();
    let kw = first.filter(|a| a.ty() == Some("atkeyword"))
        .and_then(|a| a.items().first())
        .filter(|a| a.ty() == Some("ident"))
        .and_then(|a| a.items().first())
        .and_then(|a| a.as_str());
    match (ty, kw) {
        ("atruler", Some("dictionary")) => Some(Factories::AtDictionary),
        ("atrules", Some("import")) => Some(Factories::AtImport),
        _ => None,
    }
}

/// Builds the instance tree bottom up, exactly mirroring which AST nodes get
/// an instance in `parsing/engine.js` (a node gets one only if all its
/// ancestors have constructors).
fn build(ctx: &mut Ctx, ast: &Ast, set: Factories) -> Result<Inst> {
    let ty = ast.ty().unwrap_or("");
    if !has_constructor(set, ty) {
        return Ok(Inst::Generic(ast.clone()));
    }
    // children (only array items become child nodes)
    let mut children: Vec<(Option<&'static str>, Inst)> = vec![];
    for child in ast.items() {
        if let Ast::Node(cty, _) = child {
            let cset = switch_for(child).unwrap_or(set);
            let inst = build(ctx, child, cset)?;
            let key = if has_constructor(cset, cty) { Some(*cty) } else { None };
            children.push((key, inst));
        }
    }
    // `node.data`: the last string item
    let data: Option<String> = ast.items().iter().rev().find_map(|a| a.as_str().map(String::from));
    construct(ctx, ast, set, ty, children, data)
}

fn generic_name(children: &[(Option<&'static str>, Inst)], what: &str) -> Result<String> {
    match children.first() {
        Some((None, Inst::Generic(a))) if a.ty() == Some("ident") => {
            Ok(a.items().first().and_then(|s| s.as_str()).unwrap_or("").to_string())
        }
        _ => Err(CpsError::cps(format!("The first child of \"{what}\" is expected to be an __GenericAST__ of type \"ident\""))),
    }
}

fn item_desc(inst: &Inst) -> String {
    match inst {
        Inst::Generic(a) => cssp_to_src(a),
        Inst::Property(p) => p.to_string(),
        Inst::Namespace(..) => "@namespace".into(),
        _ => "item".into(),
    }
}

/// PropertyCollection `_checkItem` + splice: only valid rules, valid
/// collections and comments may be inserted.
fn collection_items(items: Vec<Inst>) -> Result<Vec<CollectionItem>> {
    let mut out = vec![];
    for inst in items {
        match inst {
            Inst::Rule(r) => {
                if r.selectors.invalid { return Err(invalid_item(format!("{} {}", r.selectors, r.properties))); }
                out.push(CollectionItem::Rule(Rc::new(r)));
            }
            Inst::Namespace(sl, items) => match sl {
                Some(sl) if !sl.invalid => out.push(CollectionItem::Namespace(Rc::new(Namespace { selectors: sl, items }))),
                _ => return Err(invalid_item("@namespace() { ... }".into())),
            },
            Inst::Import(resource, collection) => out.push(CollectionItem::Import { resource, collection }),
            Inst::Comment(c) => out.push(CollectionItem::Comment(c)),
            Inst::Collection(c) => {
                // an unnamed collection reached a place where it is not
                // flattened: a PropertyCollection is a valid item
                out.extend(c.items);
            }
            other => return Err(invalid_item(item_desc(&other))),
        }
    }
    Ok(out)
}

fn is_ws(key: &Option<&'static str>, inst: &Inst) -> bool {
    key.is_none() && matches!(inst, Inst::Generic(a) if generic_type(a) == Some("s"))
}

fn construct(ctx: &mut Ctx, ast: &Ast, set: Factories, ty: &str,
             children: Vec<(Option<&'static str>, Inst)>, data: Option<String>) -> Result<Inst> {
    match (set, ty) {
        (_, "stylesheet") => {
            let mut items = vec![];
            for (key, inst) in children {
                if is_ws(&key, &inst) { continue; }
                match inst {
                    // unnamed PropertyCollections are flattened
                    Inst::Collection(c) => items.extend(c.items.into_iter().map(collection_item_inst)),
                    Inst::Dict(_) => return Err(invalid_item("@dictionary".into())),
                    other => items.push(other),
                }
            }
            Ok(Inst::Collection(Collection { items: collection_items(items)? }))
        }
        (_, "comment") => Ok(Inst::Comment(data.unwrap_or_default())),
        (_, "ruleset") => {
            let mut it = children.into_iter();
            let sel = it.next();
            let block = it.next();
            let sl = match sel {
                Some((Some("selector"), Inst::Selector(a))) => selector_list_from_ast(&a, true)?,
                _ => return Err(CpsError::cps("The first child of \"ruleset\" is expected to be a \"selector\"")),
            };
            let dict = match block {
                Some((Some("block"), Inst::Dict(d))) => d,
                _ => return Err(CpsError::cps("The second child of \"ruleset\" is expected to be a \"block\"")),
            };
            Ok(Inst::Rule(Rule { selectors: Rc::new(sl), properties: Rc::new(dict) }))
        }
        (_, "selector") => Ok(Inst::Selector(ast.clone())),
        // selector internals are rebuilt from the AST by selector_list_from_ast
        (_, "simpleselector") | (_, "combinator") => Ok(Inst::Selector(ast.clone())),
        (_, "block") => {
            let mut items = vec![];
            for (key, inst) in children {
                match (key, inst) {
                    (Some("comment"), Inst::Comment(c)) => items.push(DictItem::Comment(c)),
                    (Some("declaration"), Inst::Property(p)) => items.push(DictItem::Property(Rc::new(p))),
                    (None, Inst::Generic(a)) if !matches!(a.ty(), Some("decldelim") | Some("s")) => {
                        items.push(DictItem::Generic(cssp_to_src(&a)))
                    }
                    _ => {}
                }
            }
            Ok(Inst::Dict(PropertyDict::new(items)))
        }
        (_, "declaration") => {
            let mut it = children.into_iter();
            let name = match it.next() {
                Some((Some("property"), Inst::Name(n))) => n,
                _ => return Err(CpsError::cps("The first child of \"declaration\" is expected to be a \"property\"")),
            };
            let value = match it.next() {
                Some((Some("value"), Inst::Value(v))) => v,
                _ => return Err(CpsError::cps("The second child of \"declaration\" is expected to be a \"value\"")),
            };
            Ok(Inst::Property(Property { name, value }))
        }
        (_, "property") => Ok(Inst::Name(generic_name(&children, "property")?)),
        (_, "atkeyword") => Ok(Inst::AtRuleName(generic_name(&children, "atkeyword")?)),
        (_, "value") => {
            let mut comments = vec![];
            let mut value = String::new();
            for (_, inst) in children {
                match inst {
                    Inst::Comment(c) => comments.push(c),
                    Inst::Generic(a) => value += &cssp_to_src(&a),
                    // AtRuleName.toString() is just the name (no '@')
                    Inst::AtRuleName(n) => value += &n,
                    Inst::Dict(d) => value += &d.to_string(),
                    _ => {}
                }
            }
            Ok(Inst::Value(PropertyValue::new(value, comments)?))
        }
        (Factories::AtDictionary, "atruler") => {
            // @dictionary yields an unnamed collection of properties, which can
            // never be inserted into a PropertyCollection
            Ok(Inst::Dict(PropertyDict::default()))
        }
        (_, "atruler") => {
            let mut name = None;
            let mut collection = None;
            let mut selector_list = None;
            for (_, inst) in children {
                if name.is_some() && collection.is_some() && selector_list.is_some() { break; }
                match inst {
                    Inst::Namespace(_, items) if collection.is_none() => collection = Some(items),
                    Inst::AtRuleName(n) if name.is_none() => name = Some(n),
                    Inst::SelectorList(sl) if selector_list.is_none() => selector_list = Some(sl),
                    _ => {}
                }
            }
            match (name.as_deref(), collection) {
                (Some("namespace"), Some(items)) => Ok(Inst::Namespace(selector_list.map(Rc::new), items)),
                _ => Ok(Inst::Generic(ast.clone())),
            }
        }
        (_, "atrulerq") => {
            let braces = ast.items().iter().find(|a| a.ty() == Some("braces"));
            let Some(braces) = braces else { return Ok(Inst::Generic(ast.clone())); };
            let src = cssp_to_src(braces);
            let chars: Vec<char> = src.chars().collect();
            let inner: String = if chars.len() >= 2 { chars[1..chars.len() - 1].iter().collect() } else { String::new() };
            let inner = inner.replace(['\'', '"'], "");
            let sel: Vec<&str> = inner.split(',').map(|s| s.trim()).filter(|s| !s.is_empty()).collect();
            match SelectorList::parse(&sel.join(", "), true) {
                Ok(sl) => Ok(Inst::SelectorList(sl)),
                // only CPSErrors are caught; e.g. the "invalid item" ValueError escapes
                Err(e) if e.kind == ErrorKind::Cps => Ok(Inst::Generic(ast.clone())),
                Err(e) => Err(e),
            }
        }
        (_, "atrulers") => {
            let mut items = vec![];
            for (key, inst) in children {
                if is_ws(&key, &inst) { continue; }
                match inst {
                    Inst::Collection(c) => items.extend(c.items.into_iter().map(collection_item_inst)),
                    other => items.push(other),
                }
            }
            Ok(Inst::Namespace(None, collection_items(items)?))
        }
        (Factories::AtImport, "atrules") => {
            // args: children after the atkeyword, without whitespace
            let args: Vec<&(Option<&'static str>, Inst)> = children.iter().skip(1)
                .filter(|(k, i)| !is_ws(k, i)).collect();
            if args.len() == 1 {
                if let (None, Inst::Generic(a)) = args[0] {
                    if a.ty() == Some("string") {
                        let raw = a.items().first().and_then(|s| s.as_str()).unwrap_or("");
                        let chars: Vec<char> = raw.chars().collect();
                        let resource: String = if chars.len() >= 2 { chars[1..chars.len() - 1].iter().collect() } else { String::new() };
                        let collection = ctx.resolver.get_rule(&resource)?;
                        return Ok(Inst::Import(resource, collection));
                    }
                }
            }
            Ok(Inst::Generic(ast.clone()))
        }
        _ => Ok(Inst::Generic(ast.clone())),
    }
}

fn collection_item_inst(item: CollectionItem) -> Inst {
    match item {
        CollectionItem::Rule(r) => Inst::Rule((*r).clone()),
        CollectionItem::Namespace(n) => Inst::Namespace(Some(n.selectors.clone()), n.items.clone()),
        CollectionItem::Import { resource, collection } => Inst::Import(resource, collection),
        CollectionItem::Comment(c) => Inst::Comment(c),
    }
}

/// `parseRules.fromString(cps, sourceName, ruleController)`
pub fn parse_cps(source: &str, resolver: &mut dyn ImportResolver) -> Result<Collection> {
    let ast = gonzales::parse_stylesheet(source)
        .map_err(|e| CpsError::new(ErrorKind::Cps, e.message))?
        .unwrap_or(Ast::Node("stylesheet", vec![]));
    let mut ctx = Ctx { resolver };
    match build(&mut ctx, &ast, Factories::Property)? {
        Inst::Collection(c) => Ok(c),
        _ => Err(CpsError::cps("Parser was expected to create an instance of PropertyCollection")),
    }
}
