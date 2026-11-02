//! Differential test against the original JS Vector/Transform/hobby
//! (recorded by tests/probes/math-tools.js into tests/data/math-tools.json).
//!
//! Pure arithmetic (`+ - * / sqrt`) must match bit-exactly. Results that depend
//! on a transcendental function may carry `libm`'s known 1-ulp differences
//! from V8 (notes/rust-port/fp-v8-parity.md), amplified by later arithmetic
//! (e.g. cancellation in a matrix product turns 1 ulp of `sin` into 8 ulp of
//! the result). Those must agree within a relative error of 1e-12 (absolute
//! for |x| < 1). The test prints exact/close counts and the worst error.
use mp_math::{hobby, js_num, normalize_angle, Transform, Vector};
use serde_json::Value;

fn f(v: &Value) -> f64 {
    f64::from_bits(u64::from_str_radix(v.as_str().unwrap(), 16).unwrap())
}
fn vec(v: &Value) -> Vector {
    Vector::new(f(&v[0]), f(&v[1]))
}
fn aff(v: &Value) -> [f64; 6] {
    let a: Vec<f64> = v.as_array().unwrap().iter().map(f).collect();
    a.try_into().unwrap()
}

fn ulps(a: f64, b: f64) -> u64 {
    if a.to_bits() == b.to_bits() || (a.is_nan() && b.is_nan()) {
        return 0;
    }
    if a.is_sign_negative() != b.is_sign_negative() {
        // straddling zero: only +0/-0 count as equal
        return if a == 0.0 && b == 0.0 { 0 } else { u64::MAX };
    }
    (a.to_bits() as i64 - b.to_bits() as i64).unsigned_abs()
}

#[derive(Default)]
struct Tally {
    exact: usize,
    close: usize,
    worst: f64,
    failures: Vec<String>,
}

impl Tally {
    /// `exact_only`: no transcendental function involved, must be bit-exact.
    fn check(&mut self, what: &str, got: f64, want: f64, exact_only: bool) {
        let u = ulps(got, want);
        let rel = (got - want).abs() / want.abs().max(1.0);
        if u == 0 {
            self.exact += 1;
        } else if !exact_only && rel <= 1e-12 && ALLOW_NEAR {
            self.close += 1;
            self.worst = self.worst.max(rel);
        } else {
            self.failures.push(format!("{what}: got {got:e} want {want:e} ({u} ulp)"));
        }
    }
    fn v(&mut self, what: &str, got: Vector, want: &Value, exact_only: bool) {
        self.check(&format!("{what}.x"), got.x, f(&want[0]), exact_only);
        self.check(&format!("{what}.y"), got.y, f(&want[1]), exact_only);
    }
    fn a(&mut self, what: &str, got: Transform, want: &Value, exact_only: bool) {
        for (i, w) in aff(want).iter().enumerate() {
            self.check(&format!("{what}[{i}]"), got.0[i], *w, exact_only);
        }
    }
    fn finish(self, name: &str) -> (usize, usize) {
        println!("{name}: {} exact, {} within 1e-12 rel (worst {:.1e}), {} failures",
                 self.exact, self.close, self.worst, self.failures.len());
        for msg in self.failures.iter().take(20) {
            println!("  {msg}");
        }
        assert!(self.failures.is_empty(), "{name}: {} mismatches", self.failures.len());
        (self.exact, self.close)
    }
}

/// With the V8 ports in `mp_math::v8` everything is bit-exact; set this to
/// true only to diagnose a regression.
const ALLOW_NEAR: bool = false;

fn data() -> Value {
    serde_json::from_str(include_str!("data/math-tools.json")).unwrap()
}

#[test]
fn vector_matches_js() {
    let d = data();
    let mut t = Tally::default();
    for (i, r) in d["vector"].as_array().unwrap().iter().enumerate() {
        let (v, w, n) = (vec(&r["v"]), vec(&r["w"]), f(&r["n"]));
        t.v(&format!("#{i} add"), v + w, &r["add"], true);
        t.v(&format!("#{i} sub"), v - w, &r["sub"], true);
        t.v(&format!("#{i} mul"), v * w, &r["mul"], true);
        // divide uses Math.pow(x, 2)
        t.v(&format!("#{i} div"), v / w, &r["div"], false);
        t.v(&format!("#{i} muln"), v * n, &r["muln"], true);
        t.v(&format!("#{i} divn"), v / n, &r["divn"], false);
        t.check(&format!("#{i} mag"), v.magnitude(), f(&r["mag"]), true);
        t.check(&format!("#{i} ang"), v.angle(), f(&r["ang"]), false);
        t.v(&format!("#{i} polar"), Vector::from_polar(n, v.angle()), &r["polar"], false);
        t.check(&format!("#{i} norm"), normalize_angle(n), f(&r["norm"]), true);
        assert_eq!(v.to_string(), r["str"].as_str().unwrap(), "#{i} toString");
    }
    t.finish("vector");
}

