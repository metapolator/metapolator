# Transcendental functions: Rust vs V8

**Question.** The JS engine computes geometry with V8's `Math.sin`, `cos`,
`tan`, `atan2`, `exp`, `log` and `pow`. Which Rust implementation reproduces
those results bit-exactly, so that the port matches the goldens and native
and WASM builds agree with each other?

**Producer.** `crates/mp-math/tests/probes/v8-math.js` evaluates each function
on 1000 seeded inputs (xorshift64*; angles in ±4π, coordinates in ±2000,
etc.) and records arguments and results as f64 bit patterns in
`crates/mp-math/tests/data/v8-math.json`
(sha256 `fbe561fc8897d041236602f39da23fd35f36f07c2b18c3f6b5d96cd2610e53f5`,
node v20.19.2).

**Consumer.** `cargo test -p mp-math --test v8_math -- --nocapture` prints the
table below. It asserts that the `mp_math::fp` facade has exactly 48
mismatches, so any drift (a different `libm` version, a changed facade) fails
loudly.

## Result (2026-11-02, rustc 1.93.1, libm 0.2.16, x86_64 glibc host)

Exact bit matches out of 1000 per function:

| fn    | Rust std (glibc) | `libm` crate | `mp_math::fp` (= libm) | max ulp off (fp) |
|-------|------------------|--------------|------------------------|------------------|
| sin   | 965              | 989          | 989                    | 1                |
| cos   | 963              | 988          | 988                    | 1                |
| tan   | 960              | 1000         | 1000                   | 0                |
| atan2 | 834              | 1000         | 1000                   | 0                |
| exp   | 888              | 1000         | 1000                   | 0                |
| log   | 994              | 999          | 999                    | 1                |
| pow   | 943              | 976          | 976                    | 1                |

## Decision

`mp_math::fp` uses the **`libm` crate** (pure Rust, a musl/fdlibm port):

- It is far closer to V8 than std. atan2 matches 1000/1000 against std's
  834, and exp 1000 against 888.
- Being pure Rust, it gives the same bits natively and on
  `wasm32-unknown-unknown`, where std would use a different libm. *Not yet
  verified by running the test under WASM*: no WASM test runner is
  installed yet.
- The remaining 48/7000 differences are 1 ulp, about 1e-16 relative. The
  goldens round coordinates to 3 decimals, so a 1-ulp difference can change
  output only when a value sits right at a rounding boundary.
  Getting to 100% would mean porting V8's own `ieee754::sin/cos/pow`. That is
  deferred until a golden mismatch is traced back to one of these functions.

## Update 2026-11-02: exact V8 ports

Exporting UFO 2 without rounding, as the UI does, showed the 1-ulp
differences in the output (for example `412.40700000000004` instead of
`412.407`). The facade therefore now uses `mp_math::v8`: line-by-line
ports of V8's `src/base/ieee754.cc` (V8 11.3, as in Node v20.19.2;
fdlibm-derived). Node's build does not define
`V8_USE_LIBM_TRIG_FUNCTIONS`, so `Math.sin/cos` are fdlibm. The port covers
sin, cos, tan (with `__ieee754_rem_pio2`, `__kernel_rem_pio2` and the
kernels), atan, atan2, exp, log and pow.

| fn    | Rust std (glibc) | `libm` crate | `mp_math::fp` (= V8 port) |
|-------|------------------|--------------|---------------------------|
| sin   | 965              | 989          | **1000**                  |
| cos   | 963              | 988          | **1000**                  |
| tan   | 960              | 1000         | **1000**                  |
| atan2 | 834              | 1000         | **1000**                  |
| exp   | 888              | 1000         | **1000**                  |
| log   | 994              | 999          | **1000**                  |
| pow   | 943              | 976          | **1000**                  |

The source of the differences was musl (and so the `libm` crate): it
reworked fdlibm's `__cos` kernel, its `__rem_pio2` reduction and `log`.

Consequences: `crates/mp-math/tests/math_tools.rs` is now bit-exact for all
24600 values, with the tolerance switched off. The import test
(`crates/mp-mom/tests/import.rs`) compares all 220604 saved values exactly,
and the UFO 2 unrounded goldens (`tests/golden/*/<master>.ufo2`) are
byte-identical. `v8_math` pins 0 mismatches.
