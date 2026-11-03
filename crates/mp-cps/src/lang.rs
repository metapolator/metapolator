//! The Property Language: port of Atem-Property-Language (`parsing/Parser.js`,
//! `parsing/Stack.js`, the token classes and `flavours/MOM/parser.js`).
//!
//! A formula string is tokenized, converted from infix to postfix by the same
//! multi-pass precedence grouping the JS uses, checked (`Stack._check`) and
//! stored as a flat postfix program ([`Expr`]). Execution lives in
//! `engine.rs`, because operators need the cascade.

use crate::error::{CpsError, ErrorKind, Result};
use crate::selector::SelectorList;
use std::fmt;
use std::rc::Rc;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Op {
    List, Get, Colon, Negate, Add, Sub, Mul, Div, Pow, Min, Max, Vector, Polar,
    Tension2ControlOut, Tension2ControlIn, Tension2MagnitudeIn, Tension2MagnitudeOut,
    Magnitude2TensionOut, Magnitude2TensionIn, Deg, NormalizeAngle, Print,
    Scaling, Translation, Skew, Rotation, Transformation, Identity, Selector,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Consume { N(usize), Inf }

pub struct OpDef {
    pub op: Op,
    pub literal: &'static str,
    pub splitting: bool,
    pub precedence: f64,
    pub pre: Consume,
    pub post: Consume,
}

const INF: f64 = f64::INFINITY;

/// The operator table of `flavours/MOM/parser.js`, in definition order.
pub static OPERATORS: &[OpDef] = &[
    OpDef { op: Op::List, literal: "List", splitting: false, precedence: -INF, pre: Consume::N(0), post: Consume::Inf },
    OpDef { op: Op::Get, literal: "__get__", splitting: false, precedence: INF, pre: Consume::N(1), post: Consume::N(1) },
    OpDef { op: Op::Colon, literal: ":", splitting: true, precedence: INF, pre: Consume::N(1), post: Consume::N(1) },
    OpDef { op: Op::Negate, literal: "negate", splitting: false, precedence: 60.0, pre: Consume::N(0), post: Consume::N(1) },
    OpDef { op: Op::Add, literal: "+", splitting: true, precedence: 10.0, pre: Consume::N(1), post: Consume::N(1) },
    OpDef { op: Op::Sub, literal: "-", splitting: true, precedence: 10.0, pre: Consume::N(1), post: Consume::N(1) },
    OpDef { op: Op::Mul, literal: "*", splitting: true, precedence: 20.0, pre: Consume::N(1), post: Consume::N(1) },
    OpDef { op: Op::Div, literal: "/", splitting: true, precedence: 20.0, pre: Consume::N(1), post: Consume::N(1) },
    OpDef { op: Op::Pow, literal: "^", splitting: true, precedence: 30.0, pre: Consume::N(1), post: Consume::N(1) },
    OpDef { op: Op::Min, literal: "min", splitting: true, precedence: 40.0, pre: Consume::N(0), post: Consume::N(2) },
    OpDef { op: Op::Max, literal: "max", splitting: true, precedence: 40.0, pre: Consume::N(0), post: Consume::N(2) },
    OpDef { op: Op::Vector, literal: "Vector", splitting: false, precedence: 40.0, pre: Consume::N(0), post: Consume::N(2) },
    OpDef { op: Op::Polar, literal: "Polar", splitting: false, precedence: 40.0, pre: Consume::N(0), post: Consume::N(2) },
    OpDef { op: Op::Tension2ControlOut, literal: "tension2controlOut", splitting: false, precedence: 40.0, pre: Consume::N(0), post: Consume::N(5) },
    OpDef { op: Op::Tension2ControlIn, literal: "tension2controlIn", splitting: false, precedence: 40.0, pre: Consume::N(0), post: Consume::N(5) },
    OpDef { op: Op::Tension2MagnitudeIn, literal: "tension2magnitudeIn", splitting: false, precedence: 40.0, pre: Consume::N(0), post: Consume::N(5) },
    OpDef { op: Op::Tension2MagnitudeOut, literal: "tension2magnitudeOut", splitting: false, precedence: 40.0, pre: Consume::N(0), post: Consume::N(5) },
    OpDef { op: Op::Magnitude2TensionOut, literal: "magnitude2tensionOut", splitting: false, precedence: 40.0, pre: Consume::N(0), post: Consume::N(5) },
    OpDef { op: Op::Magnitude2TensionIn, literal: "magnitude2tensionIn", splitting: false, precedence: 40.0, pre: Consume::N(0), post: Consume::N(5) },
    OpDef { op: Op::Deg, literal: "deg", splitting: false, precedence: 50.0, pre: Consume::N(0), post: Consume::N(1) },
    OpDef { op: Op::NormalizeAngle, literal: "normalizeAngle", splitting: false, precedence: 50.0, pre: Consume::N(0), post: Consume::N(1) },
    OpDef { op: Op::Print, literal: "_print", splitting: false, precedence: INF, pre: Consume::N(0), post: Consume::N(1) },
    OpDef { op: Op::Scaling, literal: "Scaling", splitting: false, precedence: 0.0, pre: Consume::N(0), post: Consume::N(2) },
    OpDef { op: Op::Translation, literal: "Translation", splitting: false, precedence: 0.0, pre: Consume::N(0), post: Consume::N(2) },
    OpDef { op: Op::Skew, literal: "Skew", splitting: false, precedence: 0.0, pre: Consume::N(0), post: Consume::N(2) },
    OpDef { op: Op::Rotation, literal: "Rotation", splitting: false, precedence: 0.0, pre: Consume::N(0), post: Consume::N(1) },
    OpDef { op: Op::Transformation, literal: "Transformation", splitting: false, precedence: 0.0, pre: Consume::N(0), post: Consume::N(6) },
    OpDef { op: Op::Identity, literal: "Identity", splitting: false, precedence: 0.0, pre: Consume::N(0), post: Consume::N(0) },
    OpDef { op: Op::Selector, literal: "Selector", splitting: false, precedence: 0.0, pre: Consume::N(0), post: Consume::N(1) },
];

fn def(op: Op) -> &'static OpDef {
    OPERATORS.iter().find(|d| d.op == op).unwrap()
}

