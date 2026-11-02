//! CPS (Cascading Parameter Sheets) and the Property Language.
//!
//! Port of Atem-CPS, Atem-CPS-whitelisting, Atem-Property-Language and the
//! gonzales CSS parser, pinned in tools/js-reference/deps.lock. Parity with
//! the JS is tested against probe outputs in `tests/data/` (see
//! `tests/README.md`).

pub mod document;
pub mod engine;
pub mod error;
pub mod gonzales;
pub mod lang;
pub mod rules;
pub mod selector;
pub mod value;

pub use document::{Collection, CollectionItem, Property, PropertyDict};
pub use engine::{Engine, Model};
pub use error::{CpsError, ErrorKind, Result};
pub use rules::{GenArg, RuleController, SourceLoader};
pub use selector::SelectorList;
pub use value::{NodeId, Value};
