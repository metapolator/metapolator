//! ufoJS `main.round(value, decimalPlaces)`: MDN's decimal adjustment, which
//! shifts the decimal point through the *string* form of the number.

use mp_math::js_num;

/// `Math.round`: nearest integer, ties toward +Infinity, keeps -0
pub fn js_math_round(x: f64) -> f64 {
    if !x.is_finite() || x == x.trunc() { return x; }
    let f = x.floor();
    let r = if x - f >= 0.5 { f + 1.0 } else { f };
    if r == 0.0 && x < 0.0 { -0.0 } else { r }
}

fn shift(value: f64, by: i64) -> f64 {
    let s = js_num(value);
    let (mant, e) = match s.split_once('e') {
        Some((m, e)) => (m.to_string(), e.parse::<i64>().unwrap_or(0)),
        None => (s, 0),
    };
    let text = format!("{mant}e{}", e + by);
    text.parse::<f64>().unwrap_or(f64::NAN)
}

/// `decimalAdjust('round', value, -decimalPlaces)`
pub fn round(value: f64, decimal_places: i64) -> f64 {
    if decimal_places == 0 { return js_math_round(value); }
    if value.is_nan() { return f64::NAN; }
    let exp = -decimal_places;
    let shifted = js_math_round(shift(value, -exp));
    shift(shifted, exp)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rounding() {
        assert_eq!(round(1.0005, 3), 1.001);
        assert_eq!(round(77.33333333, 3), 77.333);
        assert_eq!(round(-0.0004, 3), -0.0);
        assert_eq!(round(2.5, 0), 3.0);
        assert_eq!(round(-2.5, 0), -2.0);
        assert_eq!(js_num(round(408.66600000000005, 3)), "408.666");
    }
}