fn by_literal(lit: &str) -> Option<&'static OpDef> {
    OPERATORS.iter().find(|d| d.literal == lit)
}

/// An item of a compiled postfix program.
#[derive(Clone, Debug)]
pub enum Item {
    Name(Rc<str>),
    Number(f64),
    Str(Rc<str>),
    Selector(Rc<SelectorList>),
    Op { op: Op, consumes: usize },
}

impl Item {
    fn consumes(&self) -> usize {
        match self { Item::Op { consumes, .. } => *consumes, _ => 0 }
    }
}

impl fmt::Display for Item {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Item::Name(n) => write!(f, "<NameToken: {n}>"),
            Item::Number(n) => write!(f, "{}", mp_math::js_num(*n)),
            Item::Str(s) => write!(f, "{s}"),
            Item::Selector(s) => write!(f, "{s}"),
            Item::Op { op, .. } => write!(f, "<OperatorToken: {}>", def(*op).literal),
        }
    }
}

/// A compiled formula.
#[derive(Clone, Debug)]
pub struct Expr {
    pub items: Vec<Item>,
}

/// Why a formula could not be compiled.
#[derive(Clone, Debug, PartialEq)]
pub enum CompileError {
    /// a PropertyLanguageError: the property becomes `invalid`
    Invalid(String),
    /// anything else (e.g. a broken `S"..."` selector): the JS rethrows it
    /// and the whole stylesheet fails to parse
    Fatal(CpsError),
}

// ------------------------------------------------------------------ tokens

#[derive(Clone, Debug)]
enum Tok {
    Name(Rc<str>),
    Number(f64),
    Str(Rc<str>),
    Selector(Rc<SelectorList>),
    Bracket(char),
    /// operator with (possibly fixed) consumption
    Op(Op, Consume, Consume),
    Group(Vec<Tok>),
}

fn pl(msg: impl Into<String>) -> CompileError { CompileError::Invalid(msg.into()) }

