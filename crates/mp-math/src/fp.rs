//! Transcendental functions used by the port: one facade, so the backend is
//! chosen in exactly one place (see notes/rust-port/fp-v8-parity.md).
//! They are exact ports of V8's implementations (`v8.rs`), so results match
//! the JS reference bit for bit, natively and on wasm32.
//! `+ - * / sqrt` are IEEE-754 exact everywhere and need no facade.

use crate::v8;

pub fn sin(x: f64) -> f64 { v8::sin(x) }
pub fn cos(x: f64) -> f64 { v8::cos(x) }
pub fn tan(x: f64) -> f64 { v8::tan(x) }
pub fn atan2(y: f64, x: f64) -> f64 { v8::atan2(y, x) }
pub fn exp(x: f64) -> f64 { v8::exp(x) }
pub fn ln(x: f64) -> f64 { v8::log(x) }
pub fn pow(x: f64, y: f64) -> f64 { v8::pow(x, y) }
