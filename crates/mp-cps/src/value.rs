//! Values that CPS formulas compute with.

use crate::selector::SelectorList;
use mp_math::{js_num, Transform, Vector};
use std::fmt;
use std::rc::Rc;

/// A node of the object model (index into the model's arena).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct NodeId(pub u32);

#[derive(Clone, Debug)]
pub enum Value {
    Undefined,
    Null,
    Bool(bool),
    Number(f64),
    String(Rc<str>),
    Vector(Vector),
    Transform(Transform),
    Node(NodeId),
    Selector(Rc<SelectorList>),
    Array(Rc<Vec<Value>>),
}

impl Value {
    pub fn str(s: &str) -> Value { Value::String(Rc::from(s)) }
    /// JS `typeof v === 'number' && v === v`
    pub fn as_number(&self) -> Option<f64> {
        match self { Value::Number(n) if !n.is_nan() => Some(*n), _ => None }
    }
    pub fn as_str(&self) -> Option<&str> {
        match self { Value::String(s) => Some(s), _ => None }
    }
    pub fn as_node(&self) -> Option<NodeId> {
        match self { Value::Node(n) => Some(*n), _ => None }
    }
    pub fn as_vector(&self) -> Option<Vector> {
        match self { Value::Vector(v) => Some(*v), _ => None }
    }
    pub fn as_transform(&self) -> Option<Transform> {
        match self { Value::Transform(t) => Some(*t), _ => None }
    }
    pub fn type_name(&self) -> &'static str {
        match self {
            Value::Undefined => "undefined",
            Value::Null => "object",
            Value::Bool(_) => "boolean",
            Value::Number(_) => "number",
            Value::String(_) => "string",
            _ => "object",
        }
    }
}

impl fmt::Display for Value {
    /// roughly JS `String(value)`, used in error messages
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Value::Undefined => f.write_str("undefined"),
            Value::Null => f.write_str("null"),
            Value::Bool(b) => write!(f, "{b}"),
            Value::Number(n) => f.write_str(&js_num(*n)),
            Value::String(s) => f.write_str(s),
            Value::Vector(v) => write!(f, "{v}"),
            Value::Transform(t) => write!(f, "{t}"),
            Value::Node(n) => write!(f, "<node {}>", n.0),
            Value::Selector(s) => write!(f, "{s}"),
            Value::Array(a) => {
                let v: Vec<String> = a.iter().map(|x| x.to_string()).collect();
                f.write_str(&v.join(","))
            }
        }
    }
}