/// `R_number = /^(\-?((\d*\.\d+)|(\d+(\.)?))([eE][+\-]?\d+)?)/`
fn match_number(s: &[char]) -> Option<usize> {
    let mut i = 0;
    if s.first() == Some(&'-') { i += 1; }
    let digits = |from: usize| -> usize { s[from..].iter().take_while(|c| c.is_ascii_digit()).count() };
    // alternative 1: \d*\.\d+
    let d1 = digits(i);
    let mut end = None;
    if s.get(i + d1) == Some(&'.') {
        let d2 = digits(i + d1 + 1);
        if d2 > 0 { end = Some(i + d1 + 1 + d2); }
    }
    if end.is_none() {
        // alternative 2: \d+(\.)?
        if d1 == 0 { return None; }
        let mut e = i + d1;
        if s.get(e) == Some(&'.') { e += 1; }
        end = Some(e);
    }
    let mut e = end.unwrap();
    // ([eE][+\-]?\d+)?
    if matches!(s.get(e), Some('e') | Some('E')) {
        let mut k = e + 1;
        if matches!(s.get(k), Some('+') | Some('-')) { k += 1; }
        let d = digits(k);
        if d > 0 { e = k + d; }
    }
    Some(e)
}

fn match_name(s: &[char]) -> usize {
    s.iter().take_while(|c| c.is_ascii_alphanumeric() || **c == '_').count()
}

/// `_testOperators` for the splitting or not-splitting operators, longest
/// first. The JS sorts the length buckets by `Object.keys(...).sort().reverse()`,
/// i.e. by the *string* of the length; with the lengths that occur ("1", "3")
/// that is plain descending order.
fn test_operators(s: &[char], splitting: bool) -> Option<&'static OpDef> {
    let mut lens: Vec<usize> = OPERATORS.iter().filter(|d| d.splitting == splitting)
        .map(|d| d.literal.chars().count()).collect();
    lens.sort_by_key(|l| l.to_string());
    lens.dedup();
    lens.reverse();
    for l in lens {
        if s.len() < l {
            // substr returns a shorter string, which can't equal a literal of length l
            continue;
        }
        let cand: String = s[..l].iter().collect();
        if let Some(d) = OPERATORS.iter().find(|d| d.splitting == splitting && d.literal == cand) {
            return Some(d);
        }
    }
    None
}

fn tokenize(input: &str) -> std::result::Result<Vec<Tok>, CompileError> {
    let mut s: Vec<char> = input.chars().collect();
    let mut i = 0usize;
    let mut tokens: Vec<Tok> = vec![];
    let mut split_expected = false;
    while i < s.len() {
        let c = s[i];
        if " \n\r\t".contains(c) {
            i += 1;
            split_expected = false;
            continue;
        }
        if "()[]".contains(c) {
            tokens.push(Tok::Bracket(c));
            i += 1;
            split_expected = false;
            continue;
        }
        if c == '"' {
            let end = s[i + 1..].iter().position(|x| *x == '"').map(|p| p + i + 1)
                .ok_or_else(|| pl("A closing double quote is  missing for an opening string literal: \""))?;
            tokens.push(Tok::Str(Rc::from(s[i + 1..end].iter().collect::<String>())));
            i = end + 1;
            split_expected = false;
            continue;
        }
        if c == 'S' && s.get(i + 1) == Some(&'"') {
            let end = s[i + 2..].iter().position(|x| *x == '"').map(|p| p + i + 2)
                .ok_or_else(|| pl(format!("A closing double quote is  missing for an opening selector literal S\" ...in: {}",
                    s[i..].iter().collect::<String>())))?;
            let lit: String = s[i + 2..end].iter().collect();
            // parse errors here are CPSParserErrors, not PropertyLanguageErrors:
            // they escape Expression.factory
            let sl = SelectorList::parse(&lit, false).map_err(CompileError::Fatal)?;
            tokens.push(Tok::Selector(Rc::new(sl)));
            i = end + 1;
            split_expected = false;
            continue;
        }
        s = s[i..].to_vec();
        i = 0;
        if let Some(l) = match_number(&s) {
            let lit: String = s[..l].iter().collect();
            tokens.push(Tok::Number(js_parse_float(&lit)));
            i = l;
            split_expected = false;
            continue;
        }
        if let Some(d) = test_operators(&s, true) {
            tokens.push(Tok::Op(d.op, d.pre, d.post));
            i += d.literal.chars().count();
            split_expected = false;
            continue;
        }
        if split_expected {
            return Err(pl(format!("A splitting token was expected after: {} but it was not found in: {}",
                tokens.last().map(tok_str).unwrap_or_default(), s.iter().collect::<String>())));
        }
        split_expected = true;
        let l = match_name(&s);
        if l > 0 {
            let name: String = s[..l].iter().collect();
            if name == "Infinity" {
                tokens.push(Tok::Number(f64::INFINITY));
            } else if let Some(d) = by_literal(&name).filter(|d| !d.splitting) {
                tokens.push(Tok::Op(d.op, d.pre, d.post));
            } else {
                tokens.push(Tok::Name(Rc::from(name)));
            }
            i += l;
            continue;
        }
        if let Some(d) = test_operators(&s, false) {
            tokens.push(Tok::Op(d.op, d.pre, d.post));
            i += d.literal.chars().count();
            continue;
        }
        return Err(pl(format!("Can't find the next token in the string: {}", s.iter().collect::<String>())));
    }
    Ok(tokens)
}

