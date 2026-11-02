# Metapolator → Rust/WASM port: plan

Branch `rust-wasm-port`, started 2026-11-02 from upstream/master `f7aecce7`.

**Decisions (Felipe, 2026-11-02):**

- **Scope:** the engine *and* a new Rust UI. Angular 1.5 goes away.
- **Layout:** replace the JS in place. The branch ends as a Rust project. JS
  sources are deleted as their Rust replacement reaches parity.
- **Parity:** golden outputs from the original JS engine
  (`tools/js-reference/`, `tests/golden/`).

## What is being ported

This repo held only the UI and some CLI glue. The engine lived in the bower
dependencies, pinned in `tools/js-reference/deps.lock` to the code deployed as
v0.4.0. Line counts exclude the generated regenerator `*.js` twins of
`*.es6.js`, vendored dojo/r.js, and tests:

| JS source                                            | lines  | role                                                                                                                                                                           | Rust target                 |
|------------------------------------------------------|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| complex, Atem-Math-Tools                             | ~1 000 | `Vector` (complex numbers), affine `Transform`, Hobby splines (`tension2control`, …)                                                                                           | `mp-math`                   |
| Atem-Pen-Case                                        | ~1 900 | fontTools-style pens (point/segment, bounds, transform, SVG, OpenType), bezier tools                                                                                          | `mp-pens`                   |
| Atem-Errors, Atem-Logging, obtainJS                  | ~2 100 | errors, logging, sync/async "obtain" plumbing                                                                                                                                  | dropped: `Result`, `log`/`tracing`, plain sync code (async only at the IO edge) |
| Atem-IO                                              | ~2 400 | virtual FS: InMemory, Node fs, browser REST, Mounting, zip                                                                                                                    | `mp-io`                     |
| ufoJS (lib only)                                     | ~8 000 | UFO 2/3 reader/writer, glif, plist, validators                                                                                                                                 | `norad` crate + thin glue   |
| Atem-CPS (+ whitelisting, gonzales CSS parser)       | ~6 500 | **CPS**: CSS-like stylesheets over the object tree. Parser, selector engine, cascade (`StyleDict`), `RuleController`, `@import`/`@namespace`/`@dictionary`; OMA tree base (`OMA/_Node`) | `mp-cps`                    |
| Atem-Property-Language                               | ~2 400 | the expression language of CPS property values (stack/postfix parser, operators, selectors as values)                                                                          | `mp-cps::lang`              |
| Atem-MOM (es6 sources)                               | ~4 800 | **MOM** object model (Multivers › Univers › Master › Glyph › PenStroke/Contour › points); UFO importer (outline → skeleton strokes); renderer (`rendering/basics`); UFO/OTF exporters; Project persistence; CPS generators (interpolation/metapolation templates) | `mp-mom`, `mp-project`      |
| Atem-MOM/lib/cpsLib, metapolator-cpsLib              | 411    | `.cps` *data*: the default rules (`primary.cps`, `metamaster.cps`, weight/scale/…)                                                                                             | shipped as-is, `include_str!` |
| Atem-MOM-Toolkit, Atem-CPS-Toolkit                   | ~1 700 | UI-side caches (draw points, bbox, SVG providers), glyph UI service, drag & drop                                                                                              | `mp-ui` (re-designed)       |
| app/lib (this repo)                                  | ~9 000 | Angular UI: panels, design space, specimen, parameter editing; `models/metapolator` app model                                                                                  | `mp-ui`                     |
| bin/metapolator-*                                    | –      | CLI (stale since the v0.4 restructure; references removed modules)                                                                                                           | `mp-cli`                    |

The engine core (math → CPS → MOM → export) is roughly **15k lines of JS**.

## Architecture in one paragraph

A project is a UFO-like directory: `data/com.metapolator/{project.yaml,
MOM/*.master.yaml, CPS/*.cps}`. `MOM/` holds the object tree. A *base*
master stores imported skeleton data (pen strokes with left/right/center
points and their properties). A *derived* master (`base: <id>`) stores
only property overrides. Each master points to a CPS file, and CPS files
`@import` the library. **All geometry is computed lazily by the CPS
cascade.** Rendering asks a MOM node for its computed style, for example
`on`, `in`, `out`, `inTension`, `width`. The style evaluates
property-language expressions that refer to other nodes (`parent:`,
`baseNode:`, `master:`, selectors such as `S"master#master-regular"`).
Interpolation and metapolation are *generated* CPS
(`@import "generated://metapolation/0/2"`), produced from mustache templates.

## Crates (Cargo workspace at repo root, `crates/`)

