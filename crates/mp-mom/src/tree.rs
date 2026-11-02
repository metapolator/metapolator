//! The MOM (Metapolator Object Model): port of Atem-CPS `OMA/_Node.js` and
//! Atem-MOM `MOM/*.js`, as an arena of nodes.
//!
//! Tree shape: multivers › univers › master › glyph › (penstroke › center ›
//! left/right | contour › p | component).

use crate::js::{js_string, Json, JsonMap};
use mp_cps::{CpsError, Model, NodeId, Property, PropertyDict, Result, Value};
use std::rc::Rc;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Kind {
    Multivers,
    Univers,
    Master,
    Glyph,
    PenStroke,
    Center,
    Left,
    Right,
    Contour,
    P,
    Component,
}

impl Kind {
    /// the CPS selector type
    pub fn type_name(self) -> &'static str {
        match self {
            Kind::Multivers => "multivers",
            Kind::Univers => "univers",
            Kind::Master => "master",
            Kind::Glyph => "glyph",
            Kind::PenStroke => "penstroke",
            Kind::Center => "center",
            Kind::Left => "left",
            Kind::Right => "right",
            Kind::Contour => "contour",
            Kind::P => "p",
            Kind::Component => "component",
        }
    }
    /// `MOMType` / constructor name, used in messages
    pub fn class_name(self) -> &'static str {
        match self {
            Kind::Multivers => "Multivers",
            Kind::Univers => "Univers",
            Kind::Master => "Master",
            Kind::Glyph => "Glyph",
            Kind::PenStroke => "PenStroke",
            Kind::Center => "PenStrokeCenter",
            Kind::Left => "PenStrokeLeft",
            Kind::Right => "PenStrokeRight",
            Kind::Contour => "Contour",
            Kind::P => "ContourPoint",
            Kind::Component => "Component",
        }
    }
    /// `_acceptedChildren`
    pub fn child_kind(self, type_name: &str) -> Option<Kind> {
        Some(match (self, type_name) {
            (Kind::Multivers, "univers") => Kind::Univers,
            (Kind::Univers, "master") => Kind::Master,
            (Kind::Master, "glyph") => Kind::Glyph,
            (Kind::Glyph, "component") => Kind::Component,
            (Kind::Glyph, "contour") => Kind::Contour,
            (Kind::Glyph, "penstroke") => Kind::PenStroke,
            (Kind::PenStroke, "center") => Kind::Center,
            (Kind::Contour, "p") => Kind::P,
            _ => return None,
        })
    }
    /// `Object.isFrozen(this._children)`: children made by the constructor
    pub fn frozen_children(self) -> Option<&'static [Kind]> {
        match self {
            Kind::Center => Some(&[Kind::Left, Kind::Right]),
            Kind::Left | Kind::Right | Kind::P | Kind::Component => Some(&[]),
            _ => None,
        }
    }
    /// `idManager`: masters, glyphs and the root register descendant ids
    pub fn is_id_manager(self) -> bool {
        matches!(self, Kind::Multivers | Kind::Master | Kind::Glyph)
    }
}

#[derive(Clone, Debug)]
pub struct Node {
    pub kind: Kind,
    pub id: Option<String>,
    pub classes: Vec<String>,
    pub properties: PropertyDict,
    pub attachment: Option<JsonMap>,
    pub base_node: Option<NodeId>,
    pub parent: Option<NodeId>,
    pub children: Vec<NodeId>,
    pub index: Option<usize>,
}

impl Node {
    fn new(kind: Kind) -> Node {
        Node {
            kind,
            id: None,
            classes: vec![],
            properties: PropertyDict::default(),
            attachment: None,
            base_node: None,
            parent: None,
            children: vec![],
            index: None,
        }
    }
}

pub struct Mom {
    nodes: Vec<Node>,
    root: NodeId,
}

fn mom_err(msg: impl Into<String>) -> CpsError { CpsError::cps(msg) }

impl Default for Mom {
    fn default() -> Self { Self::new() }
}

impl Mom {
    pub fn new() -> Mom {
        let mut m = Mom { nodes: vec![], root: NodeId(0) };
        m.root = m.create(Kind::Multivers);
        m
    }