/// `parseFloat` of a string that matched `R_number`.
fn js_parse_float(lit: &str) -> f64 {
    // Rust accepts "5." and ".5" and exponents like JS does for these inputs
    lit.parse::<f64>().unwrap_or(f64::NAN)
}

fn tok_str(t: &Tok) -> String {
    match t {
        Tok::Name(n) => format!("<NameToken: {n}>"),
        Tok::Number(n) => format!("<NumberToken: {}>", mp_math::js_num(*n)),
        Tok::Str(s) => format!("<StringToken: {s}>"),
        Tok::Selector(s) => format!("<SelectorToken: {s}>"),
        Tok::Bracket(b) => format!("<BracketToken: {b}>"),
        Tok::Op(o, _, _) => format!("<OperatorToken: {}>", def(*o).literal),
        Tok::Group(_) => "[group]".into(),
    }
}

fn is_op(t: &Tok) -> bool { matches!(t, Tok::Op(..)) }

fn resolve_brackets(tokens: Vec<Tok>) -> std::result::Result<Vec<Tok>, CompileError> {
    let mut open: Vec<char> = vec![];
    let mut start = 0;
    let mut result = vec![];
    for i in 0..tokens.len() {
        match &tokens[i] {
            Tok::Bracket(b) if *b == '(' || *b == '[' => {
                if open.is_empty() { start = i + 1; }
                open.push(*b);
            }
            Tok::Bracket(b) => {
                let counterpart = if *b == ')' { '(' } else { '[' };
                if open.last() != Some(&counterpart) {
                    return Err(pl(format!("A closing bracket appeared \"{b}\" but a matching opening  bracket is missing before.")));
                }
                if open.len() == 1 {
                    if open[0] == '[' {
                        let d = def(Op::Get);
                        result.push(Tok::Op(d.op, d.pre, d.post));
                    }
                    result.push(Tok::Group(infix_to_postfix(tokens[start..i].to_vec())?));
                }
                open.pop();
            }
            t => {
                if open.is_empty() { result.push(t.clone()); }
            }
        }
    }
    if !open.is_empty() {
        let n = open.len();
        return Err(pl(format!("{n} {} missing for the opened: {}",
            if n == 1 { "bracket is" } else { "brackets are" },
            open.iter().map(|c| c.to_string()).collect::<Vec<_>>().join(", "))));
    }
    Ok(result)
}

fn flatten(tokens: Vec<Tok>, out: &mut Vec<Tok>) {
    for t in tokens {
        match t {
            Tok::Group(g) => flatten(g, out),
            t => out.push(t),
        }
    }
}

