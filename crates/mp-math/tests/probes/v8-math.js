#!/usr/bin/env node
// Record V8's Math.{sin,cos,tan,atan2,exp,log,pow} bit-exactly on a fixed,
// reproducible input set, so Rust can be checked against the engine the JS
// Metapolator ran on.
//
//   node crates/mp-math/tests/probes/v8-math.js > crates/mp-math/tests/data/v8-math.json
//
// Output: {"node": version, "cases": {fn: [[argbits..., resultbits], ...]}}
// with every f64 as a 16-hex-digit bit pattern (no decimal round-trip doubts).
"use strict";
var buf = new DataView(new ArrayBuffer(8));
function bits(x) { buf.setFloat64(0, x); return buf.getBigUint64(0).toString(16).padStart(16, '0'); }

// xorshift64* -> uniform doubles; seeded, so the input set never changes
var s = 0x9E3779B97F4A7C15n;
function rnd() {
    s ^= s >> 12n; s ^= (s << 25n) & 0xFFFFFFFFFFFFFFFFn; s ^= s >> 27n;
    var r = (s * 0x2545F4914F6CDD1Dn) & 0xFFFFFFFFFFFFFFFFn;
    return Number(r >> 11n) / 9007199254740992; // [0,1)
}
function range(lo, hi) { return lo + (hi - lo) * rnd(); }

var PI = Math.PI, N = 1000, cases = {};
function add(name, fn, gen) {
    var out = [];
    for(var i = 0; i < N; i++) {
        var args = gen(i);
        out.push(args.map(bits).concat([bits(fn.apply(null, args))]));
    }
    cases[name] = out;
}
// angles as they occur in glyph geometry: mostly within a few turns
var angle = function() { return [range(-4 * PI, 4 * PI)]; };
add('sin', Math.sin, angle);
add('cos', Math.cos, angle);
add('tan', Math.tan, function() { return [range(-PI / 2 + 1e-3, PI / 2 - 1e-3)]; });
// coordinates in font units, including exact axis directions
add('atan2', Math.atan2, function(i) {
    if(i % 8 === 0) return [[0, 1, -1, 0][i / 8 % 4] * 100, [1, 0, 0, -1][i / 8 % 4] * 100];
    return [range(-2000, 2000), range(-2000, 2000)];
});
add('exp', Math.exp, function() { return [range(-20, 20)]; });
add('log', Math.log, function() { return [range(1e-6, 1e6)]; });
add('pow', Math.pow, function(i) {
    return i % 2 ? [range(0, 50), range(-4, 4)] : [range(0, 3000), 2];
});
process.stdout.write(JSON.stringify({ node: process.version, n: N, cases: cases }) + '\n');
