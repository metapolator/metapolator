//! Port of gonzales 1.0.0 (`gonzales.cssp.node.js` + `cssp.translator.node.js`),
//! the CSS parser Atem-CPS uses. CPS files are accepted or rejected exactly as
//! the JS engine does, so this is a mechanical, function-by-function port.
//!
//! Differences from the JS original (documented, deliberate):
//! - the tokenizer's `urlMode`/`blockMode` are module-level globals in JS that
//!   leak from one parse into the next; here they are reset for each parse.
//! - places where the JS dereferences a missing token (`tokens[i].type` with
//!   `i` out of range) throw a TypeError there, which aborts the parse; here
//!   they return `Err(ParseError)`. Both end in "this file failed to parse".

use std::fmt;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum T {
    StringSQ, StringDQ, CommentML, CommentSL,
    Newline, Space, Tab,
    ExclamationMark, QuotationMark, NumberSign, DollarSign, PercentSign, Ampersand,
    Apostrophe, LeftParenthesis, RightParenthesis, Asterisk, PlusSign, Comma,
    HyphenMinus, FullStop, Solidus, Colon, Semicolon, LessThanSign, EqualsSign,
    GreaterThanSign, QuestionMark, CommercialAt, LeftSquareBracket,
    RightSquareBracket, CircumflexAccent, LowLine, LeftCurlyBracket, VerticalLine,
    RightCurlyBracket, Tilde,
    Identifier, DecimalNumber,
}

fn punctuation(c: char) -> Option<T> {
    Some(match c {
        ' ' => T::Space, '\n' | '\r' => T::Newline, '\t' => T::Tab,
        '!' => T::ExclamationMark, '"' => T::QuotationMark, '#' => T::NumberSign,
        '$' => T::DollarSign, '%' => T::PercentSign, '&' => T::Ampersand,
        '\'' => T::Apostrophe, '(' => T::LeftParenthesis, ')' => T::RightParenthesis,
        '*' => T::Asterisk, '+' => T::PlusSign, ',' => T::Comma, '-' => T::HyphenMinus,
        '.' => T::FullStop, '/' => T::Solidus, ':' => T::Colon, ';' => T::Semicolon,
        '<' => T::LessThanSign, '=' => T::EqualsSign, '>' => T::GreaterThanSign,
        '?' => T::QuestionMark, '@' => T::CommercialAt, '[' => T::LeftSquareBracket,
        ']' => T::RightSquareBracket, '^' => T::CircumflexAccent, '_' => T::LowLine,
        '{' => T::LeftCurlyBracket, '|' => T::VerticalLine, '}' => T::RightCurlyBracket,
        '~' => T::Tilde,
        _ => return None,
    })
}

#[derive(Clone, Debug, Default)]
struct Marks {
    right: Option<usize>,
    ws: bool,
    ws_last: Option<usize>,
    ident_last: Option<usize>,
    nm_name_last: Option<usize>,
    selector_end: Option<usize>,
    atrulers_end: bool,
    bd_type: u8,
    bd_filter: bool,
    filterp_l: usize,
    last_progid: usize,
    progid_end: usize,
    nth_last: Option<usize>,
    nthf_last: usize,
    atrule_type: u8,
}

#[derive(Clone, Debug)]
pub struct Token {
    pub ty: T,
    pub value: String,
    pub ln: usize,
}

/// The AST: `[type, item, item, ...]` in the JS; items are strings or nodes.
#[derive(Clone, Debug, PartialEq)]
pub enum Ast {
    Node(&'static str, Vec<Ast>),
    Str(String),
}

impl Ast {
    pub fn ty(&self) -> Option<&'static str> {
        match self { Ast::Node(t, _) => Some(t), Ast::Str(_) => None }
    }
    pub fn items(&self) -> &[Ast] {
        match self { Ast::Node(_, i) => i, Ast::Str(_) => &[] }
    }
    pub fn as_str(&self) -> Option<&str> {
        match self { Ast::Str(s) => Some(s), _ => None }
    }
    fn n(ty: &'static str, items: Vec<Ast>) -> Ast { Ast::Node(ty, items) }
    fn s(s: impl Into<String>) -> Ast { Ast::Str(s.into()) }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ParseError {
    pub message: String,
}

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result { f.write_str(&self.message) }
}

type R<T> = Result<T, ParseError>;

// ------------------------------------------------------------------ tokenizer

fn tokenize(s: &str) -> Vec<Token> {
    let chars: Vec<char> = s.chars().collect();
    let mut tokens: Vec<Token> = Vec::new();
    let mut ln = 1;
    let mut url_mode = false;
    let mut block_mode: i64 = 0;
    let mut pos = 0usize;
    let at = |p: usize| -> Option<char> { chars.get(p).copied() };
    let sub = |a: usize, b: usize| -> String { chars[a.min(chars.len())..b.min(chars.len())].iter().collect() };
    while pos < chars.len() {
        let c = chars[pos];
        let cn = at(pos + 1);
        if c == '/' && cn == Some('*') {
            // parseMLComment
            let start = pos;
            pos += 2;
            while pos < chars.len() {
                if chars[pos] == '*' && at(pos + 1) == Some('/') {
                    pos += 1;
                    break;
                }
                pos += 1;
            }
            tokens.push(Token { ty: T::CommentML, value: sub(start, pos + 1), ln });
        } else if !url_mode && c == '/' && cn == Some('/') {
            if block_mode > 0 {
                parse_identifier(&chars, &mut pos, &mut tokens, ln, &mut url_mode);
            } else {
                // parseSLComment
                let start = pos;
                pos += 2;
                while pos < chars.len() {
                    if chars[pos] == '\n' || chars[pos] == '\r' {
                        pos += 1;
                        break;
                    }
                    pos += 1;
                }
                tokens.push(Token { ty: T::CommentSL, value: sub(start, pos), ln });
                pos -= 1;
            }
        } else if c == '"' || c == '\'' {
            let start = pos;
            pos += 1;
            while pos < chars.len() {
                if chars[pos] == '\\' { pos += 1; }
                else if chars[pos] == c { break; }
                pos += 1;
            }
            tokens.push(Token { ty: if c == '"' { T::StringDQ } else { T::StringSQ }, value: sub(start, pos + 1), ln });
        } else if c == ' ' {
            let start = pos;
            while pos < chars.len() && chars[pos] == ' ' { pos += 1; }
            tokens.push(Token { ty: T::Space, value: sub(start, pos), ln });
            pos -= 1;
        } else if let Some(ty) = punctuation(c) {
            tokens.push(Token { ty, value: c.to_string(), ln });
            if c == '\n' || c == '\r' { ln += 1; }
            if c == ')' { url_mode = false; }
            if c == '{' { block_mode += 1; }
            if c == '}' { block_mode -= 1; }
        } else if c.is_ascii_digit() {
            let start = pos;
            while pos < chars.len() && chars[pos].is_ascii_digit() { pos += 1; }
            tokens.push(Token { ty: T::DecimalNumber, value: sub(start, pos), ln });
            pos -= 1;
        } else {
            parse_identifier(&chars, &mut pos, &mut tokens, ln, &mut url_mode);
        }
        pos += 1;
    }
    tokens
}

fn parse_identifier(chars: &[char], pos: &mut usize, tokens: &mut Vec<Token>, ln: usize, url_mode: &mut bool) {
    let start = *pos;
    while *pos < chars.len() && chars[*pos] == '/' { *pos += 1; }
    while *pos < chars.len() {
        if chars[*pos] == '\\' { *pos += 1; }
        else if punctuation(chars[*pos]).is_some() { break; }
        *pos += 1;
    }
    let ident: String = chars[start..(*pos).min(chars.len())].iter().collect();
    *url_mode = *url_mode || ident == "url";
    tokens.push(Token { ty: T::Identifier, value: ident, ln });
    *pos -= 1;
}

// ------------------------------------------------------------------ parser

pub struct Parser {
    toks: Vec<Token>,
    m: Vec<Marks>,
    pos: usize,
}

const NO: usize = 0; // `fail()` returns undefined, i.e. falsy

impl Parser {
    fn new(src: &str) -> Parser {
        let toks = tokenize(src);
        let m = vec![Marks::default(); toks.len() + 1];
        let mut p = Parser { toks, m, pos: 0 };
        p.mark_brackets();
        p.mark_sc();
        p
    }

