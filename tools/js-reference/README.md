# JS reference harness (golden outputs for the Rust port)

The `rust-wasm-port` branch replaces the JavaScript Metapolator with Rust/WASM.
The Rust code is checked against **golden outputs produced by the original JS
engine**, run headless under Node. This directory holds everything needed to
regenerate them.

Most of the engine never lived in this repo. It came in through bower from
graphicore's Atem-* libraries, ufoJS, obtainJS and metapolator-cpsLib. These
are fetched into `app/lib/bower_components/` (git-ignored), pinned to the code
that was **actually deployed as Metapolator v0.4.0**.

## Scripts

| script                 | question it answers / what it does                                                                                                                                                                            | run                                                                               |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| `fetch-deps.sh`        | Recreates `app/lib/bower_components/` from `deps.lock` at the pinned commits. Replaces `npm install && bower install`; the unpinned `>=` bower ranges no longer resolve to a working set.                     | `tools/js-reference/fetch-deps.sh`                                                |
| `deps.lock`            | `name url commit` for every JS dependency. Engine repos are pinned to their last commit on or before 2016-05-10, the v0.4.0 release/deploy date.                                                              | –                                                                                 |
| `verify-pins.js`       | *Are the pinned checkouts the code that was deployed as v0.4.0?* Compares them with the minified r.js bundle on upstream `gh-pages` (`v0.4.0/min/main.js`), module by module, using string literals.          | see below                                                                         |
| `extract-fixtures.sh`  | Extracts the v0.4.0 demo projects (`min`, `full`) from upstream `gh-pages` into `tests/fixtures/`.                                                                                                             | `tools/js-reference/extract-fixtures.sh min full`                                 |
| `golden.js`            | Loads a project with the JS engine and exports every master as UFO. This is the full CPS → MOM → outline pipeline.                                                                                             | `node tools/js-reference/golden.js PROJECTDIR OUTDIR [master ...]`                |
| `regen-golden.sh`      | Runs `golden.js` on every `tests/fixtures/*` into `tests/golden/*`, then rewrites `tests/golden/SHA256SUMS`.                                                                                                     | `tools/js-reference/regen-golden.sh`                                              |
| `package.json`         | The only npm dependency is jsdom, for the XML DOM that ufoJS needs.                                                                                                                                            | `corepack npm@10.9.2 install` (here)                                              |

### Pin verification

```sh
git fetch upstream          # github.com/metapolator/metapolator
git show upstream/gh-pages:v0.4.0/min/main.js > "$TMPDIR/main.js"
node tools/js-reference/verify-pins.js "$TMPDIR/main.js"
# expected: 154 match, 0 differ/missing, 184 non-engine modules skipped
```

**Signal.** For each of the 154 engine modules (`Atem-*`, `obtain`, `ufojs`)
in the bundle, every string literal in the bundled module must also appear in
the pinned source file. Constant `"a" + "b"` concatenations are folded first,
because the minifier folds them. A failure prints `DIFFERS <module>`.

**Negative control (2026-11-02).** With Atem-CPS at its 2018 HEAD instead of
the pin, the result is `152 match, 2 differ` (`PropertyValue`, `OMA/_Node`).
The check detects drift, but weakly: matching literals is a necessary
condition, not proof of identical code.

Before pinning, Atem-CPS (2018) and Atem-MOM (2016) at their HEADs did not
work together. Every CPS lookup failed with
`KeyError: Key "parent" is not whitelisted`.

## Workarounds in `golden.js` (things the original never needed)

- **No npm, no `lie`.** obtainJS asks Node for the `lie` Promise polyfill. We
  hook `Module._load` and hand it the native `Promise`.
- **XML.** On Node, ufoJS wants jsdom ≤ 9 internals plus libxmljs, a native
  addon that does not build on current Node. Instead we expose a current
  jsdom `window` (`DOMParser`, `XMLSerializer`, `XPathEvaluator`) as
  globals, so ufoJS takes its browser ("w3c") branch.
- **In-memory project copy.** As in `app/lib/main.js`, the project is copied
  into an `InMemory` IO before loading. `Project` writes `log.yaml` into the
  project directory, and `UFOWriter` refuses to export into an existing
  directory.
- **cpsLib mounts are relative to the repo root.** Atem-IO `Mounting` strips
  the leading `/` from `pathOffset`, so the script `chdir`s to the repo root.
- **All masters are opened before exporting.** Derived masters query their
  sources by id (`master#master-regular`).

## Known quirks of the reference (reproduced on purpose)

- `Project.exportUFOInstance` passes `formatVersion` twice to
  `_getUFOExporter`. The `precision` argument is therefore dropped, and the
  export rounds coordinates to **3 decimals**, which is the format version.
  The goldens have 3-decimal coordinates.
- The `min` fixture has a master called `insance-0` (sic).

## Recorded results (2026-11-02, Node v20.19.2)

| fixture        | masters | glyph files / master | export time | errors |
|----------------|---------|----------------------|-------------|--------|
| `v0.4.0-min`   | 5       | 11                   | ~8 s        | 0      |
| `v0.4.0-full`  | 2       | 173                  | ~24 s       | 0      |

Two runs into different directories gave byte-identical output (`diff -r`).
`tests/golden/SHA256SUMS` holds the baseline hashes.
