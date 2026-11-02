//! Minimal DOM + serializer reproducing jsdom's `XMLSerializer` output for
//! the documents ufoJS builds (no namespaces, no pretty printing).

#[derive(Clone, Debug)]
pub enum XNode {
    Element(Element),
    Text(String),
}

#[derive(Clone, Debug, Default)]
pub struct Element {
    pub name: String,
    pub attrs: Vec<(String, String)>,
    pub children: Vec<XNode>,
}

impl Element {
    pub fn new(name: &str) -> Self { Element { name: name.to_string(), ..Default::default() } }
    pub fn attr(mut self, k: &str, v: impl Into<String>) -> Self { self.set_attr(k, v); self }
    /// `setAttribute`: replaces an existing attribute in place
    pub fn set_attr(&mut self, k: &str, v: impl Into<String>) {
        let v = v.into();
        match self.attrs.iter_mut().find(|(n, _)| n == k) {
            Some(a) => a.1 = v,
            None => self.attrs.push((k.to_string(), v)),
        }
    }
    pub fn push(&mut self, child: Element) { self.children.push(XNode::Element(child)); }
    pub fn text(&mut self, t: impl Into<String>) { self.children.push(XNode::Text(t.into())); }
    pub fn with_text(mut self, t: impl Into<String>) -> Self { self.text(t); self }

    pub fn serialize(&self, out: &mut String) {
        out.push('<');
        out.push_str(&self.name);
        for (k, v) in &self.attrs {
            out.push(' ');
            out.push_str(k);
            out.push_str("=\"");
            escape_attr(v, out);
            out.push('"');
        }
        if self.children.is_empty() {
            out.push_str("/>");
            return;
        }
        out.push('>');
        for c in &self.children {
            match c {
                XNode::Element(e) => e.serialize(out),
                XNode::Text(t) => escape_text(t, out),
            }
        }
        out.push_str("</");
        out.push_str(&self.name);
        out.push('>');
    }
}

fn escape_attr(s: &str, out: &mut String) {
    for c in s.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '"' => out.push_str("&quot;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '\t' => out.push_str("&#x9;"),
            '\n' => out.push_str("&#xA;"),
            '\r' => out.push_str("&#xD;"),
            c => out.push(c),
        }
    }
}

fn escape_text(s: &str, out: &mut String) {
    for c in s.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            c => out.push(c),
        }
    }
}

pub const XML_DECLARATION: &str = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