    pub fn node(&self, n: NodeId) -> &Node { &self.nodes[n.0 as usize] }
    pub fn node_mut(&mut self, n: NodeId) -> &mut Node { &mut self.nodes[n.0 as usize] }
    pub fn kind(&self, n: NodeId) -> Kind { self.node(n).kind }

    /// a new, detached node (plus its constructor-made children)
    pub fn create(&mut self, kind: Kind) -> NodeId {
        let id = NodeId(self.nodes.len() as u32);
        self.nodes.push(Node::new(kind));
        if let Some(kids) = kind.frozen_children() {
            for k in kids {
                let c = self.create(*k);
                self.attach(id, c);
            }
        }
        id
    }

    fn attach(&mut self, parent: NodeId, child: NodeId) {
        let idx = self.node(parent).children.len();
        self.node_mut(parent).children.push(child);
        let c = self.node_mut(child);
        c.parent = Some(parent);
        c.index = Some(idx);
    }

    /// `parent.add(child)`
    pub fn add(&mut self, parent: NodeId, child: NodeId) -> Result<()> {
        if self.kind(parent).frozen_children().is_some() {
            return Err(mom_err("Adding or removing children is not allowed in this element."));
        }
        let ck = self.kind(child);
        if self.kind(parent).child_kind(ck.type_name()) != Some(ck) {
            return Err(mom_err(format!("{} doesn't accept {} as a child object.",
                self.describe(parent), self.describe(child))));
        }
        if let Some(old) = self.node(child).parent {
            self.remove(old, child)?;
        }
        self.attach(parent, child);
        Ok(())
    }

    /// `parent.remove(child)`
    pub fn remove(&mut self, parent: NodeId, child: NodeId) -> Result<()> {
        if self.kind(parent).frozen_children().is_some() {
            return Err(mom_err("Adding or removing children is not allowed in this element."));
        }
        let pos = self.node(parent).children.iter().position(|c| *c == child)
            .ok_or_else(|| mom_err("not a child"))?;
        self.node_mut(parent).children.remove(pos);
        let kids = self.node(parent).children.clone();
        for (i, k) in kids.iter().enumerate() { self.node_mut(*k).index = Some(i); }
        let c = self.node_mut(child);
        c.parent = None;
        c.index = None;
        Ok(())
    }

    /// move a child to a new index within its parent
    pub fn move_child(&mut self, parent: NodeId, from: usize, to: usize) {
        let c = self.node_mut(parent).children.remove(from);
        let to = to.min(self.node(parent).children.len());
        self.node_mut(parent).children.insert(to, c);
        let kids = self.node(parent).children.clone();
        for (i, k) in kids.iter().enumerate() { self.node_mut(*k).index = Some(i); }
    }

    pub fn root(&self) -> NodeId { self.root }

    pub fn describe(&self, n: NodeId) -> String {
        format!("<MOM {} {}>", self.kind(n).class_name(), n.0)
    }

    fn ancestor(&self, n: NodeId, kind: Kind) -> Option<NodeId> {
        let mut p = self.node(n).parent;
        while let Some(x) = p {
            if self.kind(x) == kind { return Some(x); }
            p = self.node(x).parent;
        }
        None
    }
    pub fn master_of(&self, n: NodeId) -> Option<NodeId> { self.ancestor(n, Kind::Master) }
    pub fn glyph_of(&self, n: NodeId) -> Option<NodeId> { self.ancestor(n, Kind::Glyph) }
    pub fn univers_of(&self, n: NodeId) -> Option<NodeId> { self.ancestor(n, Kind::Univers) }

    /// OMA `root` getter (`_Root` returns itself)
    pub fn root_of(&self, n: NodeId) -> Option<NodeId> {
        if self.kind(n) == Kind::Multivers { return Some(n); }
        let mut p = self.node(n).parent;
        while let Some(x) = p {
            if self.kind(x) == Kind::Multivers { return Some(x); }
            p = self.node(x).parent;
        }
        None
    }

    /// `getById` within the nearest id manager (self or ancestor)
    pub fn get_by_id(&self, scope: NodeId, id: &str) -> Option<NodeId> {
        let mut manager = scope;
        while !self.kind(manager).is_id_manager() {
            manager = self.node(manager).parent?;
        }
        // breadth first through descendants not under another id manager
        let mut queue: Vec<NodeId> = self.node(manager).children.clone();
        while !queue.is_empty() {
            let mut next = vec![];
            for n in queue {
                if self.node(n).id.as_deref() == Some(id) { return Some(n); }
                if !self.kind(n).is_id_manager() {
                    next.extend(self.node(n).children.iter().copied());
                }
            }
            queue = next;
        }
        None
    }

