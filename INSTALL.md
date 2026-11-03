Metapolator Developer Installation Notes
========================================

These instructions are for developers. Metapolator is written in Rust: the
engine, a command line interface, and a web UI that runs as WebAssembly in
the browser. (Until v0.4 it was JavaScript: Node, bower and AngularJS. The
JS code that the port is tested against is kept reproducible in
`tools/js-reference/`.)


Prerequisites
-------------

- [Git](https://git-scm.com/)
- [Rust](https://rustup.rs/) 1.80 or newer, with the WebAssembly target:

      $ rustup target add wasm32-unknown-unknown

- [wasm-pack](https://rustwasm.github.io/wasm-pack/), for the web UI:

      $ cargo install wasm-pack


Get the code
------------

    $ git clone --recursive https://github.com/metapolator/metapolator.git
    $ cd metapolator

`--recursive` also clones the example submodules (`examples/Canola-*`). They
are in the project format from before v0.4 and are not loaded by the
current code.


Build and test
--------------

    $ cargo build --release
    $ cargo test --release

The tests compare the Rust output with golden files made by the original
JavaScript engine (`tests/golden*`). See `notes/rust-port/PLAN.md` for what
is checked, and `tools/js-reference/README.md` for how the goldens are made.


The web UI
----------

Build it into `target/ui` and serve it:

    $ tools/build-ui.sh
    $ target/release/metapolator serve

Then open <http://127.0.0.1:8080/>. The UI starts with the demo project of
Metapolator v0.4.0. To open a project from disk instead, name it:

    $ target/release/metapolator serve myfont -p 8080

Everything happens in the browser and nothing is written back to disk; use
*Save* and *Open…* in the menubar to keep a project as a ZIP file. `target/ui` is a
static site: any web server can host it (the `.wasm` file must be served
as `application/wasm`).

A headless browser test: `crates/mp-ui/tests/e2e/run.sh` (needs Chromium
and Node 20 or newer).


The command line
----------------

    $ target/release/metapolator help

For example, create a project, import a UFO the way the UI does, and
export the editable master as OTF and as UFO:

    $ target/release/metapolator init myfont
    $ target/release/metapolator import-ui data/fonts/subsets/Merriweather-Light-Subset-nop.ufo myfont --name light
    $ target/release/metapolator export myfont/master-light light.otf myfont/master-light light.ufo


Code layout
-----------

| crate     | what it is                                                                                   |
|-----------|----------------------------------------------------------------------------------------------|
| `mp-math` | vectors, transforms, Hobby splines; exact ports of V8's `Math` functions                     |
| `mp-cps`  | CPS: the CSS-like parser, selectors, the property language, the cascade                      |
| `mp-io`   | the virtual file system (memory, disk)                                                       |
| `mp-ufo`  | UFO reading and writing (GLIF, plist)                                                        |
| `mp-otf`  | the OpenType writer (port of opentype.js 0.6.3)                                              |
| `mp-mom`  | the Metapolator Object Model, projects, the CPS library, rendering, import and export        |
| `mp-app`  | the UI model: masters, design spaces, instances, parameters, specimen; zip import and export |
| `mp-cli`  | the `metapolator` command                                                                    |
| `mp-wasm` | a JavaScript API (wasm-bindgen) over `mp-app`                                                |
| `mp-ui`   | the web UI (Leptos)                                                                          |