    fn len(&self) -> usize { self.toks.len() }

    /// `tokens[i]` that the JS dereferences unguarded: out of range throws.
    fn t(&self, i: usize) -> R<&Token> {
        self.toks.get(i).ok_or_else(|| ParseError { message: format!("TypeError: token {i} is undefined") })
    }
    fn ty(&self, i: usize) -> R<T> { Ok(self.t(i)?.ty) }
    fn ty_opt(&self, i: usize) -> Option<T> { self.toks.get(i).map(|t| t.ty) }
    fn val(&self, i: usize) -> R<&str> { Ok(&self.t(i)?.value) }

    fn mark_brackets(&mut self) {
        let (mut ps, mut sbs, mut cbs) = (vec![], vec![], vec![]);
        for i in 0..self.toks.len() {
            let stack = match self.toks[i].ty {
                T::LeftParenthesis => { ps.push(i); continue; }
                T::LeftSquareBracket => { sbs.push(i); continue; }
                T::LeftCurlyBracket => { cbs.push(i); continue; }
                T::RightParenthesis => &mut ps,
                T::RightSquareBracket => &mut sbs,
                T::RightCurlyBracket => &mut cbs,
                _ => continue,
            };
            if let Some(left) = stack.pop() {
                self.m[left].right = Some(i);
            }
        }
    }

    fn mark_sc(&mut self) {
        let mut ws: Option<usize> = None;
        let n = self.toks.len();
        for i in 0..n {
            match self.toks[i].ty {
                T::Space | T::Tab | T::Newline => {
                    self.m[i].ws = true;
                    if ws.is_none() { ws = Some(i); }
                }
                _ => {
                    if let Some(w) = ws.take() { self.m[w].ws_last = Some(i - 1); }
                }
            }
        }
        if let Some(w) = ws { self.m[w].ws_last = Some(n - 1); }
    }

    fn throw_error(&self) -> ParseError {
        ParseError { message: "Please check the validity of the CSS block".into() }
    }

    /// `tokens[i].right - i + 1`; NaN (falsy) when there is no match.
    fn right_len(&self, i: usize) -> usize {
        match self.m[i].right { Some(r) => r - i + 1, None => NO }
    }

    // any = braces | string | percentage | dimension | number | uri | functionExpression | funktion | ident | unary
    fn check_any(&mut self, i: usize) -> R<usize> {
        // short-circuits exactly like the JS `||` chain
        let l = self.check_braces(i)?; if l != 0 { return Ok(l); }
        let l = self.check_string(i); if l != 0 { return Ok(l); }
        let l = self.check_percentage(i)?; if l != 0 { return Ok(l); }
        let l = self.check_dimension(i)?; if l != 0 { return Ok(l); }
        let l = self.check_number(i)?; if l != 0 { return Ok(l); }
        let l = self.check_uri(i)?; if l != 0 { return Ok(l); }
        let l = self.check_function_expression(i)?; if l != 0 { return Ok(l); }
        let l = self.check_funktion(i)?; if l != 0 { return Ok(l); }
        let l = self.check_ident(i)?; if l != 0 { return Ok(l); }
        Ok(self.check_unary(i))
    }
    fn get_any(&mut self) -> R<Ast> {
        let p = self.pos;
        if self.check_braces(p)? != 0 { return self.get_braces(); }
        if self.check_string(p) != 0 { return Ok(self.get_string()); }
        if self.check_percentage(p)? != 0 { return self.get_percentage(); }
        if self.check_dimension(p)? != 0 { return self.get_dimension(); }
        if self.check_number(p)? != 0 { return Ok(self.get_number()); }
        if self.check_uri(p)? != 0 { return self.get_uri(); }
        if self.check_function_expression(p)? != 0 { return self.get_function_expression(); }
        if self.check_funktion(p)? != 0 { return self.get_funktion(); }
        if self.check_ident(p)? != 0 { return Ok(self.get_ident()); }
        if self.check_unary(p) != 0 { return Ok(self.get_unary()); }
        Err(self.throw_error())
    }

    fn check_atkeyword(&mut self, i: usize) -> R<usize> {
        if self.ty(i)? != T::CommercialAt { return Ok(NO); }
        let l = self.check_ident(i + 1)?;
        Ok(if l != 0 { l + 1 } else { NO })
    }
    fn get_atkeyword(&mut self) -> Ast {
        self.pos += 1;
        Ast::n("atkeyword", vec![self.get_ident()])
    }