    /// `getAttachment(key, searchInBaseNodeChain)`
    pub fn attachment(&self, n: NodeId, key: &str, search_base: bool) -> Option<&Json> {
        let mut cur = Some(n);
        while let Some(c) = cur {
            if let Some(v) = self.node(c).attachment.as_ref().and_then(|a| a.get(key)) {
                return Some(v);
            }
            if !search_base { return None; }
            cur = self.node(c).base_node;
        }
        None
    }

    pub fn set_attachment(&mut self, n: NodeId, key: &str, value: Json) {
        self.node_mut(n).attachment.get_or_insert_with(JsonMap::new).insert(key.to_string(), value);
    }

    /// `getIndexPath(stopNode)`
    pub fn index_path(&self, n: NodeId, stop: Option<NodeId>) -> String {
        let mut path = None::<String>;
        if self.kind(n) == Kind::Multivers { path = Some("/".into()); }
        if Some(n) == stop { return ".".into(); }
        match self.node(n).parent {
            None => path.unwrap_or_else(|| self.node(n).index.map(|i| i.to_string()).unwrap_or_else(|| "null".into())),
            Some(p) => {
                let pp = self.index_path(p, stop);
                let idx = self.node(n).index.map(|i| i.to_string()).unwrap_or_default();
                if pp != "/" { format!("{pp}/{idx}") } else { format!("{pp}{idx}") }
            }
        }
    }

    /// `masterIndexPath`
    pub fn master_index_path(&self, n: NodeId) -> Option<String> {
        let master = if self.kind(n) == Kind::Master { Some(n) } else { self.master_of(n) }?;
        Some(self.index_path(n, Some(master)))
    }

    pub fn walk(&self, n: NodeId, f: &mut dyn FnMut(NodeId)) {
        f(n);
        for c in self.node(n).children.clone() { self.walk(c, f); }
    }

    // ------------------------------------------------------------ loading

    /// `_loadData`: id, classes, properties, attachment
    pub fn load_data(&mut self, n: NodeId, data: &Json) -> Result<()> {
        let Some(obj) = data.as_object() else { return Ok(()); };
        if let Some(id) = obj.get("id") {
            self.node_mut(n).id = match id { Json::Null => None, v => Some(js_string(v)) };
        }
        if let Some(Json::Array(classes)) = obj.get("classes") {
            let mut cs: Vec<String> = vec![];
            for c in classes {
                let s = js_string(c);
                if !cs.contains(&s) { cs.push(s); }
            }
            self.node_mut(n).classes = cs;
        }
        if let Some(props) = obj.get("properties") {
            let mut list = vec![];
            match props {
                Json::Array(items) => for item in items {
                    let pair = item.as_array().cloned().unwrap_or_default();
                    let name = pair.first().map(js_string).unwrap_or_default();
                    let value = pair.get(1).map(js_string).unwrap_or_default();
                    list.push(Property::make(&name, &value)?);
                },
                Json::Object(map) => for (k, v) in map {
                    list.push(Property::make(k, &js_string(v))?);
                },
                _ => {}
            }
            self.node_mut(n).properties = PropertyDict::from_properties(list);
        }
        if let Some(Json::Object(att)) = obj.get("attachment") {
            self.node_mut(n).attachment = Some(att.clone());
        }
        Ok(())
    }

    /// `loadTree(data)`
    pub fn load_tree(&mut self, n: NodeId, data: &Json) -> Result<()> {
        if data.is_null() {
            return Err(CpsError::type_error("Cannot read properties of null (reading 'children')"));
        }
        self.load_data(n, data)?;
        let Some(children) = data.get("children").and_then(|c| c.as_array()) else { return Ok(()); };
        let kind = self.kind(n);
        if kind.frozen_children().is_some() {
            let existing = self.node(n).children.clone();
            for (i, cd) in children.iter().enumerate() {
                let c = *existing.get(i).ok_or_else(|| mom_err(format!(
                    "Child is missing. The data suggests that a child should be at index {i}in {}", self.describe(n))))?;
                if !cd.is_null() { self.load_tree(c, cd)?; }
            }
            return Ok(());
        }
        // replace all children
        for c in self.node(n).children.clone() { self.remove(n, c)?; }
        for cd in children {
            let pair = cd.as_array().ok_or_else(|| mom_err("child data must be [type, data]"))?;
            let ty = pair.first().and_then(|t| t.as_str()).unwrap_or("");
            let ck = kind.child_kind(ty).ok_or_else(|| CpsError::key(format!(
                "No child constructor found for type \"{ty}\" in {}", self.describe(n))))?;
            let c = self.create(ck);
            if let Some(d) = pair.get(1) {
                if !d.is_null() { self.load_tree(c, d)?; }
            }
            self.attach(n, c);
        }
        Ok(())
    }

