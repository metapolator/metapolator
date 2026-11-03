//! Compare transcendental functions with V8 (the JS engine Metapolator ran on)
//! bit-exactly, on the inputs recorded by tests/probes/v8-math.js.
//!
//! `cargo test -p mp-math --test v8_math -- --nocapture` prints a table of
//! exact-match counts for Rust std, the `libm` crate and the `mp_math::fp`
//! facade; the test asserts the facade's counts (see FACADE_EXPECTED).
use serde_json::Value;

fn f(h: &str) -> f64 { f64::from_bits(u64::from_str_radix(h, 16).unwrap()) }

type Impl = (&'static str, fn(&[f64]) -> f64);

fn impls(name: &str) -> Vec<Impl> {
    match name {
        "sin" => vec![("std", |a| a[0].sin()), ("libm", |a| libm::sin(a[0])), ("fp", |a| mp_math::fp::sin(a[0]))],
        "cos" => vec![("std", |a| a[0].cos()), ("libm", |a| libm::cos(a[0])), ("fp", |a| mp_math::fp::cos(a[0]))],
        "tan" => vec![("std", |a| a[0].tan()), ("libm", |a| libm::tan(a[0])), ("fp", |a| mp_math::fp::tan(a[0]))],
        "atan2" => vec![("std", |a| a[0].atan2(a[1])), ("libm", |a| libm::atan2(a[0], a[1])), ("fp", |a| mp_math::fp::atan2(a[0], a[1]))],
        "exp" => vec![("std", |a| a[0].exp()), ("libm", |a| libm::exp(a[0])), ("fp", |a| mp_math::fp::exp(a[0]))],
        "log" => vec![("std", |a| a[0].ln()), ("libm", |a| libm::log(a[0])), ("fp", |a| mp_math::fp::ln(a[0]))],
        "pow" => vec![("std", |a| a[0].powf(a[1])), ("libm", |a| libm::pow(a[0], a[1])), ("fp", |a| mp_math::fp::pow(a[0], a[1]))],
        _ => panic!("unknown fn {name}"),
    }
}

#[test]
fn transcendental_functions_match_v8() {
    let data: Value = serde_json::from_str(include_str!("data/v8-math.json")).unwrap();
    let cases = data["cases"].as_object().unwrap();
    println!("vs V8 (node {}), exact bit matches out of {}:", data["node"], data["n"]);
    println!("| fn    | std  | libm | fp   | max ulp (fp) |");
    println!("|-------|------|------|------|--------------|");
    let mut fp_mismatch = 0;
    for name in ["sin", "cos", "tan", "atan2", "exp", "log", "pow"] {
        let rows = cases[name].as_array().unwrap();
        let mut counts = vec![];
        let mut max_ulp = 0u64;
        for (label, func) in impls(name) {
            let mut ok = 0;
            for row in rows {
                let row: Vec<f64> = row.as_array().unwrap().iter().map(|v| f(v.as_str().unwrap())).collect();
                let (args, want) = row.split_at(row.len() - 1);
                let got = func(args);
                if got.to_bits() == want[0].to_bits() { ok += 1; }
                else if label == "fp" {
                    fp_mismatch += 1;
                    max_ulp = max_ulp.max((got.to_bits() as i64 - want[0].to_bits() as i64).unsigned_abs());
                }
            }
            counts.push(ok);
        }
        println!("| {name:<5} | {:>4} | {:>4} | {:>4} | {max_ulp:>12} |", counts[0], counts[1], counts[2]);
    }
    assert_eq!(fp_mismatch, FACADE_EXPECTED_MISMATCHES, "fp facade drifted from the recorded V8 agreement");
}

/// Recorded by running this test; see notes/rust-port/fp-v8-parity.md.
const FACADE_EXPECTED_MISMATCHES: usize = 0;
