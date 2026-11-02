# The Rust UI against the AngularJS UI (v0.4.0)

What `crates/mp-ui` does with each part of the original UI
(`app/lib/ui/metapolator`, restored by `tools/js-reference/fetch-deps.sh`).
The model under the UI (`crates/mp-app`) is checked against the JS models
by `tests/golden-ui-model`. The UI itself is checked in Chromium by
`crates/mp-ui/tests/e2e`.

| original                                    | Rust UI                                                                                                                                                        |
|---------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| menubar                                     | New (empty project), Demo, Open…/Save (project ZIP: new; the JS app could not save a project)                                                                  |
| parameter panel                             | ported: master and glyph level, Width/Weight, the 7 operators, formulas, arrow-key steps, effective values                                                     |
| parameter ranges (edit low/high of a range) | not ported: a range is shown as `low – high`, typing a value sets it on every selected element                                                                 |
| specimen: samples, own text, mixer, font-by | ported, `glyphsOut` identical to the JS (golden); characters that are not glyph names are looked up by unicode when drawn                                      |
| specimen: Glyph Range sample                | ported and working (upstream it had no text and failed)                                                                                                        |
| specimen: size rope, line height            | number inputs instead of the drag rope                                                                                                                         |
| specimen: click / rubberband selection      | ported (selectSet, toggleSet with shift/alt/meta, click on empty space deselects)                                                                              |
| master panel                                | import zipped UFOs, select, rename, duplicate, delete; drag and drop into the design space became a → button                                                   |
| UFO import report (popup window)            | a status line with the imported masters and per-UFO errors                                                                                                     |
| design space panel                          | spaces (add, clone, delete), axes as range sliders, slack master (reversed slider), remove axis; the d3 diamond graphics are not reproduced                    |
| instance panel                              | add, duplicate, delete, rename, show in specimen, export flag                                                                                                  |
| font export panel                           | Check all / Uncheck all, Export fonts (the same bundle: per instance `<name>.otf` and `<name>.ufo.zip`, UFO 2 unrounded)                                       |
| export progress bar                         | none: the export runs in one step                                                                                                                              |
| metadata panel                              | was "Coming Soon" upstream; not ported                                                                                                                         |
| panel dividers, landscape view switching    | a fixed row of panels that scrolls horizontally                                                                                                                |
| social/donation widgets                     | left out                                                                                                                                                       |
| `bin/metapolator serve <project>`           | `metapolator serve <project>` (the UI opens the project; nothing is written back, as before)                                                                   |
| `bin/metapolator-dev-playground-cps*`       | already broken upstream (they imported modules that had moved to Atem-CPS); `metapolator cps` parses and prints a CPS file, `metapolator query` runs selectors |