    /// `clone(cloneFlags)`: flags as in the JS (1 id, 2 classes,
    /// 4 properties, 8 attachments, 0x10 setBaseNode, 0x20 cloneBaseNode)
    pub fn clone_node(&mut self, src: NodeId, flags: u32) -> NodeId {
        let c = self.create(self.kind(src));
        self.finish_clone(src, c, flags);
        c
    }

    fn finish_clone(&mut self, src: NodeId, clone: NodeId, flags: u32) {
        let s = self.node(src).clone();
        {
            let c = self.node_mut(clone);
            if flags & 1 != 0 && s.id.is_some() { c.id = s.id.clone(); }
            if flags & 2 != 0 { c.classes = s.classes.clone(); }
            if flags & 4 != 0 { c.properties = s.properties.clone(); }
            if flags & 8 != 0 { c.attachment = s.attachment.clone(); }
            if flags & 0x10 != 0 { c.base_node = Some(src); }
            else if flags & 0x20 != 0 && s.base_node.is_some() { c.base_node = s.base_node; }
        }
        let frozen = s.kind.frozen_children().is_some();
        for (i, child) in s.children.iter().enumerate() {
            if !frozen {
                let cc = self.clone_node(*child, flags);
                self.attach(clone, cc);
            } else {
                let cc = self.node(clone).children[i];
                self.finish_clone(*child, cc, flags);
            }
        }
    }

    /// `master.loadDataFromDict(dict)`
    pub fn load_data_from_dict(&mut self, master: NodeId, dict: &JsonMap) -> Result<()> {
        let mut nodes = vec![];
        self.walk(master, &mut |n| nodes.push(n));
        for n in nodes {
            let path = self.master_index_path(n).unwrap_or_default();
            if let Some(d) = dict.get(&path) {
                if !d.is_null() { self.load_data(n, d)?; }
            }
        }
        Ok(())
    }

    // ------------------------------------------------------------ validation

    fn validator(kind: Kind, key: &str) -> Option<Validator> {
        use Validator::*;
        Some(match (kind, key) {
            (Kind::Glyph, "width" | "height") => Number,
            (Kind::Center, "on" | "in" | "out") => Vector,
            (Kind::Center, "inLength" | "outLength" | "inDir" | "outDir" | "inTension" | "outTension") => Number,
            (Kind::Left | Kind::Right, "on" | "in" | "out") => Vector,
            (Kind::Left | Kind::Right, "inLength" | "outLength" | "onLength" | "inDir" | "outDir" | "onDir"
                | "inDirIntrinsic" | "outDirIntrinsic" | "inTension" | "outTension") => Number,
            (Kind::P, "on" | "in" | "out") => Vector,
            (Kind::P, "inLength" | "outLength" | "inDir" | "outDir" | "inTension" | "outTension") => Number,
            (Kind::Center | Kind::Left | Kind::Right | Kind::P, "pointBefore" | "pointAfter") => SameType,
            (Kind::Contour, "open") => Number,
            (Kind::Component, "transformation") => Transform,
            (Kind::Component, "baseGlyphName") => String,
            _ => return None,
        })
    }
}

enum Validator { Number, Vector, Transform, String, SameType }

impl Model for Mom {
    fn root(&self) -> NodeId { self.root }
    fn parent(&self, n: NodeId) -> Option<NodeId> { self.node(n).parent }
    fn children(&self, n: NodeId) -> &[NodeId] { &self.node(n).children }
    fn index(&self, n: NodeId) -> Option<usize> { self.node(n).index }
    fn node_type(&self, n: NodeId) -> &'static str { self.kind(n).type_name() }
    fn id(&self, n: NodeId) -> Option<&str> { self.node(n).id.as_deref() }
    fn has_class(&self, n: NodeId, class: &str) -> bool { self.node(n).classes.iter().any(|c| c == class) }
    fn properties(&self, n: NodeId) -> &PropertyDict { &self.node(n).properties }

