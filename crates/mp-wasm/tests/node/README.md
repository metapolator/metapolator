# WASM tests under Node

| file          | question it answers                                                                                                                                                                                                                                                                                    | run                                                 |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| `run.sh`      | Builds `mp-wasm` with wasm-pack (`--target nodejs`) into `$TMPDIR/mp-wasm-node`, then runs `ui-model.js`.                                                                                                                                                                                              | `crates/mp-wasm/tests/node/run.sh`                  |
| `ui-model.js` | *Does the wasm32 build give the JS engine's numbers and bytes?* It replays `tools/js-reference/ui-model-steps.json` through the WASM API and compares the result with `tests/golden-ui-model/default-project`: every snapshot of effective parameter values, then the unrounded UFO 2 and OTF exports. | `node crates/mp-wasm/tests/node/ui-model.js PKGDIR` |
| `unzip.js`    | A minimal ZIP reader, so the test needs nothing but Node.                                                                                                                                                                                                                                              | –                                                   |

**Signal.** The last line is `OK: the WASM build matches the JS golden` and the
exit status is 0. Values that the JS leaves undefined after a master
duplication are counted rather than compared
(notes/rust-port/upstream-bugs.md, row 17).

**Recorded (2026-11-02, wasm-pack 0.14.0, Node v20.19.2):** 19 snapshots
compared, 380 values undefined in the JS, 531 export files identical, 1.8 s.
