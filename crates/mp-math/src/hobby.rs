//! Hobby splines (MetaFont tension/direction ↔ cubic control points).
//! Port of `Atem-Math-Tools/hobby.js`.
//!
//! JS `undefined` (argument not given / result not computed) is `None`; the
//! public "both" variants turn a missing result into `NaN` like the JS does.
//! Directions are radians; the deprecated Vector-as-direction form is not
//! ported.

use crate::fp;
use crate::{normalize_angle, Vector};

/// Hobby's velocity function.
pub fn hobby(theta: f64, phi: f64) -> f64 {
    let st = fp::sin(theta);
    let ct = fp::cos(theta);
    let sp = fp::sin(phi);
    let cp = fp::cos(phi);
    // same operation order as the JS expression
    (2.0 + 2f64.sqrt() * (st - 1.0 / 16.0 * sp) * (sp - 1.0 / 16.0 * st) * (ct - cp))
        / (3.0 * (1.0 + 0.5 * (5f64.sqrt() - 1.0) * ct + 0.5 * (3.0 - 5f64.sqrt()) * cp))
}

fn tension2magnitude_opt(
    z0: Vector,
    dir0: f64,
    alpha: Option<f64>,
    beta: Option<f64>,
    dir1: f64,
    z1: Vector,
) -> (Option<f64>, Option<f64>) {
    let diff_z1z0 = z1 - z0;
    let angle_z1z0 = diff_z1z0.angle();
    let magnitude_z1z0 = diff_z1z0.magnitude();
    let theta = normalize_angle(dir0 - angle_z1z0);
    let phi = normalize_angle(angle_z1z0 - dir1);

    let mag = |t: f64, a: f64, b: f64| {
        if magnitude_z1z0 == 0.0 && (t == 0.0 || t == f64::INFINITY) {
            if t == 0.0 { f64::INFINITY } else { 0.0 }
        } else {
            magnitude_z1z0 * hobby(a, b) / t
        }
    };
    (alpha.map(|a| mag(a, theta, phi)), beta.map(|b| mag(b, phi, theta)))
}

/// Distances from the on-curve points to their control points.
pub fn tension2magnitude(z0: Vector, dir0: f64, alpha: f64, beta: f64, dir1: f64, z1: Vector) -> [f64; 2] {
    let (u, v) = tension2magnitude_opt(z0, dir0, Some(alpha), Some(beta), dir1, z1);
    [u.unwrap_or(f64::NAN), v.unwrap_or(f64::NAN)]
}

pub fn tension2magnitude_out(z0: Vector, dir0: f64, alpha: f64, dir1: f64, z1: Vector) -> f64 {
    tension2magnitude_opt(z0, dir0, Some(alpha), None, dir1, z1).0.unwrap()
}

pub fn tension2magnitude_in(z0: Vector, dir0: f64, beta: f64, dir1: f64, z1: Vector) -> f64 {
    tension2magnitude_opt(z0, dir0, None, Some(beta), dir1, z1).1.unwrap()
}

fn tension2control_opt(
    z0: Vector,
    dir0: f64,
    alpha: Option<f64>,
    beta: Option<f64>,
    dir1: f64,
    z1: Vector,
) -> (Option<Vector>, Option<Vector>) {
    let (u, v) = tension2magnitude_opt(z0, dir0, alpha, beta, dir1, z1);
    (
        u.map(|u| Vector::from_polar(u, dir0) + z0),
        v.map(|v| z1 - Vector::from_polar(v, dir1)),
    )
}

/// Absolute positions of the two control points (formerly `hobby2cubic`).
pub fn tension2control(z0: Vector, dir0: f64, alpha: f64, beta: f64, dir1: f64, z1: Vector) -> [Vector; 2] {
    let nan = Vector::new(f64::NAN, f64::NAN);
    let (u, v) = tension2control_opt(z0, dir0, Some(alpha), Some(beta), dir1, z1);
    [u.unwrap_or(nan), v.unwrap_or(nan)]
}

pub fn tension2control_out(z0: Vector, dir0: f64, alpha: f64, dir1: f64, z1: Vector) -> Vector {
    // JS: tension2control(z0, dir0, alpha, undefined, dir1, z1)[0]
    tension2control_opt(z0, dir0, Some(alpha), None, dir1, z1).0.unwrap()
}