fn infix_to_postfix(mut tokens: Vec<Tok>) -> std::result::Result<Vec<Tok>, CompileError> {
    // the negate operator
    for i in 0..tokens.len() {
        if matches!(tokens[i], Tok::Op(Op::Sub, ..)) && (i == 0 || is_op(&tokens[i - 1])) {
            let d = def(Op::Negate);
            tokens[i] = Tok::Op(d.op, d.pre, d.post);
        }
    }
    let mut tokens = resolve_brackets(tokens)?;
    // precedence levels, highest first
    let mut levels: Vec<f64> = vec![];
    for d in OPERATORS {
        if !levels.contains(&d.precedence) { levels.push(d.precedence); }
    }
    levels.sort_by(|a, b| b.partial_cmp(a).unwrap());
    for level in levels {
        let mut i = 0;
        while i < tokens.len() {
            let (op, pre_c, post_c) = match &tokens[i] {
                Tok::Op(o, pre, post) if def(*o).precedence == level => (*o, *pre, *post),
                _ => { i += 1; continue; }
            };
            let pre = match pre_c { Consume::Inf => i, Consume::N(n) => n };
            if pre > i {
                return Err(pl(format!("Stack underflow at a \"<OperatorToken: {}>\" operator, which pre-consumes more items than there are on the stack", def(op).literal)));
            }
            let start_pre = i - pre;
            let start_post = i + 1;
            let post = match post_c { Consume::Inf => tokens.len() - start_post, Consume::N(n) => n };
            let end_post = start_post + post;
            if end_post > tokens.len() {
                return Err(pl(format!("Stack underflow at a \"<OperatorToken: {}>\" operator, which post-consumes more items than there are on the stack", def(op).literal)));
            }
            let mut operation: Vec<Tok> = tokens[start_pre..i].to_vec();
            operation.extend(tokens[start_post..end_post].iter().cloned());
            for t in &operation {
                if let Tok::Op(o2, ..) = t {
                    return Err(pl(format!("Malformed stack at a \"{}\" operator, which consumes another operator: \"{}\"",
                        def(op).literal, def(*o2).literal)));
                }
            }
            operation.push(Tok::Op(op, Consume::N(pre), Consume::N(post)));
            let n = operation.len();
            tokens.splice(start_pre..start_pre + n, std::iter::once(Tok::Group(operation)));
            i = start_pre + 1;
        }
    }
    let mut out = vec![];
    flatten(tokens, &mut out);
    Ok(out)
}

/// Compile a formula: `parser.parse(valueString)` + `Stack._check`.
pub fn compile(source: &str) -> std::result::Result<Expr, CompileError> {
    let tokens = tokenize(source)?;
    let postfix = infix_to_postfix(tokens)?;
    if postfix.is_empty() {
        return Err(pl("The input string did not produce any instructions."));
    }
    let items: Vec<Item> = postfix.into_iter().map(|t| match t {
        Tok::Name(n) => Item::Name(n),
        Tok::Number(n) => Item::Number(n),
        Tok::Str(s) => Item::Str(s),
        Tok::Selector(s) => Item::Selector(s),
        Tok::Op(op, pre, post) => {
            let n = |c: Consume| match c { Consume::N(n) => n, Consume::Inf => 0 };
            Item::Op { op, consumes: n(pre) + n(post) }
        }
        // brackets are resolved, groups flattened
        Tok::Bracket(_) | Tok::Group(_) => unreachable!(),
    }).collect();
    // Stack._check
    let mut len: isize = 0;
    for (i, item) in items.iter().enumerate() {
        len -= item.consumes() as isize;
        if len < 0 {
            return Err(pl(format!("Stack underflow at ({i}) a {item}. This means an operator consumes more items than there are on the stack.")));
        }
        len += 1;
    }
    if len > 1 {
        return Err(pl(format!("Stack too crowded. A stack must eventually resolve to 1 item, the result. This stack has still {len} items.")));
    }
    Ok(Expr { items })
}

impl Op {
    pub fn literal(self) -> &'static str { def(self).literal }
}

pub fn not_found_error(what: &str) -> CpsError {
    CpsError::new(ErrorKind::PropertyLanguage, format!("Not found: an element for {what}"))
}

pub type PlResult<T> = Result<T>;