    fn check_attrib(&mut self, i: usize) -> R<usize> {
        if self.ty(i)? != T::LeftSquareBracket { return Ok(NO); }
        Ok(match self.m[i].right { Some(r) if r != 0 => r - i + 1, _ => NO })
    }
    fn check_attrib1(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        i += 1;
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        let l = self.check_ident(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        let l = self.check_attrselector(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        let mut l = self.check_ident(i)?;
        if l == 0 { l = self.check_string(i); }
        if l != 0 { i += l; } else { return Ok(NO); }
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        if self.ty(i)? == T::RightSquareBracket { return Ok(i - start); }
        Ok(NO)
    }
    fn get_attrib1(&mut self) -> R<Ast> {
        self.pos += 1;
        let mut a = self.get_sc()?;
        a.push(self.get_ident());
        a.extend(self.get_sc()?);
        a.push(self.get_attrselector());
        a.extend(self.get_sc()?);
        let p = self.pos;
        a.push(if self.check_string(p) != 0 { self.get_string() } else { self.get_ident() });
        a.extend(self.get_sc()?);
        self.pos += 1;
        Ok(Ast::n("attrib", a))
    }
    fn check_attrib2(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        i += 1;
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        let l = self.check_ident(i)?; if l != 0 { i += l; }
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        if self.ty(i)? == T::RightSquareBracket { return Ok(i - start); }
        Ok(NO)
    }
    fn get_attrib2(&mut self) -> R<Ast> {
        self.pos += 1;
        let mut a = self.get_sc()?;
        a.push(self.get_ident());
        a.extend(self.get_sc()?);
        self.pos += 1;
        Ok(Ast::n("attrib", a))
    }
    fn get_attrib(&mut self) -> R<Ast> {
        let p = self.pos;
        if self.check_attrib1(p)? != 0 { return self.get_attrib1(); }
        if self.check_attrib2(p)? != 0 { return self.get_attrib2(); }
        // JS returns undefined here; concatenation then breaks the AST
        Err(self.throw_error())
    }
    fn check_attrselector(&mut self, i: usize) -> R<usize> {
        let ty = self.ty(i)?;
        if ty == T::EqualsSign { return Ok(1); }
        let next = self.ty_opt(i + 1);
        if ty == T::VerticalLine && next != Some(T::EqualsSign) { return Ok(1); }
        if next != Some(T::EqualsSign) { return Ok(NO); }
        Ok(match ty {
            T::Tilde | T::CircumflexAccent | T::DollarSign | T::Asterisk | T::VerticalLine => 2,
            _ => NO,
        })
    }
    fn get_attrselector(&mut self) -> Ast {
        let mut s = self.toks[self.pos].value.clone();
        self.pos += 1;
        if self.ty_opt(self.pos) == Some(T::EqualsSign) {
            s += &self.toks[self.pos].value;
            self.pos += 1;
        }
        Ast::n("attrselector", vec![Ast::s(s)])
    }

    fn check_atrule(&mut self, i: usize) -> R<usize> {
        let mut l = self.check_atruler(i)?;
        if l != 0 { self.m[i].atrule_type = 1; return Ok(l); }
        l = self.check_atruleb(i)?;
        if l != 0 { self.m[i].atrule_type = 2; return Ok(l); }
        l = self.check_atrules(i)?;
        if l != 0 { self.m[i].atrule_type = 3; return Ok(l); }
        Ok(NO)
    }
    fn get_atrule(&mut self) -> R<Ast> {
        match self.m[self.pos].atrule_type {
            1 => self.get_atruler(),
            2 => self.get_atruleb(),
            3 => self.get_atrules(),
            _ => Err(self.throw_error()),
        }
    }
    fn check_atruleb(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_atkeyword(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        let l = self.check_tsets(i)?; if l != 0 { i += l; }
        let l = self.check_block(i); if l != 0 { i += l; } else { return Ok(NO); }
        Ok(i - start)
    }
    fn get_atruleb(&mut self) -> R<Ast> {
        let mut a = vec![self.get_atkeyword()];
        a.extend(self.get_tsets()?);
        a.push(self.get_block()?);
        Ok(Ast::n("atruleb", a))
    }
    fn check_atruler(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_atkeyword(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        let l = self.check_atrulerq(i)?; if l != 0 { i += l; }
        if i < self.len() && self.toks[i].ty == T::LeftCurlyBracket { i += 1; } else { return Ok(NO); }
        let l = self.check_atrulers(i)?; if l != 0 { i += l; }
        if i < self.len() && self.toks[i].ty == T::RightCurlyBracket { i += 1; } else { return Ok(NO); }
        Ok(i - start)
    }
    fn get_atruler(&mut self) -> R<Ast> {
        let ak = self.get_atkeyword();
        let q = self.get_atrulerq()?;
        self.pos += 1;
        let rs = self.get_atrulers()?;
        self.pos += 1;
        Ok(Ast::n("atruler", vec![ak, q, rs]))
    }
    fn check_atrulerq(&mut self, i: usize) -> R<usize> { self.check_tsets(i) }
    fn get_atrulerq(&mut self) -> R<Ast> { Ok(Ast::n("atrulerq", self.get_tsets()?)) }
    fn check_atrulers(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        loop {
            let mut l = self.check_ruleset(i)?;
            if l == 0 { l = self.check_atrule(i)?; }
            if l == 0 { l = self.check_sc(i)?; }
            if l == 0 { break; }
            i += l;
        }
        // tokens[_i].atrulers_end = 1 (throws when _i is past the end)
        self.t(i)?;
        self.m[i].atrulers_end = true;
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        Ok(i - start)
    }
    fn get_atrulers(&mut self) -> R<Ast> {
        let mut a = self.get_sc()?;
        while !self.m[self.pos].atrulers_end {
            let p = self.pos;
            if self.check_sc(p)? != 0 { a.extend(self.get_sc()?); }
            else if self.check_ruleset(p)? != 0 { a.push(self.get_ruleset()?); }
            else { a.push(self.get_atrule()?); }
        }
        a.extend(self.get_sc()?);
        Ok(Ast::n("atrulers", a))
    }
    fn check_atrules(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_atkeyword(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        let l = self.check_tsets(i)?; if l != 0 { i += l; }
        if i >= self.len() { return Ok(i - start); }
        if self.toks[i].ty == T::Semicolon { i += 1; } else { return Ok(NO); }
        Ok(i - start)
    }
    fn get_atrules(&mut self) -> R<Ast> {
        let mut a = vec![self.get_atkeyword()];
        a.extend(self.get_tsets()?);
        self.pos += 1;
        Ok(Ast::n("atrules", a))
    }

    fn check_block(&self, i: usize) -> usize {
        if i < self.len() && self.toks[i].ty == T::LeftCurlyBracket { return self.right_len(i); }
        NO
    }
    fn get_block(&mut self) -> R<Ast> {
        let end = self.m[self.pos].right.ok_or_else(|| self.throw_error())?;
        self.pos += 1;
        let mut a = vec![];
        while self.pos < end {
            let p = self.pos;
            if self.check_blockdecl(p)? != 0 { a.extend(self.get_blockdecl()?); }
            else { return Err(self.throw_error()); }
        }
        self.pos = end + 1;
        Ok(Ast::n("block", a))
    }
    fn check_blockdecl(&mut self, i: usize) -> R<usize> {
        let mut l = self.check_blockdecl0(i)?;
        if l != 0 { self.m[i].bd_type = 1; return Ok(l); }
        l = self.check_blockdecl1(i)?;
        if l != 0 { self.m[i].bd_type = 2; return Ok(l); }
        l = self.check_blockdecl2(i)?;
        if l != 0 { self.m[i].bd_type = 3; return Ok(l); }
        l = self.check_sc(i)?;
        if l != 0 { self.m[i].bd_type = 4; return Ok(l); }
        Ok(NO)
    }
    fn get_blockdecl(&mut self) -> R<Vec<Ast>> {
        let ty = self.m[self.pos].bd_type;
        let mut a = self.get_sc()?;
        match ty {
            1 | 2 => {
                let p = self.pos;
                a.push(if self.m[p].bd_filter { self.get_filter()? } else { self.get_declaration()? });
                if ty == 1 { a.push(self.get_decldelim()); }
                a.extend(self.get_sc()?);
            }
            3 => {
                a.push(self.get_decldelim());
                a.extend(self.get_sc()?);
            }
            4 => {}
            _ => return Err(self.throw_error()),
        }
        Ok(a)
    }
    fn check_decl_or_filter(&mut self, i: usize) -> R<usize> {
        let l = self.check_filter(i)?;
        if l != 0 { self.m[i].bd_filter = true; return Ok(l); }
        let l = self.check_declaration(i)?;
        if l != 0 { return Ok(l); }
        Ok(NO)
    }
    fn check_blockdecl0(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        let l = self.check_decl_or_filter(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        if i < self.len() && self.check_decldelim(i) != 0 { i += 1; } else { return Ok(NO); }
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        Ok(i - start)
    }
    fn check_blockdecl1(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        let l = self.check_decl_or_filter(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        Ok(i - start)
    }
    fn check_blockdecl2(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        let l = self.check_decldelim(i); if l != 0 { i += l; } else { return Ok(NO); }
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        Ok(i - start)
    }

    fn check_braces(&self, i: usize) -> R<usize> {
        if i >= self.len() { return Ok(NO); }
        let ty = self.toks[i].ty;
        if ty != T::LeftParenthesis && ty != T::LeftSquareBracket { return Ok(NO); }
        Ok(self.right_len(i))
    }
    fn get_braces(&mut self) -> R<Ast> {
        let left = self.pos;
        let right = self.m[left].right.ok_or_else(|| self.throw_error())?;
        self.pos += 1;
        let tsets = self.get_tsets()?;
        self.pos += 1;
        let mut a = vec![Ast::s(self.toks[left].value.clone()), Ast::s(self.toks[right].value.clone())];
        a.extend(tsets);
        Ok(Ast::n("braces", a))
    }

    fn check_clazz(&mut self, i: usize) -> R<usize> {
        if self.ty(i)? == T::FullStop {
            let l = self.check_ident(i + 1)?;
            if l != 0 { return Ok(l + 1); }
        }
        Ok(NO)
    }
    fn get_clazz(&mut self) -> Ast {
        self.pos += 1;
        Ast::n("clazz", vec![self.get_ident()])
    }
    fn check_combinator(&self, i: usize) -> R<usize> {
        Ok(match self.ty(i)? { T::PlusSign | T::GreaterThanSign | T::Tilde => 1, _ => NO })
    }
    fn get_combinator(&mut self) -> Ast {
        let v = self.toks[self.pos].value.clone();
        self.pos += 1;
        Ast::n("combinator", vec![Ast::s(v)])
    }
    fn check_comment(&self, i: usize) -> R<usize> {
        Ok(if self.ty(i)? == T::CommentML { 1 } else { NO })
    }
    fn get_comment(&mut self) -> Ast {
        let v: Vec<char> = self.toks[self.pos].value.chars().skip(2).collect();
        let l = v.len();
        let s: String = if l >= 2 && v[l - 2] == '*' && v[l - 1] == '/' { v[..l - 2].iter().collect() } else { v.iter().collect() };
        self.pos += 1;
        Ast::n("comment", vec![Ast::s(s)])
    }
    fn check_declaration(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_property(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        if i < self.len() && self.toks[i].ty == T::Colon { i += 1; } else { return Ok(NO); }
        let l = self.check_value(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        Ok(i - start)
    }
    fn get_declaration(&mut self) -> R<Ast> {
        let p = self.get_property()?;
        self.pos += 1;
        let v = self.get_value()?;
        Ok(Ast::n("declaration", vec![p, v]))
    }
    fn check_decldelim(&self, i: usize) -> usize {
        if i < self.len() && self.toks[i].ty == T::Semicolon { 1 } else { NO }
    }
    fn get_decldelim(&mut self) -> Ast {
        self.pos += 1;
        Ast::n("decldelim", vec![])
    }
    fn check_delim(&self, i: usize) -> usize {
        if i < self.len() && self.toks[i].ty == T::Comma { 1 } else { NO }
    }
    fn get_delim(&mut self) -> Ast {
        self.pos += 1;
        Ast::n("delim", vec![])
    }
    fn check_dimension(&mut self, i: usize) -> R<usize> {
        let ln = self.check_number(i)?;
        if ln == 0 || i + ln >= self.len() { return Ok(NO); }
        let li = self.check_nm_name2(i + ln)?;
        Ok(if li != 0 { ln + li } else { NO })
    }
    fn get_dimension(&mut self) -> R<Ast> {
        let n = self.get_number();
        let d = Ast::n("ident", vec![Ast::s(self.get_nm_name2())]);
        Ok(Ast::n("dimension", vec![n, d]))
    }

    fn join2(&self, start: usize, num: usize) -> Option<String> {
        if start + num == 0 || start + num - 1 >= self.len() { return None; }
        Some((0..num).map(|k| self.toks[start + k].value.as_str()).collect())
    }
    fn join(&self, start: usize, finish: usize) -> String {
        (start..=finish).filter_map(|k| self.toks.get(k)).map(|t| t.value.as_str()).collect()
    }

    fn check_filter(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_filterp(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        if self.ty(i)? == T::Colon { i += 1; } else { return Ok(NO); }
        let l = self.check_filterv(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        Ok(i - start)
    }
    fn get_filter(&mut self) -> R<Ast> {
        let p = self.get_filterp()?;
        self.pos += 1;
        let v = self.get_filterv()?;
        Ok(Ast::n("filter", vec![p, v]))
    }
    fn check_filterp(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        if i < self.len() {
            let l;
            if self.toks[i].value == "filter" { l = 1; }
            else {
                let x = self.join2(i, 2);
                if matches!(x.as_deref(), Some("-filter") | Some("_filter") | Some("*filter")) { l = 2; }
                else if self.join2(i, 4).as_deref() == Some("-ms-filter") { l = 4; }
                else { return Ok(NO); }
            }
            self.m[start].filterp_l = l;
            i += l;
            // JS bug kept: adds the filterp length, not the sc length
            if self.check_sc(i)? != 0 { i += l; }
            return Ok(i - start);
        }
        Ok(NO)
    }
    fn get_filterp(&mut self) -> R<Ast> {
        let l = self.m[self.pos].filterp_l;
        let x = self.join2(self.pos, l).unwrap_or_default();
        self.pos += l;
        let mut a = vec![Ast::n("ident", vec![Ast::s(x)])];
        a.extend(self.get_sc()?);
        Ok(Ast::n("property", a))
    }
    fn check_filterv(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_progid(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        loop {
            let l = self.check_progid(i)?;
            if l == 0 { break; }
            i += l;
        }
        self.m[start].last_progid = i;
        if i < self.len() { let l = self.check_sc(i)?; if l != 0 { i += l; } }
        if i < self.len() { let l = self.check_important(i)?; if l != 0 { i += l; } }
        Ok(i - start)
    }
    fn get_filterv(&mut self) -> R<Ast> {
        let last = self.m[self.pos].last_progid;
        let mut a = vec![];
        while self.pos < last { a.push(self.get_progid()?); }
        let p = self.pos;
        if self.check_sc(p)? != 0 { a.extend(self.get_sc()?); }
        let p = self.pos;
        if p < self.len() && self.check_important(p)? != 0 { a.push(self.get_important()?); }
        Ok(Ast::n("filterv", a))
    }
    fn check_function_expression(&self, i: usize) -> R<usize> {
        let start = i;
        match self.toks.get(i) { Some(t) if t.value == "expression" => {}, _ => return Ok(NO) }
        let i = i + 1;
        match self.toks.get(i) { Some(t) if t.ty == T::LeftParenthesis => {}, _ => return Ok(NO) }
        Ok(match self.m[i].right { Some(r) => r - start + 1, None => NO })
    }
    fn get_function_expression(&mut self) -> R<Ast> {
        self.pos += 1;
        let r = self.m[self.pos].right.ok_or_else(|| self.throw_error())?;
        let e = self.join(self.pos + 1, r - 1);
        self.pos = r + 1;
        Ok(Ast::n("functionExpression", vec![Ast::s(e)]))
    }
    fn check_funktion(&mut self, i: usize) -> R<usize> {
        let start = i;
        let l = self.check_ident(i)?;
        if l == 0 { return Ok(NO); }
        let i = i + l;
        if i >= self.len() || self.toks[i].ty != T::LeftParenthesis { return Ok(NO); }
        Ok(match self.m[i].right { Some(r) => r - start + 1, None => NO })
    }
    fn get_funktion(&mut self) -> R<Ast> {
        let ident = self.get_ident();
        self.pos += 1;
        let not = ident.items().first().and_then(|a| a.as_str()) == Some("not");
        let body = if !not { self.get_function_body()? } else { self.get_not_function_body()? };
        Ok(Ast::n("funktion", vec![ident, body]))
    }
    fn get_function_body(&mut self) -> R<Ast> {
        let mut body = vec![];
        while self.ty(self.pos)? != T::RightParenthesis {
            let p = self.pos;
            if self.check_tset(p)? != 0 {
                body.extend(self.get_tset()?);
            } else if self.check_clazz(p)? != 0 {
                body.push(self.get_clazz());
            } else {
                return Err(self.throw_error());
            }
        }
        self.pos += 1;
        Ok(Ast::n("functionBody", body))
    }
    fn get_not_function_body(&mut self) -> R<Ast> {
        let mut body = vec![];
        while self.ty(self.pos)? != T::RightParenthesis {
            let p = self.pos;
            if self.check_simpleselector(p)? != 0 { body.push(self.get_simple_selector()?); }
            else { return Err(self.throw_error()); }
        }
        self.pos += 1;
        Ok(Ast::n("functionBody", body))
    }

    fn check_ident(&mut self, mut i: usize) -> R<usize> {
        if i >= self.len() { return Ok(NO); }
        let start = i;
        if self.toks[i].ty == T::LowLine { return Ok(self.check_ident_low_line(i)); }
        match self.toks[i].ty {
            T::HyphenMinus | T::Identifier | T::DollarSign | T::Asterisk => i += 1,
            _ => return Ok(NO),
        }
        let mut was_ident = self.toks[i - 1].ty == T::Identifier;
        while i < self.len() {
            let ty = self.toks[i].ty;
            if ty != T::HyphenMinus && ty != T::LowLine {
                if ty != T::Identifier && (ty != T::DecimalNumber || !was_ident) { break; }
                was_ident = true;
            }
            i += 1;
        }
        if !was_ident && self.toks[start].ty != T::Asterisk { return Ok(NO); }
        self.m[start].ident_last = Some(i - 1);
        Ok(i - start)
    }
    fn check_ident_low_line(&mut self, mut i: usize) -> usize {
        let start = i;
        i += 1;
        while i < self.len() {
            match self.toks[i].ty {
                T::HyphenMinus | T::DecimalNumber | T::LowLine | T::Identifier => i += 1,
                _ => break,
            }
        }
        self.m[start].ident_last = Some(i - 1);
        i - start
    }
    fn get_ident(&mut self) -> Ast {
        let last = self.m[self.pos].ident_last.unwrap_or(self.pos);
        let s = self.join(self.pos, last);
        self.pos = last + 1;
        Ast::n("ident", vec![Ast::s(s)])
    }
    fn check_important(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        if self.ty(i)? != T::ExclamationMark { return Ok(NO); }
        i += 1;
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        if self.val(i)? != "important" { return Ok(NO); }
        Ok(i - start + 1)
    }
    fn get_important(&mut self) -> R<Ast> {
        self.pos += 1;
        let sc = self.get_sc()?;
        self.pos += 1;
        Ok(Ast::n("important", sc))
    }
    fn check_namespace(&self, i: usize) -> R<usize> {
        Ok(if self.ty(i)? == T::VerticalLine { 1 } else { NO })
    }
    fn get_namespace(&mut self) -> Ast {
        self.pos += 1;
        Ast::n("namespace", vec![])
    }
    fn check_nth(&mut self, i: usize) -> R<usize> {
        let l = self.check_nth1(i);
        if l != 0 { return Ok(l); }
        Ok(if matches!(self.val(i)?, "even" | "odd") { 1 } else { NO })
    }
    fn check_nth1(&mut self, mut i: usize) -> usize {
        let start = i;
        while i < self.len() && (self.toks[i].ty == T::DecimalNumber || self.toks[i].value == "n") { i += 1; }
        if i != start {
            self.m[start].nth_last = Some(i - 1);
            return i - start;
        }
        NO
    }
    fn get_nth(&mut self) -> Ast {
        let p = self.pos;
        // JS tests `tokens[pos].nth_last` for truthiness: index 0 is falsy
        if let Some(last) = self.m[p].nth_last.filter(|l| *l != 0) {
            let s = self.join(p, last);
            self.pos = last + 1;
            return Ast::n("nth", vec![Ast::s(s)]);
        }
        let v = self.toks[p].value.clone();
        self.pos += 1;
        Ast::n("nth", vec![Ast::s(v)])
    }
    fn check_nthf(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let mut l = 0;
        if self.ty(i)? != T::Colon { return Ok(NO); }
        i += 1; l += 1;
        if self.val(i)? != "nth" { return Ok(NO); }
        i += 1;
        if self.val(i)? != "-" { return Ok(NO); }
        i += 1; l += 2;
        let v = |p: &Parser, k: usize| -> R<String> { Ok(p.val(k)?.to_string()) };
        if v(self, i)? == "child" {
            l += 1;
        } else if v(self, i)? + &v(self, i + 1)? + &v(self, i + 2)? == "last-child" {
            l += 3;
        } else if v(self, i)? + &v(self, i + 1)? + &v(self, i + 2)? == "of-type" {
            l += 3;
        } else if v(self, i)? + &v(self, i + 1)? + &v(self, i + 2)? + &v(self, i + 3)? + &v(self, i + 4)? == "last-of-type" {
            l += 5;
        } else {
            return Ok(NO);
        }
        self.m[start + 1].nthf_last = start + l - 1;
        Ok(l)
    }
    fn get_nthf(&mut self) -> String {
        self.pos += 1;
        let last = self.m[self.pos].nthf_last;
        let s = self.join(self.pos, last);
        self.pos = last + 1;
        s
    }
    fn check_nthselector(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_nthf(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        if self.ty(i)? != T::LeftParenthesis || self.m[i].right.is_none() { return Ok(NO); }
        let rp = self.m[i].right.unwrap();
        i += 1;
        while i < rp {
            let mut l = self.check_sc(i)?;
            if l == 0 { l = self.check_unary(i); }
            if l == 0 { l = self.check_nth(i)?; }
            if l == 0 { return Ok(NO); }
            i += l;
        }
        Ok(rp - start + 1)
    }
    fn get_nthselector(&mut self) -> R<Ast> {
        let nthf = Ast::n("ident", vec![Ast::s(self.get_nthf())]);
        let mut a = vec![nthf];
        self.pos += 1;
        while self.ty(self.pos)? != T::RightParenthesis {
            let p = self.pos;
            if self.check_sc(p)? != 0 { a.extend(self.get_sc()?); }
            else if self.check_unary(p) != 0 { a.push(self.get_unary()); }
            else if self.check_nth(p)? != 0 { a.push(self.get_nth()); }
            else { return Err(self.throw_error()); }
        }
        self.pos += 1;
        Ok(Ast::n("nthselector", a))
    }
    /// returns the number of tokens (1..3) or 0
    fn check_number(&mut self, i: usize) -> R<usize> {
        if i >= self.len() { return Ok(NO); }
        let ty = self.toks[i].ty;
        let t1 = self.ty_opt(i + 1);
        let t2 = self.ty_opt(i + 2);
        if ty == T::DecimalNumber && t1 != Some(T::FullStop) { return Ok(1); } // 10
        if ty == T::DecimalNumber && t1 == Some(T::FullStop) && t2 != Some(T::DecimalNumber) { return Ok(2); } // 10.
        if ty == T::FullStop {
            // JS: tokens[_i + 1].type unguarded
            if self.ty(i + 1)? == T::DecimalNumber { return Ok(2); } // .10
        }
        if ty == T::DecimalNumber && t1 == Some(T::FullStop) && t2 == Some(T::DecimalNumber) { return Ok(3); } // 10.10
        Ok(NO)
    }
    fn get_number(&mut self) -> Ast {
        // number_l is memoized by check_number; recompute (pure)
        let l = self.check_number(self.pos).unwrap_or(0);
        let s = self.join(self.pos, self.pos + l - 1);
        self.pos += l;
        Ast::n("number", vec![Ast::s(s)])
    }
    fn check_operator(&self, i: usize) -> usize {
        if i < self.len() && matches!(self.toks[i].ty, T::Solidus | T::Comma | T::Colon | T::EqualsSign) { 1 } else { NO }
    }
    fn get_operator(&mut self) -> Ast {
        let v = self.toks[self.pos].value.clone();
        self.pos += 1;
        Ast::n("operator", vec![Ast::s(v)])
    }
    fn check_percentage(&mut self, i: usize) -> R<usize> {
        let x = self.check_number(i)?;
        if x == 0 || i + x >= self.len() { return Ok(NO); }
        Ok(if self.toks[i + x].ty == T::PercentSign { x + 1 } else { NO })
    }
    fn get_percentage(&mut self) -> R<Ast> {
        let n = self.get_number();
        self.pos += 1;
        Ok(Ast::n("percentage", vec![n]))
    }
    fn check_progid(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        if self.join2(i, 6).as_deref() == Some("progid:DXImageTransform.Microsoft.") { i += 6; } else { return Ok(NO); }
        let l = self.check_ident(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        if self.ty(i)? == T::LeftParenthesis {
            let r = self.m[i].right.ok_or_else(|| self.throw_error())?;
            self.m[start].progid_end = r;
            i = r + 1;
        } else { return Ok(NO); }
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        Ok(i - start)
    }
    fn get_progid(&mut self) -> R<Ast> {
        let end = self.m[self.pos].progid_end;
        let mut a = self.get_sc()?;
        let x = self.join(self.pos, end);
        self.pos = end + 1;
        a.push(Ast::n("raw", vec![Ast::s(x)]));
        a.extend(self.get_sc()?);
        Ok(Ast::n("progid", a))
    }
    fn check_property(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_ident(i)?; if l != 0 { i += l; } else { return Ok(NO); }
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        Ok(i - start)
    }
    fn get_property(&mut self) -> R<Ast> {
        let mut a = vec![self.get_ident()];
        a.extend(self.get_sc()?);
        Ok(Ast::n("property", a))
    }
    fn check_pseudo(&mut self, i: usize) -> R<usize> {
        let l = self.check_pseudoe(i)?;
        if l != 0 { return Ok(l); }
        self.check_pseudoc(i)
    }
    fn get_pseudo(&mut self) -> R<Ast> {
        let p = self.pos;
        if self.check_pseudoe(p)? != 0 { return Ok(self.get_pseudoe()); }
        if self.check_pseudoc(p)? != 0 { return self.get_pseudoc(); }
        Err(self.throw_error())
    }
    fn check_pseudoe(&mut self, i: usize) -> R<usize> {
        if self.ty(i)? != T::Colon { return Ok(NO); }
        if self.ty(i + 1)? != T::Colon { return Ok(NO); }
        let l = self.check_ident(i + 2)?;
        Ok(if l != 0 { l + 2 } else { NO })
    }
    fn get_pseudoe(&mut self) -> Ast {
        self.pos += 2;
        Ast::n("pseudoe", vec![self.get_ident()])
    }
    fn check_pseudoc(&mut self, i: usize) -> R<usize> {
        if self.ty(i)? != T::Colon { return Ok(NO); }
        let mut l = self.check_funktion(i + 1)?;
        if l == 0 { l = self.check_ident(i + 1)?; }
        Ok(if l != 0 { l + 1 } else { NO })
    }
    fn get_pseudoc(&mut self) -> R<Ast> {
        self.pos += 1;
        let p = self.pos;
        let x = if self.check_funktion(p)? != 0 { self.get_funktion()? } else { self.get_ident() };
        Ok(Ast::n("pseudoc", vec![x]))
    }
    fn check_ruleset(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        loop {
            let l = self.check_selector(i)?;
            if l == 0 { break; }
            i += l;
        }
        let l = self.check_block(i);
        if l != 0 { i += l; } else { return Ok(NO); }
        Ok(i - start)
    }
    fn get_ruleset(&mut self) -> R<Ast> {
        let mut a = vec![];
        while self.check_block(self.pos) == 0 {
            if self.pos >= self.len() { return Err(self.throw_error()); }
            a.push(self.get_selector()?);
        }
        a.push(self.get_block()?);
        Ok(Ast::n("ruleset", a))
    }
    fn check_s(&self, i: usize) -> R<usize> {
        self.t(i)?;
        if self.m[i].ws {
            // only the first token of a whitespace run has ws_last (else NaN)
            return Ok(match self.m[i].ws_last { Some(l) => l - i + 1, None => NO });
        }
        Ok(NO)
    }
    fn get_s(&mut self) -> Ast {
        let last = self.m[self.pos].ws_last.unwrap_or(self.pos);
        let s = self.join(self.pos, last);
        self.pos = last + 1;
        Ast::n("s", vec![Ast::s(s)])
    }
    fn check_sc(&self, mut i: usize) -> R<usize> {
        let mut lsc = 0;
        while i < self.len() {
            let mut l = self.check_s(i)?;
            if l == 0 { l = self.check_comment(i)?; }
            if l == 0 { break; }
            i += l;
            lsc += l;
        }
        Ok(lsc)
    }
    fn get_sc(&mut self) -> R<Vec<Ast>> {
        let mut sc = vec![];
        while self.pos < self.len() {
            let p = self.pos;
            if self.check_s(p)? != 0 { sc.push(self.get_s()); }
            else if self.check_comment(p)? != 0 { sc.push(self.get_comment()); }
            else { break; }
        }
        Ok(sc)
    }
    fn check_selector(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        if i < self.len() {
            loop {
                let mut l = self.check_simpleselector(i)?;
                if l == 0 { l = self.check_delim(i); }
                if l == 0 { break; }
                i += l;
            }
            // JS: tokens[start].selector_end = _i - 1 (always set)
            self.m[start].selector_end = Some(i.wrapping_sub(1));
            return Ok(i - start);
        }
        Ok(NO)
    }
    fn get_selector(&mut self) -> R<Ast> {
        let end = self.m[self.pos].selector_end.ok_or_else(|| self.throw_error())?;
        let mut a = vec![];
        while self.pos <= end && end != usize::MAX {
            let p = self.pos;
            if self.check_delim(p) != 0 { a.push(self.get_delim()); }
            else { a.push(self.get_simple_selector()?); }
        }
        Ok(Ast::n("selector", a))
    }
    fn check_shash(&mut self, i: usize) -> R<usize> {
        if self.ty(i)? != T::NumberSign { return Ok(NO); }
        let l = self.check_nm_name(i + 1)?;
        Ok(if l != 0 { l + 1 } else { NO })
    }
    fn get_shash(&mut self) -> Ast {
        self.pos += 1;
        let s = self.get_nm_name();
        Ast::n("shash", vec![Ast::s(s)])
    }
    fn check_simpleselector(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        while i < self.len() {
            let l = self.check_simple_selector_(i)?;
            if l == 0 { break; }
            i += l;
        }
        Ok(i - start)
    }
    fn check_simple_selector_(&mut self, i: usize) -> R<usize> {
        let mut l = self.check_nthselector(i)?;
        if l == 0 { l = self.check_combinator(i)?; }
        if l == 0 { l = self.check_attrib(i)?; }
        if l == 0 { l = self.check_pseudo(i)?; }
        if l == 0 { l = self.check_clazz(i)?; }
        if l == 0 { l = self.check_shash(i)?; }
        if l == 0 { l = self.check_any(i)?; }
        if l == 0 { l = self.check_sc(i)?; }
        if l == 0 { l = self.check_namespace(i)?; }
        Ok(l)
    }
    fn get_simple_selector(&mut self) -> R<Ast> {
        let mut a = vec![];
        while self.pos < self.len() && self.check_simple_selector_(self.pos)? != 0 {
            let p = self.pos;
            if self.check_nthselector(p)? != 0 { a.push(self.get_nthselector()?); }
            else if self.check_combinator(p)? != 0 { a.push(self.get_combinator()); }
            else if self.check_attrib(p)? != 0 { a.push(self.get_attrib()?); }
            else if self.check_pseudo(p)? != 0 { a.push(self.get_pseudo()?); }
            else if self.check_clazz(p)? != 0 { a.push(self.get_clazz()); }
            else if self.check_shash(p)? != 0 { a.push(self.get_shash()); }
            else if self.check_any(p)? != 0 { a.push(self.get_any()?); }
            else if self.check_sc(p)? != 0 { a.extend(self.get_sc()?); }
            else if self.check_namespace(p)? != 0 { a.push(self.get_namespace()); }
        }
        Ok(Ast::n("simpleselector", a))
    }
    fn check_string(&self, i: usize) -> usize {
        if i < self.len() && matches!(self.toks[i].ty, T::StringSQ | T::StringDQ) { 1 } else { NO }
    }
    fn get_string(&mut self) -> Ast {
        let v = self.toks[self.pos].value.clone();
        self.pos += 1;
        Ast::n("string", vec![Ast::s(v)])
    }
    fn get_stylesheet(&mut self) -> R<Ast> {
        // checkStylesheet runs first in JS (it marks tokens and throws on errors)
        let mut i = 0;
        while i < self.len() {
            let l = self.check_sc(i)?;
            if l != 0 { i += l; continue; }
            let mut l = self.check_atrule(i)?;
            if l == 0 { l = self.check_ruleset(i)?; }
            if l == 0 { l = self.check_unknown(i); }
            if l == 0 { return Err(self.throw_error()); }
            i += l;
        }
        let mut a = vec![];
        while self.pos < self.len() {
            let p = self.pos;
            if self.check_sc(p)? != 0 { a.extend(self.get_sc()?); }
            else if self.check_ruleset(p)? != 0 { a.push(self.get_ruleset()?); }
            else if self.check_atrule(p)? != 0 { a.push(self.get_atrule()?); }
            else if self.check_unknown(p) != 0 { a.push(self.get_unknown()); }
            else { return Err(self.throw_error()); }
        }
        Ok(Ast::n("stylesheet", a))
    }
    fn check_tset(&mut self, i: usize) -> R<usize> {
        let mut l = self.check_vhash(i)?;
        if l == 0 { l = self.check_any(i)?; }
        if l == 0 { l = self.check_sc(i)?; }
        if l == 0 { l = self.check_operator(i); }
        Ok(l)
    }
    fn get_tset(&mut self) -> R<Vec<Ast>> {
        let p = self.pos;
        if self.check_vhash(p)? != 0 { return Ok(vec![self.get_vhash()]); }
        if self.check_any(p)? != 0 { return Ok(vec![self.get_any()?]); }
        if self.check_sc(p)? != 0 { return self.get_sc(); }
        if self.check_operator(p) != 0 { return Ok(vec![self.get_operator()]); }
        Ok(vec![])
    }
    fn check_tsets(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        loop {
            // tokens[_i] past the end: checkVhash guards `_i >= tokens.length`
            if i >= self.len() { break; }
            let l = self.check_tset(i)?;
            if l == 0 { break; }
            i += l;
        }
        Ok(i - start)
    }
    fn get_tsets(&mut self) -> R<Vec<Ast>> {
        let mut a = vec![];
        loop {
            if self.pos >= self.len() { break; }
            let x = self.get_tset()?;
            if x.is_empty() { break; }
            a.extend(x);
        }
        Ok(a)
    }
    fn check_unary(&self, i: usize) -> usize {
        if i < self.len() && matches!(self.toks[i].ty, T::HyphenMinus | T::PlusSign) { 1 } else { NO }
    }
    fn get_unary(&mut self) -> Ast {
        let v = self.toks[self.pos].value.clone();
        self.pos += 1;
        Ast::n("unary", vec![Ast::s(v)])
    }
    fn check_unknown(&self, i: usize) -> usize {
        if i < self.len() && self.toks[i].ty == T::CommentSL { 1 } else { NO }
    }
    fn get_unknown(&mut self) -> Ast {
        let v = self.toks[self.pos].value.clone();
        self.pos += 1;
        Ast::n("unknown", vec![Ast::s(v)])
    }
    fn check_uri(&self, i: usize) -> R<usize> {
        let start = i;
        if i < self.len() && self.toks[i].value != "url" { return Ok(NO); }
        let i = i + 1;
        match self.toks.get(i) { Some(t) if t.ty == T::LeftParenthesis => {}, _ => return Ok(NO) }
        Ok(match self.m[i].right { Some(r) => r - start + 1, None => NO })
    }
    fn get_uri(&mut self) -> R<Ast> {
        self.pos += 2;
        let p = self.pos;
        if self.check_uri1(p)? != 0 {
            let mut a = self.get_sc()?;
            a.push(self.get_string());
            a.extend(self.get_sc()?);
            self.pos += 1;
            return Ok(Ast::n("uri", a));
        }
        let mut a = self.get_sc()?;
        // checkExcluding
        let start = self.pos;
        let mut k = start;
        while k < self.len() {
            let ty = self.toks[k].ty;
            k += 1;
            if matches!(ty, T::Space | T::Tab | T::Newline | T::LeftParenthesis | T::RightParenthesis) { break; }
        }
        let l = (k as isize - start as isize - 2) as isize;
        let raw = self.join(self.pos, (self.pos as isize + l) as usize);
        a.push(Ast::n("raw", vec![Ast::s(raw)]));
        self.pos = (self.pos as isize + l + 1) as usize;
        a.extend(self.get_sc()?);
        self.pos += 1;
        Ok(Ast::n("uri", a))
    }
    fn check_uri1(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        if !matches!(self.ty(i)?, T::StringDQ | T::StringSQ) { return Ok(NO); }
        i += 1;
        let l = self.check_sc(i)?; if l != 0 { i += l; }
        Ok(i - start)
    }
    fn check_value(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        while i < self.len() {
            let l = self.check_value_(i)?;
            if l == 0 { break; }
            i += l;
        }
        Ok(i - start)
    }
    fn check_value_(&mut self, i: usize) -> R<usize> {
        let mut l = self.check_sc(i)?;
        if l == 0 { l = self.check_vhash(i)?; }
        if l == 0 { l = self.check_any(i)?; }
        if l == 0 { l = self.check_block(i); }
        if l == 0 { l = self.check_atkeyword(i)?; }
        if l == 0 { l = self.check_operator(i); }
        if l == 0 { l = self.check_important(i)?; }
        Ok(l)
    }
    fn get_value(&mut self) -> R<Ast> {
        let mut a = vec![];
        while self.pos < self.len() && self.check_value_(self.pos)? != 0 {
            let p = self.pos;
            if self.check_sc(p)? != 0 { a.extend(self.get_sc()?); }
            else if self.check_vhash(p)? != 0 { a.push(self.get_vhash()); }
            else if self.check_any(p)? != 0 { a.push(self.get_any()?); }
            else if self.check_block(p) != 0 { a.push(self.get_block()?); }
            else if self.check_atkeyword(p)? != 0 { a.push(self.get_atkeyword()); }
            else if self.check_operator(p) != 0 { a.push(self.get_operator()); }
            else if self.check_important(p)? != 0 { a.push(self.get_important()?); }
        }
        Ok(Ast::n("value", a))
    }
    fn check_vhash(&mut self, i: usize) -> R<usize> {
        if i >= self.len() || self.toks[i].ty != T::NumberSign { return Ok(NO); }
        let l = self.check_nm_name2(i + 1)?;
        Ok(if l != 0 { l + 1 } else { NO })
    }
    fn get_vhash(&mut self) -> Ast {
        self.pos += 1;
        Ast::n("vhash", vec![Ast::s(self.get_nm_name2())])
    }
    fn check_nm_name(&mut self, mut i: usize) -> R<usize> {
        let start = i;
        match self.ty(i)? {
            T::HyphenMinus | T::LowLine | T::Identifier | T::DecimalNumber => i += 1,
            _ => return Ok(NO),
        }
        while i < self.len() && matches!(self.toks[i].ty, T::HyphenMinus | T::LowLine | T::Identifier | T::DecimalNumber) { i += 1; }
        self.m[start].nm_name_last = Some(i - 1);
        Ok(i - start)
    }
    fn get_nm_name(&mut self) -> String {
        let last = self.m[self.pos].nm_name_last.unwrap_or(self.pos);
        let s = self.join(self.pos, last);
        self.pos = last + 1;
        s
    }
    fn check_nm_name2(&self, i: usize) -> R<usize> {
        let ty = self.ty(i)?;
        if ty == T::Identifier { return Ok(1); }
        if ty != T::DecimalNumber { return Ok(NO); }
        Ok(match self.ty_opt(i + 1) { Some(T::Identifier) => 2, _ => 1 })
    }
    fn get_nm_name2(&mut self) -> String {
        let mut s = self.toks[self.pos].value.clone();
        let was_num = self.toks[self.pos].ty == T::DecimalNumber;
        self.pos += 1;
        if was_num && self.pos < self.len() && self.toks[self.pos].ty == T::Identifier {
            s += &self.toks[self.pos].value;
            self.pos += 1;
        }
        s
    }
}


/// `gonzales.srcToCSSP(src)`; `None` for empty input (the JS returns
/// `undefined`, which Atem-CPS turns into an empty stylesheet).
pub fn parse_stylesheet(src: &str) -> Result<Option<Ast>, ParseError> {
    if src.is_empty() { return Ok(None); }
    let mut p = Parser::new(src);
    p.get_stylesheet().map(Some)
}

// ------------------------------------------------------------------ translator

/// `gonzales.csspToSrc(tree)`
pub fn cssp_to_src(t: &Ast) -> String {
    let (ty, items) = match t {
        Ast::Str(s) => return s.clone(),
        Ast::Node(ty, items) => (*ty, items),
    };
    let first = || items.first().map(cssp_to_src).unwrap_or_default();
    let composite = |from: usize| -> String { items.iter().skip(from).map(cssp_to_src).collect() };
    let simple = || items.first().and_then(|a| a.as_str()).unwrap_or("").to_string();
    match ty {
        "cdo" => "cdo".into(),
        "cdc" => "cdc".into(),
        "decldelim" => ";".into(),
        "namespace" => "|".into(),
        "delim" => ",".into(),
        "unary" | "nth" | "combinator" | "ident" | "number" | "s" | "string" | "attrselector"
        | "operator" | "raw" | "unknown" => simple(),
        "simpleselector" | "dimension" | "selector" | "property" | "value" | "filterv" | "progid"
        | "ruleset" | "atruleb" | "atrulerq" | "atrulers" | "stylesheet" => composite(0),
        "percentage" => first() + "%",
        "comment" => format!("/*{}*/", simple()),
        "clazz" => format!(".{}", first()),
        "atkeyword" => format!("@{}", first()),
        "shash" | "vhash" => format!("#{}", simple()),
        "attrib" => format!("[{}]", composite(0)),
        "important" => format!("!{}important", composite(0)),
        "nthselector" => {
            let name = items.first().map(|a| a.items().first().and_then(|s| s.as_str()).unwrap_or("").to_string()).unwrap_or_default();
            format!(":{}({})", name, composite(1))
        }
        "funktion" => {
            let name = items.first().map(|a| a.items().first().and_then(|s| s.as_str()).unwrap_or("").to_string()).unwrap_or_default();
            format!("{}({})", name, items.get(1).map(|b| b.items().iter().map(cssp_to_src).collect::<String>()).unwrap_or_default())
        }
        "declaration" | "filter" => format!("{}:{}", first(), items.get(1).map(cssp_to_src).unwrap_or_default()),
        "block" => format!("{{{}}}", composite(0)),
        "braces" => format!("{}{}{}", simple(), composite(2), items.get(1).and_then(|a| a.as_str()).unwrap_or("")),
        "atrules" => format!("{};", composite(0)),
        "atruler" => format!("{}{}{{{}}}", first(), items.get(1).map(cssp_to_src).unwrap_or_default(),
                             items.get(2).map(cssp_to_src).unwrap_or_default()),
        "pseudoe" => format!("::{}", first()),
        "pseudoc" => format!(":{}", first()),
        "uri" => format!("url({})", composite(0)),
        "functionExpression" => format!("expression({})", simple()),
        "functionBody" => composite(0),
        _ => String::new(),
    }
}

/// Parse a selector list the way `parseSelectorList.fromString` does:
/// `srcToCSSP(string + '{}')`.
pub fn parse_selector_source(src: &str) -> Result<Option<Ast>, ParseError> {
    parse_stylesheet(&format!("{src}{{}}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn roundtrip_simple() {
        let ast = parse_stylesheet("glyph { width: 1 + 2; }").unwrap().unwrap();
        assert_eq!(cssp_to_src(&ast), "glyph { width: 1 + 2; }");
    }
}
