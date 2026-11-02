//! Transcendental functions used by the port: one facade, so the backend is
//! chosen in exactly one place (see notes/rust-port/PLAN.md, "Floating point").
//! `+ - * / sqrt` are IEEE-754 exact everywhere and need no facade.

pub fn sin(x: f64) -> f64 { libm::sin(x) }
pub fn cos(x: f64) -> f64 { libm::cos(x) }
pub fn tan(x: f64) -> f64 { libm::tan(x) }
pub fn atan2(y: f64, x: f64) -> f64 { libm::atan2(y, x) }
pub fn exp(x: f64) -> f64 { libm::exp(x) }
pub fn ln(x: f64) -> f64 { libm::log(x) }
pub fn pow(x: f64, y: f64) -> f64 { libm::pow(x, y) }
