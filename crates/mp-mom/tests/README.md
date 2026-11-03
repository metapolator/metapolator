# mp-mom parity tests

| test (`cargo test -p mp-mom --test …`) | question it answers                                                                                                                                                                               | reference data                                                                      |
|----------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| `golden`                               | Does the Rust engine (MOM, CPS cascade, Property Language, renderer, UFO writer) export **byte-identical** UFOs for every master of the v0.4.0 demo projects, including the metapolated instance? | `tests/golden/` (`tools/js-reference/regen-golden.sh`), inputs in `tests/fixtures/` |

| `import`                               | Does the Rust UFO importer (UFO/GLIF reading, outline → skeleton inference, MOM construction, saving) produce the same project data as the JS importer, and does the imported master export byte-identically? | `tests/golden-import/` (`tools/js-reference/regen-import-golden.sh`), inputs in `data/fonts/{test,subsets}` |
| `generators`                           | Is the generated interpolation/metapolation CPS text identical to mustache.js output?                                                                                                                                   | `crates/mp-cps/tests/data/cps-parse.json`                                          |

**Signal.** Every file of every exported master is compared byte for byte
(GLIF, `contents.plist`, `fontinfo.plist`, `layercontents.plist`,
`metainfo.plist`), and the file lists must be equal. The OTF export (the
opentype.js 0.6.3 port in `crates/mp-otf`) is compared byte for byte too.
Where the JS export fails, the Rust export must fail as well: the
`sean_hairline-nop` import contains a zero-width glyph, and opentype.js
requires a truthy `advanceWidth`.

**Recorded 2026-11-02** (rustc 1.93.1):

| fixture       | masters | files compared | failures | Rust time (release, whole test) |
|---------------|---------|----------------|----------|---------------------------------|
| `v0.4.0-min`  | 5       | 75 + 5 OTF     | 0        | –                               |
| `v0.4.0-full` | 2       | 354 + 2 OTF    | 0        | 1.05 s for both fixtures        |

For comparison, the JS reference needs about 24 s for `v0.4.0-full`
(tools/js-reference/README.md).

**Negative control:** exporting with precision 2 instead of 3 makes 50 of
the 75 `v0.4.0-min` files differ.

### Import (recorded 2026-11-02, release build, 2.5 s for all)

| source UFO                           | MOM data values identical | within 1e-12 rel. | exported files byte-identical |
|--------------------------------------|---------------------------|-------------------|-------------------------------|
| test/components{,-circular,-reverse} | 368 + 373 + 368           | 0                 | 7 + 7 + 7                     |
| test/seanjacob                       | 1377                      | 0                 | 9/9                           |
| subsets/Merriweather-Bold            | 5608                      | 1 (1.1e-16)       | 26/26                         |
| subsets/Merriweather-Light           | 5339                      | 2 (7.5e-16)       | 25/25                         |
| subsets/Merriweather-Regular         | 5451                      | 0                 | 26/26                         |
| subsets/sean_hairline-nop            | 201863                    | 50 (4.0e-15)      | 547/547                       |

The near-equal values are CPS property strings of computed tensions. Their
last digit differs because `libm`'s sin/cos are 1 ulp off V8's on about 1%
of inputs (notes/rust-port/fp-v8-parity.md). The rendered output is not
affected: every export is byte-identical. The test also checks that the
broken `data/fonts/verbatim/sean_hairline.ufo` fails to import, as it does in JS.

The `sean_hairline-nop` golden is stored as `.tar.xz` (300 KB instead of
10.6 MB). `tests/golden-import/SHA256SUMS` lists every golden file.
