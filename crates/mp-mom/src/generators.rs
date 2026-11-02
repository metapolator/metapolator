//! CPS generators (`generated://interpolation/0/<n>`, `generated://metapolation/0/<n>`).
//!
//! Port of Atem-MOM `cpsGenerators/*.js`, which render a mustache template
//! with `{ n: [0, 1, ..., n-1] }`. Only the mustache features the templates
//! use are implemented: list sections `{{#n}}…{{/n}}`, `{{.}}`, and
//! mustache.js's "standalone line" rule (a line that holds only section tags
//! and whitespace is removed, including its newline).

use mp_cps::GenArg;

pub const INTERPOLATION_TPL: &str = include_str!("../cpslib/generators/interpolation.tpl");
pub const METAPOLATION_TPL: &str = include_str!("../cpslib/generators/metapolation.tpl");

#[derive(Debug)]
enum Tok {
    Text(char),
    Var,
    Open,
    Close,
}

#[derive(Debug)]
enum Node {
    Text(String),
    Var,
    Section(Vec<Node>),
}

fn tokenize(t: &str) -> Vec<Option<Tok>> {
    let chars: Vec<char> = t.chars().collect();
    let mut tokens: Vec<Option<Tok>> = vec![];
    let mut spaces: Vec<usize> = vec![];
    let mut has_tag = false;
    let mut non_space = false;
    let mut i = 0;
    while i < chars.len() {
        if chars[i] == '{' && chars.get(i + 1) == Some(&'{') {
            let end = (i + 2..chars.len().saturating_sub(1))
                .find(|&k| chars[k] == '}' && chars[k + 1] == '}')
                .expect("unclosed mustache tag");
            let inner: String = chars[i + 2..end].iter().collect();
            let inner = inner.trim();
            has_tag = true;
            let tok = if let Some(_name) = inner.strip_prefix('#') {
                Tok::Open
            } else if inner.starts_with('/') {
                Tok::Close
            } else {
                non_space = true;
                Tok::Var
            };
            tokens.push(Some(tok));
            i = end + 2;
            continue;
        }
        let c = chars[i];
        if c.is_whitespace() { spaces.push(tokens.len()); } else { non_space = true; }
        tokens.push(Some(Tok::Text(c)));
        if c == '\n' {
            // stripSpace()
            if has_tag && !non_space {
                for s in spaces.drain(..) { tokens[s] = None; }
            } else {
                spaces.clear();
            }
            has_tag = false;
            non_space = false;
        }
        i += 1;
    }
    tokens
}

fn nest(tokens: Vec<Option<Tok>>) -> Vec<Node> {
    let mut stack: Vec<Vec<Node>> = vec![vec![]];
    for t in tokens.into_iter().flatten() {
        match t {
            Tok::Text(c) => {
                let cur = stack.last_mut().unwrap();
                match cur.last_mut() {
                    Some(Node::Text(s)) => s.push(c),
                    _ => cur.push(Node::Text(c.to_string())),
                }
            }
            Tok::Var => stack.last_mut().unwrap().push(Node::Var),
            Tok::Open => stack.push(vec![]),
            Tok::Close => {
                let inner = stack.pop().unwrap();
                stack.last_mut().unwrap().push(Node::Section(inner));
            }
        }
    }
    stack.pop().unwrap()
}

fn render_nodes(nodes: &[Node], list: &[usize], current: Option<usize>, out: &mut String) {
    for n in nodes {
        match n {
            Node::Text(s) => out.push_str(s),
            Node::Var => if let Some(c) = current { out.push_str(&c.to_string()) },
            Node::Section(inner) => for &item in list { render_nodes(inner, list, Some(item), out) },
        }
    }
}

/// `mustache.render(template, {n: [0..count]})`
pub fn render(template: &str, count: usize) -> String {
    let nodes = nest(tokenize(template));
    let list: Vec<usize> = (0..count).collect();
    let mut out = String::new();
    render_nodes(&nodes, &list, None, &mut out);
    out
}

/// The generator function: `function(masterCount)`; JS loops `n < masterCount`
/// so non-numbers and non-integers behave like the comparison does.
fn count_from(args: &[GenArg]) -> usize {
    match args.first() {
        Some(GenArg::Number(n)) if *n > 0.0 => n.ceil() as usize,
        _ => 0,
    }
}

pub fn interpolation(args: &[GenArg]) -> String { render(INTERPOLATION_TPL, count_from(args)) }
pub fn metapolation(args: &[GenArg]) -> String { render(METAPOLATION_TPL, count_from(args)) }
