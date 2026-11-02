# Web UI end-to-end test

| file       | question it answers                                                                                                                                                                                                                                                                                                                    | run                                                 |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| `run.sh`   | Builds the UI (`tools/build-ui.sh`), serves it with `metapolator serve` on 127.0.0.1:8766, runs `smoke.js`. Output goes to `$TMPDIR/mp-ui-e2e` (screenshots, the export ZIP).                                                                                                                                                          | `crates/mp-ui/tests/e2e/run.sh`                     |
| `smoke.js` | *Does the UI work in a real browser?* Headless Chromium over the DevTools protocol: the demo master renders, duplicate, Weight × (1+1) on the copy, glyph selection by click and rubberband, editing a range of operator values, both masters into the design space, a slider move, the Glyph Range sample, check/uncheck all, export. | `node --experimental-websocket smoke.js URL OUTDIR` |

**Signal.** Every line starts with `ok`, the last one is `OK: all checks passed`
and the exit status is 0. The last check fails on any exception or
`console.error` in the page.

Then `run.sh` serves a project made with the CLI (`init`, `import-ui` of the
Merriweather light subset) with `metapolator serve <project>` and checks that
the UI opens it (`master-light` listed, glyphs drawn).

**Recorded (2026-11-02, Chromium headless, Node v20.19.2):** 14 + 2 checks ok.
The slider check expects the axes to read `10.0 · 10%` and `90.0 · 90%`
after the second slider is set to 90, because the slack master follows it.
