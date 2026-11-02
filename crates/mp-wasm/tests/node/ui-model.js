// The UI model golden (tests/golden-ui-model/default-project, made by
// tools/js-reference/ui-model-golden.js) replayed through the WASM build:
// does wasm32 give the same numbers and bytes as V8 (and as the native
// build, crates/mp-app/tests/ui_model.rs)?
//
//   node crates/mp-wasm/tests/node/ui-model.js PKGDIR
//
// PKGDIR: `wasm-pack build crates/mp-wasm --target nodejs --out-dir PKGDIR`
// (run.sh does both). Exit status 0 if everything matches.
"use strict";
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const { Metapolator, specimenGlyphsOut } = require(path.join(path.resolve(process.argv[2]), 'mp_wasm.js'));
const unzip = require('./unzip.js');

const steps = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/js-reference/ui-model-steps.json'), 'utf8'));
const golden = path.join(ROOT, 'tests/golden-ui-model/default-project');
const want = JSON.parse(fs.readFileSync(path.join(golden, 'steps.json'), 'utf8'));
const failures = [];
let undefinedInJS = 0;

// JS ParameterModel.clone leaves a duplicated master's effective values
// undefined until recomputed (notes/rust-port/upstream-bugs.md, 17)
function walk(p, h, w, dup, diffs) {
    if (h && w && typeof h === 'object' && typeof w === 'object') {
        if (Array.isArray(h) !== Array.isArray(w)) return diffs.push(p + ': types differ');
        const hk = Object.keys(h), wk = Object.keys(w);
        if (hk.join('\0') !== wk.join('\0')) return diffs.push(p + ': keys differ');
        for (const k of hk)
            walk(p + '/' + k, h[k], w[k], dup || ((p === '/widths' || p === '/weights') && k !== 'master-regular'), diffs);
        return;
    }
    if (typeof h === 'string' && w === null && dup) { undefinedInJS++; return; }
    if (h !== w) diffs.push(p + ': ' + JSON.stringify(h) + ', JS ' + JSON.stringify(w));
}
function compare(have, w) {
    const diffs = [];
    for (const k of ['widths', 'weights', 'instances']) walk('/' + k, have[k], w[k], false, diffs);
    diffs.slice(0, 4).forEach(d => failures.push(JSON.stringify(w.step) + ': ' + d));
    if (diffs.length > 4) failures.push(JSON.stringify(w.step) + ': ' + diffs.length + ' differences in all');
}

const t0 = Date.now();
const m = Metapolator.withDefaultProject();
m.measureMaster('master-regular');
const wg = JSON.stringify(steps.weightGlyphs);
compare(JSON.parse(m.uiSnapshot(wg)), want[0]);
steps.steps.forEach((s, k) => {
    m.applyUiStep(JSON.stringify(s));
    compare(JSON.parse(m.uiSnapshot(wg)), want[k + 1]);
});

let same = 0;
const manifest = JSON.parse(fs.readFileSync(path.join(golden, 'manifest.json'), 'utf8'));
for (const name of manifest.exported) {
    const otf = Buffer.from(m.exportOtf(name));
    if (otf.equals(fs.readFileSync(path.join(golden, name + '.otf')))) same++;
    else failures.push(name + '.otf differs');
    const files = unzip(Buffer.from(m.exportUfoZip(name, name)));
    const prefix = name + '.ufo/';
    let n = 0;
    for (const [f, data] of files) {
        n++;
        const g = path.join(golden, name + '.ufo2', f.slice(prefix.length));
        if (fs.existsSync(g) && data.equals(fs.readFileSync(g))) same++;
        else if (failures.length < 40) failures.push(name + ' UFO 2: ' + f + ' differs');
    }
    const count = d => fs.readdirSync(d, { withFileTypes: true }).reduce((a, e) => a + (e.isDirectory() ? count(path.join(d, e.name)) : 1), 0);
    const wantN = count(path.join(golden, name + '.ufo2'));
    if (n !== wantN) failures.push(name + ': ' + n + ' UFO files, JS ' + wantN);
}
for (const c of JSON.parse(fs.readFileSync(path.join(golden, 'specimen.json'), 'utf8'))) {
    const have = specimenGlyphsOut(c.text, c.filter, c.strict);
    if (have !== JSON.stringify(c.glyphsOut)) failures.push('specimen ' + JSON.stringify(c.text) + ': ' + have);
}
console.log(`snapshots: ${want.length} compared; ${undefinedInJS} values undefined in the JS after duplication`);
console.log(`exports: ${same} files identical`);
console.log(`time: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (failures.length) {
    console.log(failures.length + ' failures:\n' + failures.join('\n'));
    process.exit(1);
}
console.log('OK: the WASM build matches the JS golden');
