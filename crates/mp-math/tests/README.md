# mp-math parity tests

| test (`cargo test -p mp-math --test …`) | question it answers                                                                                                     | data producer (run with node ≥ 18)                                                                                                                                                                  |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `v8_math`                               | Which Rust libm reproduces V8's `Math.sin/cos/tan/atan2/exp/log/pow` bit-exactly? (see notes/rust-port/fp-v8-parity.md) | `node tests/probes/v8-math.js > tests/data/v8-math.json`: pure JS, no deps                                                                                                                          |
| `math_tools`                            | Do `Vector`, `Transform`, `normalize_angle`, the `hobby` functions and `js_num` compute what the JS originals compute?  | `node tests/probes/math-tools.js > tests/data/math-tools.json`: loads the pinned originals from `tools/js-reference/legacy/app/lib/bower_components` (run `tools/js-reference/fetch-deps.sh` first) |

**Signal.** Every f64 is stored as a 16-hex-digit bit pattern. Pure
arithmetic must match bit-exactly. Results that pass through `sin`/`cos`/…
must agree within a relative error of 1e-12. They can differ only by
`libm`'s known 1-ulp differences from V8, amplified by later arithmetic.
Run with `-- --nocapture` to see the tallies.

**Recorded 2026-11-02** (node v20.19.2, rustc 1.93.1, libm 0.2.16):

| group     | bit-exact                                | within 1e-12 rel | worst rel. error | failures |
|-----------|------------------------------------------|------------------|------------------|----------|
| vector    | 5092                                     | 8                | 2.2e-16          | 0        |
| transform | 13180                                    | 20               | 1.7e-16          | 0        |
| hobby     | 6238                                     | 62               | 8.6e-16          | 0        |
| `js_num`  | 319/319 strings identical to `String(x)` | –                | –                | 0        |

Data sha256: `v8-math.json` fbe561fc…53f5, `math-tools.json` 5746820f…373f.