#[test]
fn transform_matches_js() {
    let d = data();
    let mut t = Tally::default();
    for (i, r) in d["transform"].as_array().unwrap().iter().enumerate() {
        let tr = Transform::new(aff(&r["t"]));
        let (a, x, y) = (f(&r["a"]), f(&r["x"]), f(&r["y"]));
        let other = Transform::new(aff(&r["otherOperand"]));
        t.a(&format!("#{i} transform"), tr.transform(&other), &r["other"], true);
        t.a(&format!("#{i} rotate"), tr.rotate(a), &r["rotate"], false);
        t.a(&format!("#{i} scale"), tr.scale(x, Some(y)), &r["scale"], true);
        t.a(&format!("#{i} scale1"), tr.scale(x, None), &r["scale1"], true);
        t.a(&format!("#{i} translate"), tr.translate(x, y), &r["translate"], true);
        t.a(&format!("#{i} skew"), tr.skew(x, y), &r["skew"], false);
        t.a(&format!("#{i} inverse"), tr.inverse(), &r["inverse"], true);
        let p = [f(&r["p"][0]), f(&r["p"][1])];
        let q = tr.transform_point(p);
        t.check(&format!("#{i} point.x"), q[0], f(&r["point"][0]), true);
        t.check(&format!("#{i} point.y"), q[1], f(&r["point"][1]), true);
        assert_eq!(tr.to_string(), r["str"].as_str().unwrap(), "#{i} toString");
        assert_eq!(tr.to_ps(), r["ps"].as_str().unwrap(), "#{i} toPS");
    }
    t.finish("transform");
}

#[test]
fn hobby_matches_js() {
    let d = data();
    let mut t = Tally::default();
    for (i, r) in d["hobby"].as_array().unwrap().iter().enumerate() {
        let (z0, z1, q1, q2) = (vec(&r["z0"]), vec(&r["z1"]), vec(&r["q1"]), vec(&r["q2"]));
        let (d0, d1, al, be) = (f(&r["d0"]), f(&r["d1"]), f(&r["al"]), f(&r["be"]));
        let id = |s: &str| format!("#{i} {s}");
        t.check(&id("hobby"), hobby::hobby(d0, d1), f(&r["hobby"]), false);
        let m = hobby::tension2magnitude(z0, d0, al, be, d1, z1);
        t.check(&id("t2m[0]"), m[0], f(&r["t2m"][0]), false);
        t.check(&id("t2m[1]"), m[1], f(&r["t2m"][1]), false);
        t.check(&id("t2mOut"), hobby::tension2magnitude_out(z0, d0, al, d1, z1), f(&r["t2mOut"]), false);
        t.check(&id("t2mIn"), hobby::tension2magnitude_in(z0, d0, be, d1, z1), f(&r["t2mIn"]), false);
        let c = hobby::tension2control(z0, d0, al, be, d1, z1);
        t.v(&id("t2c[0]"), c[0], &r["t2c"][0], false);
        t.v(&id("t2c[1]"), c[1], &r["t2c"][1], false);
        t.v(&id("t2cOut"), hobby::tension2control_out(z0, d0, al, d1, z1), &r["t2cOut"], false);
        t.v(&id("t2cIn"), hobby::tension2control_in(z0, d0, be, d1, z1), &r["t2cIn"], false);
        let mt = hobby::magnitude2tension(z0, d0, al * 100.0, be * 100.0, d1, z1);
        t.check(&id("m2t[0]"), mt[0], f(&r["m2t"][0]), false);
        t.check(&id("m2t[1]"), mt[1], f(&r["m2t"][1]), false);
        t.check(&id("m2tOut"), hobby::magnitude2tension_out(z0, d0, al * 100.0, d1, z1), f(&r["m2tOut"]), false);
        t.check(&id("m2tIn"), hobby::magnitude2tension_in(z0, d0, be * 100.0, d1, z1), f(&r["m2tIn"]), false);
        let ct = hobby::control2tension(z0, q1, q2, z1);
        t.check(&id("c2t[0]"), ct[0], f(&r["c2t"][0]), false);
        t.check(&id("c2t[1]"), ct[1], f(&r["c2t"][1]), false);
        t.check(&id("c2tOut"), hobby::control2tension_out(z0, q1, q2, z1), f(&r["c2tOut"]), false);
        t.check(&id("c2tIn"), hobby::control2tension_in(z0, q1, q2, z1), f(&r["c2tIn"]), false);
    }
    t.finish("hobby");
}

#[test]
fn number_to_string_matches_js() {
    let d = data();
    for r in d["numstr"].as_array().unwrap() {
        let v = f(&r[0]);
        assert_eq!(js_num(v), r[1].as_str().unwrap(), "{v:e}");
    }
}