    fn cps_get(&self, n: NodeId, key: &str) -> Result<Value> {
        let node = self.node(n);
        let opt = |x: Option<NodeId>| x.map(Value::Node).unwrap_or(Value::Null);
        let center = node.kind == Kind::Center;
        Ok(match key {
            "parent" => opt(node.parent),
            "children" => Value::Array(Rc::new(node.children.iter().map(|c| Value::Node(*c)).collect())),
            "root" | "multivers" => opt(self.root_of(n)),
            "index" => node.index.map(|i| Value::Number(i as f64)).unwrap_or(Value::Null),
            "id" => node.id.as_deref().map(Value::str).unwrap_or(Value::Null),
            "type" => Value::str(node.kind.type_name()),
            "baseNode" => match node.base_node {
                Some(b) => Value::Node(b),
                None => return Err(CpsError::key(format!("{} has no baseNode.", self.describe(n)))),
            },
            "glyph" => opt(self.glyph_of(n)),
            "master" => opt(self.master_of(n)),
            "univers" => opt(self.univers_of(n)),
            "left" if center => Value::Node(node.children[0]),
            "right" if center => Value::Node(node.children[1]),
            "center" if center => return Err(CpsError::new(mp_cps::ErrorKind::Cps, format!(
                "What used to be the \"center\" property of this element is now equivalent with the element itself: {}",
                self.describe(n)))),
            _ => return Err(CpsError::key(format!("Name \"{key}\" is not whitelisted for item \"{}\"", self.describe(n)))),
        })
    }

    fn check_property_value(&self, n: NodeId, key: &str, value: Value) -> Result<Value> {
        let kind = self.kind(n);
        let bad = |what: &str| CpsError::value(format!(
            "The value of \"{key}\" must be {what}, got: \"{value}\" in {}", self.describe(n)));
        if let Some(v) = Self::validator(kind, key) {
            let ok = match v {
                Validator::Number => value.as_number().is_some(),
                Validator::Vector => matches!(value, Value::Vector(_)),
                Validator::Transform => matches!(value, Value::Transform(_)),
                Validator::String => matches!(value, Value::String(_)),
                Validator::SameType => matches!(value, Value::Node(o) if self.kind(o) == kind),
            };
            if !ok {
                return Err(bad(match v {
                    Validator::Number => "a number",
                    Validator::Vector => "a Vector",
                    Validator::Transform => "a Transformation",
                    Validator::String => "a string",
                    Validator::SameType => kind.class_name(),
                }));
            }
        }
        if matches!(value, Value::Undefined) {
            return Err(CpsError::value(format!(
                "The formula of \"{key}\" in a {} returned `undefined` which is never valid", self.describe(n))));
        }
        Ok(value)
    }

    fn cps_file(&self, n: NodeId) -> Option<String> {
        if let Some(Json::String(s)) = self.attachment(n, "cpsFile", false) {
            if !s.is_empty() { return Some(s.clone()); }
        }
        let kind = self.kind(n);
        let host = match kind {
            Kind::Multivers => Some(n),
            Kind::Univers => self.root_of(n),
            Kind::Master => Some(n),
            _ => self.master_of(n),
        }?;
        match self.attachment(host, "cpsFile", false) {
            Some(Json::String(s)) if !s.is_empty() => Some(s.clone()),
            _ => None,
        }
    }

    fn particulars(&self, n: NodeId) -> String {
        let node = self.node(n);
        let own = format!("{}{}{}", node.kind.type_name(),
            node.id.as_ref().map(|i| format!("#{i}")).unwrap_or_default(),
            node.parent.map(|_| format!(":i({})", node.index.unwrap_or(0))).unwrap_or_default());
        if node.kind == Kind::Master {
            return format!("{} {own}", if node.parent.is_some() { "" } else { "(no parent)" });
        }
        match node.parent {
            Some(p) => format!("{} {own}", self.particulars(p)),
            None => format!("(no parent) {own}"),
        }
    }
}
