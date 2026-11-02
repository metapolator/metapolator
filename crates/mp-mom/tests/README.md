# mp-mom parity tests

| test (`cargo test -p mp-mom --test …`) | question it answers                                                                                                                                                                               | reference data                                                                      |
|----------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| `golden`                               | Does the Rust engine (MOM, CPS cascade, Property Language, renderer, UFO writer) export **byte-identical** UFOs for every master of the v0.4.0 demo projects, including the metapolated instance? | `tests/golden/` (`tools/js-reference/regen-golden.sh`), inputs in `tests/fixtures/` |

**Signal.** Every file of every exported master is compared byte for byte
(GLIF, `contents.plist`, `fontinfo.plist`, `layercontents.plist`,
`metainfo.plist`), and the file lists must be equal.

**Recorded 2026-11-02** (rustc 1.93.1):

| fixture       | masters | files compared | failures | Rust time (release, whole test) |
|---------------|---------|----------------|----------|---------------------------------|
| `v0.4.0-min`  | 5       | 75             | 0        | –                               |
| `v0.4.0-full` | 2       | 354            | 0        | 0.64 s for both fixtures        |

For comparison, the JS reference needs about 24 s for `v0.4.0-full`
(tools/js-reference/README.md).

**Negative control:** exporting with precision 2 instead of 3 makes 50 of
the 75 `v0.4.0-min` files differ.
