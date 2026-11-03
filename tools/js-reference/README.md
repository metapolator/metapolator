# JS reference harness (golden outputs for the Rust port)

The `rust-wasm-port` branch replaces the JavaScript Metapolator with Rust/WASM.
The Rust code is checked against **golden outputs produced by the original JS
engine**, run headless under Node. This directory holds everything needed to
regenerate them.

Most of the engine never lived in this repo. It came in through bower from
graphicore's Atem-* libraries, ufoJS, obtainJS and metapolator-cpsLib. These
are fetched into `legacy/app/lib/bower_components/` (git-ignored), pinned to
the code that was **actually deployed as Metapolator v0.4.0**.

The AngularJS app itself (`app/`) was deleted from the tree when the Rust UI
replaced it. `fetch-deps.sh` restores it from git history (commit
`f7aecce7`, upstream master, the base of the port) into `legacy/app/`, next
to the libraries. All harness scripts load the JS from there.

## Scripts

| script                     | question it answers / what it does                                                                                                                                                                                                                                                         | run                                                                                      |
|----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| `fetch-deps.sh`            | Recreates `legacy/app/` (the pre-port JS app, from git history) and `legacy/app/lib/bower_components/` from `deps.lock` at the pinned commits. Replaces `npm install && bower install`; the unpinned `>=` bower ranges no longer resolve to a working set.                                 | `tools/js-reference/fetch-deps.sh`                                                       |
| `deps.lock`                | `name url commit` for every JS dependency. Engine repos are pinned to their last commit on or before 2016-05-10, the v0.4.0 release/deploy date.                                                                                                                                           | –                                                                                        |
| `verify-pins.js`           | *Are the pinned checkouts the code that was deployed as v0.4.0?* Compares them with the minified r.js bundle on upstream `gh-pages` (`v0.4.0/min/main.js`), module by module, using string literals.                                                                                       | see below                                                                                |
| `extract-fixtures.sh`      | Extracts the v0.4.0 demo projects (`min`, `full`) from upstream `gh-pages` into `tests/fixtures/`.                                                                                                                                                                                         | `tools/js-reference/extract-fixtures.sh min full`                                        |
| `golden.js`                | Loads a project with the JS engine and exports every master as UFO. This is the full CPS → MOM → outline pipeline.                                                                                                                                                                         | `node tools/js-reference/golden.js PROJECTDIR OUTDIR [master ...]`                       |
| `regen-golden.sh`          | Runs `golden.js` on every `tests/fixtures/*` into `tests/golden/*`, then rewrites `tests/golden/SHA256SUMS`.                                                                                                                                                                               | `tools/js-reference/regen-golden.sh`                                                     |
| `import-golden.js`         | Imports UFOs with the JS importer into fresh in-memory projects, saves them, and exports the imported masters again.                                                                                                                                                                       | `node tools/js-reference/import-golden.js OUTDIR UFODIR...`                              |
| `regen-import-golden.sh`   | Runs `import-golden.js` on `data/fonts/{test,subsets}/*.ufo` into `tests/golden-import/` (the big one as `.tar.xz`), then writes SHA256SUMS.                                                                                                                                               | `tools/js-reference/regen-import-golden.sh`                                              |
| `workflow-golden.js`       | Runs the UI workflow on the engine: imports two UFOs as `base-`/`master-` pairs, metapolates an instance, saves, and exports every master (UFO 3, unrounded UFO 2, OTF).                                                                                                                   | `node tools/js-reference/workflow-golden.js OUTDIR NAME=UFODIR... --instance NAME=P,...` |
| `regen-workflow-golden.sh` | Runs `workflow-golden.js` on the Merriweather light/bold subsets into `tests/golden-workflow/`.                                                                                                                                                                                            | `tools/js-reference/regen-workflow-golden.sh`                                            |
| `ui-model-golden.js`       | *Does the Rust UI model behave like the JS one?* Replays `ui-model-steps.json` with the original AppModel, ParameterModel, master duplication, instanceTools and specimen controller on the v0.4.0 default project. Records effective parameter values after every step, then the exports. | `node tools/js-reference/ui-model-golden.js OUTDIR`                                      |
| `ui-model-steps.json`      | The steps (selection, operators, duplication, design space, sliders) and specimen cases. `crates/mp-app/tests/ui_model.rs` replays the same file.                                                                                                                                          | –                                                                                        |
| `regen-ui-model-golden.sh` | Runs `ui-model-golden.js` into `tests/golden-ui-model/default-project/` and writes SHA256SUMS.                                                                                                                                                                                             | `tools/js-reference/regen-ui-model-golden.sh`                                            |
| `package.json`             | The only npm dependency is jsdom, for the XML DOM that ufoJS needs.                                                                                                                                                                                                                        | `corepack npm@10.9.2 install` (here)                                                     |

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

opentype.js (used only by the OTF export) is pinned by date alone, to 0.6.3
(released 2016-05-10). The bundle's minified copy could not be matched to a
release by its literals.

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
- **In-memory project copy.** As in the app's `lib/main.js`, the project is copied
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

| fixture       | masters | glyph files / master | export time | errors |
|---------------|---------|----------------------|-------------|--------|
| `v0.4.0-min`  | 5       | 11                   | ~8 s        | 0      |
| `v0.4.0-full` | 2       | 173                  | ~24 s       | 0      |

Two runs into different directories gave byte-identical output (`diff -r`).
`tests/golden/SHA256SUMS` holds the baseline hashes.

- `Project.getOTFInstance` is broken upstream (it calls `do_export`, which
  does not exist). The UI exported OTFs through `getOTFExportGenerator`, so
  the harnesses do the same.
- OTF export quirks reproduced by `crates/mp-otf`: components are never drawn
  (`MasterGlyphSet.get` returns nothing), glyphs with width 0 make the export
  fail, the whole `unicodes` array is passed as `unicode` (cmap and OS/2
  coerce it), `usFirstCharIndex` is always 0, and `usDefaultChar` is always 32.

## UI model golden (2026-11-02, Node v20.19.2)

`ui-model-golden.js` runs the UI models outside Angular. Twice it has to do
what the UI's rendering did implicitly, and it says so in comments: it draws
the glyphs of a duplicated master (upstream bug 15) and of a new instance
(bug 16), using `getComputedStyle().get('width')`.

Result: `crates/mp-app/tests/ui_model.rs` matches all 19 snapshots exactly
(effective Width of every glyph, effective Weight of every point of `a`,
`o` and `n`, instance axes). The exception is 380 values that the JS
reports as undefined right after the duplication (bug 17). All 531 export
files (unrounded UFO 2 and OTF of `master-regular`, `master-0-1` and
`instance-0`) are byte-identical, and so is `glyphsOut` for all 8 specimen
cases. Two JS runs gave identical output (`diff -r`).

## After the JS app left the tree (2026-11-02)

With the harness loading from `legacy/`, `regen-golden.sh`,
`regen-workflow-golden.sh` and `regen-ui-model-golden.sh` regenerate
`tests/golden`, `tests/golden-workflow` and `tests/golden-ui-model` byte
for byte (`git status` stays clean), and `verify-pins.js` still reports
`154 match, 0 differ/missing`.