pub fn tension2control_in(z0: Vector, dir0: f64, beta: f64, dir1: f64, z1: Vector) -> Vector {
    tension2control_opt(z0, dir0, None, Some(beta), dir1, z1).1.unwrap()
}

fn magnitude2tension_opt(
    z0: Vector,
    dir0: f64,
    alpha: Option<f64>,
    beta: Option<f64>,
    dir1: f64,
    z1: Vector,
) -> (Option<f64>, Option<f64>) {
    // 1 is the default tension
    let alpha_ = match alpha { Some(a) if a != 0.0 => Some(1.0), _ => None };
    let beta_ = match beta { Some(b) if b != 0.0 => Some(1.0), _ => None };
    let uv = if alpha_.is_some() || beta_.is_some() {
        Some(tension2control_opt(z0, dir0, alpha_, beta_, dir1, z1))
    } else {
        None
    };
    // alpha_ is set exactly when alpha is non-zero, i.e. exactly when uv.0
    // is read below (same for beta), so the unwraps cannot fail.
    let u = match alpha {
        Some(0.0) => Some(f64::INFINITY), // also matches -0, like JS `=== 0`
        Some(a) => Some((uv.unwrap().0.unwrap() - z0).magnitude() / a),
        None => None,
    };
    let v = match beta {
        Some(0.0) => Some(f64::INFINITY),
        Some(b) => Some((uv.unwrap().1.unwrap() - z1).magnitude() / b),
        None => None,
    };
    (u, v)
}

/// Inverse of [`tension2magnitude`]. `[Infinity, Infinity]` when both
/// magnitudes are 0.
pub fn magnitude2tension(z0: Vector, dir0: f64, alpha: f64, beta: f64, dir1: f64, z1: Vector) -> [f64; 2] {
    let (u, v) = magnitude2tension_opt(z0, dir0, Some(alpha), Some(beta), dir1, z1);
    [u.unwrap_or(f64::NAN), v.unwrap_or(f64::NAN)]
}

pub fn magnitude2tension_out(z0: Vector, dir0: f64, alpha: f64, dir1: f64, z1: Vector) -> f64 {
    magnitude2tension_opt(z0, dir0, Some(alpha), None, dir1, z1).0.unwrap()
}

pub fn magnitude2tension_in(z0: Vector, dir0: f64, beta: f64, dir1: f64, z1: Vector) -> f64 {
    magnitude2tension_opt(z0, dir0, None, Some(beta), dir1, z1).1.unwrap()
}

/// Both tensions of the cubic `p0 p1 p2 p3` (formerly `tensions`).
pub fn control2tension(p0: Vector, p1: Vector, p2: Vector, p3: Vector) -> [f64; 2] {
    let diff_p0p1 = p1 - p0;
    let diff_p3p2 = p3 - p2;
    let dir0 = diff_p0p1.angle();
    let dir1 = diff_p3p2.angle();
    let alpha = diff_p0p1.magnitude();
    let beta = diff_p3p2.magnitude();
    let (u, v) = magnitude2tension_opt(p0, dir0, Some(alpha), Some(beta), dir1, p3);
    // JS returns the raw pair from _magnitude2tension; both are always set here
    [u.unwrap(), v.unwrap()]
}

/// Tension at the first on-curve point (formerly `posttension`).
///
/// **Reproduces upstream bugs on purpose**: the JS passes `p1` (not `p0`) as
/// `z0` and the *magnitude* of `p3 - p2` as `dir1`. Fix only after parity,
/// together with the callers.
pub fn control2tension_out(p0: Vector, p1: Vector, p2: Vector, p3: Vector) -> f64 {
    let diff_p0p1 = p1 - p0;
    let diff_p3p2 = p3 - p2;
    let dir0 = diff_p0p1.angle();
    let dir1 = diff_p3p2.magnitude();
    let alpha = diff_p0p1.magnitude();
    magnitude2tension_out(p1, dir0, alpha, dir1, p3)
}

/// Tension at the second on-curve point (formerly `pretension`).
///
/// **Reproduces upstream bugs on purpose**: same as [`control2tension_out`].
pub fn control2tension_in(p0: Vector, p1: Vector, p2: Vector, p3: Vector) -> f64 {
    let diff_p0p1 = p1 - p0;
    let diff_p3p2 = p3 - p2;
    let dir0 = diff_p0p1.angle();
    let dir1 = diff_p3p2.magnitude();
    let beta = diff_p3p2.magnitude();
    magnitude2tension_in(p1, dir0, beta, dir1, p3)
}