| crate        | depends on                | notes                                                                                                        |
|--------------|---------------------------|--------------------------------------------------------------------------------------------------------------|
| `mp-math`    | –                         | f64 semantics must match V8. See "Floating point" below.                                                      |
| `mp-pens`    | mp-math                   | Port only the pens actually used by the renderer and exporters.                                               |
| `mp-cps`     | mp-math                   | Hand-written CPS tokenizer and parser, replacing gonzales. The OMA tree is generic over node kinds.           |
| `mp-mom`     | mp-cps, mp-pens, norad    | MOM node kinds, UFO importer, renderer, exporters (UFO via norad, OTF via `write-fonts`).                     |
| `mp-io`      | –                         | `trait Io`, `InMemory`, std-fs and (wasm) fetch backends, mounting.                                           |
| `mp-project` | mp-mom, mp-io             | persistence (yaml via `serde_yaml`), sessions, derived masters, CPS generators (templating replaces mustache) |
| `mp-cli`     | mp-project                | replaces `bin/metapolator-*`: `export`, `import`, `init`, …                                                   |
| `mp-wasm`    | mp-project                | `wasm-bindgen` API boundary                                                                                   |
| `mp-ui`      | mp-wasm (or direct)       | Rust web UI (Leptos, CSR, `trunk`). Re-implements the panels of `app/lib/ui/metapolator`.                    |

## Parity strategy

1. **End-to-end goldens** (`tests/golden/`, committed): UFO exports of every
   master of `tests/fixtures/v0.4.0-{min,full}`, produced by the pinned JS
   engine. The Rust exporter is compared **semantically**: parse both glif
   files and compare advance, unicodes, contours, point types and coordinates.
   ufoJS serialization (one-line XML, attribute order) is not a goal.
   Coordinates are compared exactly after the reference's 3-decimal rounding.
   Any mismatch gets a per-glyph diff report.
2. **Per-module differential probes**, as each layer is ported: a small Node
   probe runs the JS function on generated inputs and writes JSON next to the
   Rust test (for example `crates/mp-math/tests/data/hobby.json`). This
   catches divergence early instead of only at the end of the pipeline.
3. **Computed-style dumps** (to add in `golden.js` when `mp-cps` starts): for
   each glyph, the computed values of the properties the renderer reads. This
   localizes a mismatch to a property instead of a final outline point.

### Floating point

V8 implements `Math.sin/cos/atan2/exp/log/pow` with fdlibm ports
(`ieee754::`). Rust's `f64::sin` and friends call the platform libm natively
(glibc) and musl-derived `libm` on wasm32. Native and WASM builds could
therefore disagree with each other, not only with JS. `mp-math` routes
transcendental functions through a single facade so the choice is made in
one place, and the choice is **measured** against V8 (see
`notes/rust-port/` once the probe exists). `+ - * / sqrt` are IEEE-exact
everywhere, so only the transcendental functions matter.

## Phases

| # | phase                                                                                                 | done when                                                                                                     |
|---|-------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| 0 | JS reference harness, fixtures, goldens                                                               | **done** (`782866aa`)                                                                                         |
| 1 | workspace + `mp-math` (+ fp facade measurement)                                                       | differential probe passes                                                                                     |
| 2 | `mp-cps`: parser, selectors, cascade, property language                                               | the CPS test suites (`app/tests/lib/models/CPS`, Atem-CPS/Atem-Property-Language tests) ported and passing   |
| 3 | `mp-mom` model + project loading (`mp-io`, `mp-project`)                                              | fixtures load; computed-style dumps match                                                                     |
| 4 | renderer + UFO export                                                                                 | `tests/golden/*` match semantically, both fixtures, every master                                              |
| 5 | UFO import (skeleton inference), derived masters, generators, OTF export                              | import → export round trip matches JS on `data/fonts/subsets/*.ufo`                                           |
| 6 | `mp-cli`                                                                                              | feature parity with the useful parts of `bin/`                                                                |
| 7 | `mp-wasm` + `mp-ui`                                                                                   | the v0.4.0 demo workflow works in the browser: masters, design space, instances, specimen, parameter edits, export |
| 8 | delete JS (`app/`, `bower.json`, `package.json`, `bin/` scripts), update README/INSTALL               | `tools/js-reference` is the only JS left                                                                      |

## Open questions

- UI framework: Leptos is the default assumption. Revisit before phase 7.
- Whether to keep CPS source compatibility *exactly*, including the
  property-language quirks, or allow fixes. Default: exact, because the
  goldens and existing projects depend on it. Fixes come after parity, behind
  tests.
