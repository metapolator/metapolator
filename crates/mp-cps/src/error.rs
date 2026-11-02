//! Error type shared by CPS parsing and evaluation.
//!
//! The JS engine distinguishes many error classes; for the port only a few
//! distinctions are semantically relevant: a `Recursion` error is never cached
//! by the cascade (StyleDict), every other evaluation error is cached and
//! makes `get(key, default)` return the default.

use std::fmt;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ErrorKind {
    /// KeyError: missing property / whitelist / array index
    Key,
    /// CPSRecursionKeyError: a property (indirectly) depends on itself
    Recursion,
    /// PropertyLanguageError: parse or runtime error of a CPS formula
    PropertyLanguage,
    /// ValueError: a validator rejected a value
    Value,
    /// CPSError / CPSParserError: stylesheet or selector problems
    Cps,
    /// a JS TypeError (e.g. reading a key of `null`)
    Type,
}

#[derive(Clone, Debug, PartialEq)]
pub struct CpsError {
    pub kind: ErrorKind,
    pub message: String,
}

impl CpsError {
    pub fn new(kind: ErrorKind, message: impl Into<String>) -> Self {
        CpsError { kind, message: message.into() }
    }
    pub fn key(m: impl Into<String>) -> Self { Self::new(ErrorKind::Key, m) }
    pub fn pl(m: impl Into<String>) -> Self { Self::new(ErrorKind::PropertyLanguage, m) }
    pub fn value(m: impl Into<String>) -> Self { Self::new(ErrorKind::Value, m) }
    pub fn cps(m: impl Into<String>) -> Self { Self::new(ErrorKind::Cps, m) }
    pub fn type_error(m: impl Into<String>) -> Self { Self::new(ErrorKind::Type, m) }
    pub fn is_recursion(&self) -> bool { self.kind == ErrorKind::Recursion }
}

impl fmt::Display for CpsError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}Error: {}", self.kind, self.message)
    }
}

impl std::error::Error for CpsError {}

pub type Result<T> = std::result::Result<T, CpsError>;
