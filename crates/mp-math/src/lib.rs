//! Metapolator math, ported from `complex` (graphicore) and `Atem-Math-Tools`.
//!
//! Parity with the JS engine is tested against V8 outputs, see
//! `tests/probes/` and notes/rust-port/fp-v8-parity.md.

pub mod fp;
pub mod hobby;
pub mod transform;
pub mod vector;

pub use transform::{Transform, IDENTITY};
pub use vector::Vector;

/// Normalize an angle in radians into `[0, 2π)`. `%` on f64 is fmod in both
/// Rust and JS, so this is bit-identical to `utils.normalizeAngle`.
pub fn normalize_angle(angle: f64) -> f64 {
    let two_pi = 2.0 * std::f64::consts::PI;
    let mut result = angle % two_pi;
    if result < 0.0 {
        result += two_pi;
    }
    result
}

/// ECMAScript `Number.prototype.toString()` (radix 10): shortest round-trip
/// digits, with JS's rules for when to use exponent notation.
pub fn js_num(v: f64) -> String {
    if v.is_nan() {
        return "NaN".into();
    }
    if v.is_infinite() {
        return if v > 0.0 { "Infinity".into() } else { "-Infinity".into() };
    }
    if v == 0.0 {
        return "0".into(); // also for -0
    }
    let sign = if v < 0.0 { "-" } else { "" };
    // Rust's `{:e}` gives the shortest round-trip digits: "d.ddde±x"
    let sci = format!("{:e}", v.abs());
    let (mant, exp) = sci.split_once('e').unwrap();
    let digits: String = mant.chars().filter(|c| *c != '.').collect();
    let k = digits.len() as i32;
    let n = exp.parse::<i32>().unwrap() + 1; // ES spec: value = 0.digits * 10^n
    let body = if k <= n && n <= 21 {
        format!("{}{}", digits, "0".repeat((n - k) as usize))
    } else if 0 < n && n <= 21 {
        format!("{}.{}", &digits[..n as usize], &digits[n as usize..])
    } else if -6 < n && n <= 0 {
        format!("0.{}{}", "0".repeat((-n) as usize), digits)
    } else {
        let e = n - 1;
        let es = if e >= 0 { format!("+{e}") } else { format!("{e}") };
        if k == 1 {
            format!("{digits}e{es}")
        } else {
            format!("{}.{}e{}", &digits[..1], &digits[1..], es)
        }
    };
    format!("{sign}{body}")
}

#[cfg(test)]
mod tests {
    use super::js_num;

    #[test]
    fn js_number_to_string() {
        for (v, s) in [
            (0.0, "0"), (-0.0, "0"), (1.0, "1"), (-1.5, "-1.5"), (0.1, "0.1"),
            (100.0, "100"), (1e21, "1e+21"), (1e20, "100000000000000000000"),
            (1.5e-7, "1.5e-7"), (0.000001, "0.000001"), (123.456, "123.456"),
            (77.333, "77.333"), (1.0 / 3.0, "0.3333333333333333"),
            (f64::NAN, "NaN"), (f64::INFINITY, "Infinity"), (2.5e300, "2.5e+300"),
        ] {
            assert_eq!(js_num(v), s, "{v:?}");
        }
    }
}
