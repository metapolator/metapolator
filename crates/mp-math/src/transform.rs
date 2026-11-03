//! Affine transformation `[xx, xy, yx, yy, dx, dy]`. Port of
//! `Atem-Math-Tools/transform.js` (itself a port of fontTools.misc.transform).

use crate::fp;
use std::fmt;

const EPSILON: f64 = 1e-15;
const ONE_EPSILON: f64 = 1.0 - EPSILON;
const MINUS_ONE_EPSILON: f64 = -1.0 + EPSILON;

fn norm_sin_cos(v: f64) -> f64 {
    if v.abs() < EPSILON {
        0.0
    } else if v > ONE_EPSILON {
        1.0
    } else if v < MINUS_ONE_EPSILON {
        -1.0
    } else {
        v
    }
}

/// `==` is the JS `cmp`: component-wise `===` (so `NaN != NaN`, `0 == -0`).
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Transform(pub [f64; 6]);

pub const IDENTITY: Transform = Transform([1.0, 0.0, 0.0, 1.0, 0.0, 0.0]);

impl Default for Transform {
    fn default() -> Self {
        IDENTITY
    }
}

impl Transform {
    pub const fn new(affine: [f64; 6]) -> Self {
        Transform(affine)
    }

    /// `Offset(x, y)`
    pub fn offset(x: f64, y: f64) -> Self {
        Transform([1.0, 0.0, 0.0, 1.0, x, y])
    }

    /// `Scale(x, y)`; `y = None` means `y = x`.
    pub fn scaling(x: f64, y: Option<f64>) -> Self {
        let y = y.unwrap_or(x);
        Transform([x, 0.0, 0.0, y, 0.0, 0.0])
    }

    pub fn transform_point(&self, pt: [f64; 2]) -> [f64; 2] {
        let [xx, xy, yx, yy, dx, dy] = self.0;
        let [x, y] = pt;
        [xx * x + yx * y + dx, xy * x + yy * y + dy]
    }

    pub fn translate(&self, x: f64, y: f64) -> Self {
        self.transform(&Transform([1.0, 0.0, 0.0, 1.0, x, y]))
    }

    /// `scale(x, y)`; `y = None` means `y = x`.
    pub fn scale(&self, x: f64, y: Option<f64>) -> Self {
        let y = y.unwrap_or(x);
        self.transform(&Transform([x, 0.0, 0.0, y, 0.0, 0.0]))
    }

    pub fn rotate(&self, angle: f64) -> Self {
        let c = norm_sin_cos(fp::cos(angle));
        let s = norm_sin_cos(fp::sin(angle));
        self.transform(&Transform([c, s, -s, c, 0.0, 0.0]))
    }

    pub fn skew(&self, x: f64, y: f64) -> Self {
        self.transform(&Transform([1.0, fp::tan(y), fp::tan(x), 1.0, 0.0, 0.0]))
    }

    /// `this.transform(other)`: apply `other` first, then `self`.
    pub fn transform(&self, other: &Transform) -> Self {
        let [xx1, xy1, yx1, yy1, dx1, dy1] = other.0;
        let [xx2, xy2, yx2, yy2, dx2, dy2] = self.0;
        Transform([
            xx1 * xx2 + xy1 * yx2,
            xx1 * xy2 + xy1 * yy2,
            yx1 * xx2 + yy1 * yx2,
            yx1 * xy2 + yy1 * yy2,
            xx2 * dx1 + yx2 * dy1 + dx2,
            xy2 * dx1 + yy2 * dy1 + dy2,
        ])
    }

    /// `this.reverseTransform(other)`: apply `self` first, then `other`.
    pub fn reverse_transform(&self, other: &Transform) -> Self {
        other.transform(self)
    }

    pub fn inverse(&self) -> Self {
        if *self == IDENTITY {
            return *self;
        }
        let [xx_, xy_, yx_, yy_, dx_, dy_] = self.0;
        let det = xx_ * yy_ - yx_ * xy_;
        let xx = yy_ / det;
        let xy = -xy_ / det;
        let yx = -yx_ / det;
        let yy = xx_ / det;
        let dx = -xx * dx_ - yx * dy_;
        let dy = -xy * dx_ - yy * dy_;
        Transform([xx, xy, yx, yy, dx, dy])
    }

    /// `toPS`: `[xx xy yx yy dx dy]`
    pub fn to_ps(&self) -> String {
        format!("[{}]", self.join(" "))
    }

    fn join(&self, sep: &str) -> String {
        self.0.iter().map(|v| crate::js_num(*v)).collect::<Vec<_>>().join(sep)
    }
}

impl fmt::Display for Transform {
    /// `toString`: the six numbers joined by spaces.
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.join(" "))
    }
}
