//! `Vector`: a 2D point/complex number. Port of `complex/Complex.js` (graphicore)
//! and `Atem-Math-Tools/Vector.js`.
//!
//! Arithmetic is written in the same operation order as the JS so results are
//! bit-identical (f64 `+ - * /` are IEEE-exact; transcendental functions go
//! through [`crate::fp`]).

use crate::fp;
use std::fmt;
use std::ops::{Add, Div, Mul, Neg, Sub};

#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Vector {
    /// `real` in Complex.js
    pub x: f64,
    /// `imag` in Complex.js
    pub y: f64,
}

impl Vector {
    pub const ZERO: Vector = Vector { x: 0.0, y: 0.0 };
    pub const ONE: Vector = Vector { x: 1.0, y: 0.0 };
    pub const I: Vector = Vector { x: 0.0, y: 1.0 };

    pub const fn new(x: f64, y: f64) -> Self {
        Vector { x, y }
    }

    /// `Complex.fromPolar(r, phi)`
    pub fn from_polar(r: f64, phi: f64) -> Self {
        Vector::new(r * fp::cos(phi), r * fp::sin(phi))
    }

    /// `magnitude()` / `abs()` / CPS `len`. Deliberately not `hypot`: the JS
    /// computes `Math.sqrt(a * a + b * b)`.
    pub fn magnitude(self) -> f64 {
        let (a, b) = (self.x, self.y);
        (a * a + b * b).sqrt()
    }

    /// `angle()` / `arg()` / CPS `rad`
    pub fn angle(self) -> f64 {
        fp::atan2(self.y, self.x)
    }

    pub fn conjugate(self) -> Self {
        Vector::new(self.x, -self.y)
    }

    /// `equals`, which is `==` on both components (so `NaN != NaN`).
    pub fn equals(self, other: Vector) -> bool {
        self.x == other.x && self.y == other.y
    }
}

impl Add for Vector {
    type Output = Vector;
    fn add(self, z: Vector) -> Vector {
        Vector::new(self.x + z.x, self.y + z.y)
    }
}

impl Sub for Vector {
    type Output = Vector;
    fn sub(self, z: Vector) -> Vector {
        Vector::new(self.x - z.x, self.y - z.y)
    }
}

impl Neg for Vector {
    type Output = Vector;
    fn neg(self) -> Vector {
        Vector::new(-self.x, -self.y)
    }
}

/// Complex multiplication, `multiply` in Complex.js:
/// `(z.real * a - z.imag * b, b * z.real + z.imag * a)`.
impl Mul for Vector {
    type Output = Vector;
    fn mul(self, z: Vector) -> Vector {
        let (a, b) = (self.x, self.y);
        Vector::new(z.x * a - z.y * b, b * z.x + z.y * a)
    }
}

/// Multiplication by a real number. In JS `Complex.from(n)` makes `n + 0i`
/// and then does a full complex multiply; this reproduces that exactly
/// (including the `- 0 * b` terms, which matter for signed zeros and NaN).
impl Mul<f64> for Vector {
    type Output = Vector;
    fn mul(self, n: f64) -> Vector {
        self * Vector::new(n, 0.0)
    }
}

/// Complex division, `divide` in Complex.js. Note the divisor uses
/// `Math.pow(.., 2)`, which we reproduce via [`fp::pow`].
impl Div for Vector {
    type Output = Vector;
    fn div(self, z: Vector) -> Vector {
        let divident = fp::pow(z.x, 2.0) + fp::pow(z.y, 2.0);
        let (a, b) = (self.x, self.y);
        Vector::new((a * z.x + b * z.y) / divident, (b * z.x - a * z.y) / divident)
    }
}

impl Div<f64> for Vector {
    type Output = Vector;
    fn div(self, n: f64) -> Vector {
        self / Vector::new(n, 0.0)
    }
}

impl From<[f64; 2]> for Vector {
    fn from(a: [f64; 2]) -> Self {
        Vector::new(a[0], a[1])
    }
}

impl From<Vector> for [f64; 2] {
    fn from(v: Vector) -> Self {
        [v.x, v.y]
    }
}

impl fmt::Display for Vector {
    /// `<Vector x,y>` as in Vector.js `toString`.
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "<Vector {},{}>", crate::js_num(self.x), crate::js_num(self.y))
    }
}
