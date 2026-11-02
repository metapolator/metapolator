//! The interpolation/metapolation generators must produce exactly the CPS
//! text the JS generators (mustache.js) produce; the JS output for 0..4
//! masters is recorded in crates/mp-cps/tests/data/cps-parse.json.
use mp_cps::GenArg;
use mp_mom::generators::{interpolation, metapolation};

#[test]
fn generated_cps_is_identical() {
    let data: serde_json::Value = serde_json::from_str(include_str!("../../mp-cps/tests/data/cps-parse.json")).unwrap();
    let mut checked = 0;
    for f in data["files"].as_array().unwrap() {
        let name = f["name"].as_str().unwrap();
        let Some(rest) = name.strip_prefix("generated://") else { continue };
        let mut parts = rest.split('/');
        let gen = parts.next().unwrap();
        parts.next();
        let n: f64 = parts.next().unwrap().parse().unwrap();
        let args = [GenArg::Number(n)];
        let got = match gen { "interpolation" => interpolation(&args), "metapolation" => metapolation(&args), _ => unreachable!() };
        assert_eq!(got, f["source"].as_str().unwrap(), "{name}");
        checked += 1;
    }
    assert_eq!(checked, 10);
}
