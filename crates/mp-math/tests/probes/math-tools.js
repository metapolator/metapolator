#!/usr/bin/env node
// Differential probe: run the original JS Vector (complex), Transform and
// hobby functions (Atem-Math-Tools @ tools/js-reference/deps.lock) on seeded
// inputs and record the results bit-exactly for crates/mp-math/tests/math_tools.rs.
//
//   tools/js-reference/fetch-deps.sh   # once
//   node crates/mp-math/tests/probes/math-tools.js > crates/mp-math/tests/data/math-tools.json
//
// f64 values are 16-hex-digit bit patterns; strings (toString) are verbatim.
"use strict";
var path = require('path')
  , ROOT = path.resolve(__dirname, '..', '..', '..', '..')
  , BOWER = path.join(ROOT, 'tools', 'js-reference', 'legacy', 'app', 'lib', 'bower_components')
  , requirejs = require(path.join(BOWER, 'r.js', 'dist', 'r.js'))
  ;
requirejs.config({
    baseUrl: BOWER
  , paths: {
        'complex': 'complex/lib'
      , 'Atem-Math-Tools': 'Atem-Math-Tools/lib'
      , 'Atem-CPS-whitelisting': 'Atem-CPS-whitelisting/lib'
      , 'Atem-Errors': 'Atem-Errors/lib'
    }
});

var buf = new DataView(new ArrayBuffer(8));
function b(x) { buf.setFloat64(0, x); return buf.getBigUint64(0).toString(16).padStart(16, '0'); }
function bv(v) { return [b(v.x), b(v.y)]; }
var s = 0x2545F4914F6CDD1Dn;
function rnd() {
    s ^= s >> 12n; s ^= (s << 25n) & 0xFFFFFFFFFFFFFFFFn; s ^= s >> 27n;
    return Number(((s * 0x2545F4914F6CDD1Dn) & 0xFFFFFFFFFFFFFFFFn) >> 11n) / 9007199254740992;
}
function r(lo, hi) { return lo + (hi - lo) * rnd(); }
function coord() { return rnd() < 0.2 ? Math.round(r(-1000, 1000)) : r(-1000, 1000); }

requirejs(['Atem-Math-Tools/Vector', 'Atem-Math-Tools/transform', 'Atem-Math-Tools/hobby'
         , 'Atem-Math-Tools/utils'],
function(Vector, transform, hobby, utils) {
    var N = 300, out = { node: process.version, vector: [], transform: [], hobby: [], numstr: [] }
      , T = transform.Transform, i, v, w, n, t;
    for(i = 0; i < N; i++) {
        v = new Vector(coord(), coord()); w = new Vector(coord(), coord()); n = r(-10, 10);
        if(i % 25 === 0) w = new Vector(0, 0);
        out.vector.push({
            v: bv(v), w: bv(w), n: b(n)
          , add: bv(v['+'](w)), sub: bv(v['-'](w)), mul: bv(v['*'](w)), div: bv(v['/'](w))
          , muln: bv(v['*'](n)), divn: bv(v['/'](n))
          , mag: b(v.magnitude()), ang: b(v.angle()), polar: bv(Vector.fromPolar(n, v.angle()))
          , norm: b(utils.normalizeAngle(n)), str: String(v)
        });
    }
    for(i = 0; i < N; i++) {
        var aff = [r(-2, 2), r(-2, 2), r(-2, 2), r(-2, 2), coord(), coord()];
        if(i % 10 === 0) aff = [1, 0, 0, 1, 0, 0];
        t = new T(aff); var a = r(-7, 7), x = r(-1.5, 1.5), y = r(-1.5, 1.5), p = [coord(), coord()];
        out.transform.push({
            t: aff.map(b), p: p.map(b), a: b(a), x: b(x), y: b(y)
          , rotate: t.rotate(a).__affine().map(b), scale: t.scale(x, y).__affine().map(b)
          , scale1: t.scale(x).__affine().map(b), translate: t.translate(x, y).__affine().map(b)
          , skew: t.skew(x, y).__affine().map(b), inverse: t.inverse().__affine().map(b)
          , point: t.transformPoint(p).map(b), str: String(t), ps: t.toPS()
        });
    }
    // t.transform(other) for a second, independently seeded operand
    s = 0x1234567n;
    out.transform.forEach(function(rec) {
        var o = [r(-2, 2), r(-2, 2), r(-2, 2), r(-2, 2), coord(), coord()];
        rec.otherOperand = o.map(b);
        rec.other = new T(rec.t.map(function(h){ buf.setBigUint64(0, BigInt('0x'+h)); return buf.getFloat64(0); }))
                        .transform(new T(o)).__affine().map(b);
    });
    var tens = [0, Infinity, 0.75, 1, 1, 1.5, 3, r(0.5, 4)];
    for(i = 0; i < N; i++) {
        var z0 = new Vector(coord(), coord()), z1 = new Vector(coord(), coord())
          , d0 = r(-7, 7), d1 = r(-7, 7)
          , al = i % 3 ? r(0.6, 4) : tens[i % tens.length]
          , be = i % 5 ? r(0.6, 4) : tens[(i + 3) % tens.length]
          ;
        if(i % 20 === 0) z1 = z0; // zero-length segment
        var c = hobby.tension2control(z0, d0, al, be, d1, z1)
          , p1 = c[0], p2 = c[1]
          , q1 = new Vector(coord(), coord()), q2 = new Vector(coord(), coord())
          ;
        out.hobby.push({
            z0: bv(z0), z1: bv(z1), d0: b(d0), d1: b(d1), al: b(al), be: b(be)
          , q1: bv(q1), q2: bv(q2)
          , hobby: b(hobby.hobby(d0, d1))
          , t2m: hobby.tension2magnitude(z0, d0, al, be, d1, z1).map(b)
          , t2mOut: b(hobby.tension2magnitudeOut(z0, d0, al, d1, z1))
          , t2mIn: b(hobby.tension2magnitudeIn(z0, d0, be, d1, z1))
          , t2c: [bv(p1), bv(p2)]
          , t2cOut: bv(hobby.tension2controlOut(z0, d0, al, d1, z1))
          , t2cIn: bv(hobby.tension2controlIn(z0, d0, be, d1, z1))
          , m2t: hobby.magnitude2tension(z0, d0, al * 100, be * 100, d1, z1).map(b)
          , m2tOut: b(hobby.magnitude2tensionOut(z0, d0, al * 100, d1, z1))
          , m2tIn: b(hobby.magnitude2tensionIn(z0, d0, be * 100, d1, z1))
          , c2t: hobby.control2tension(z0, q1, q2, z1).map(b)
          , c2tOut: b(hobby.control2tensionOut(z0, q1, q2, z1))
          , c2tIn: b(hobby.control2tensionIn(z0, q1, q2, z1))
        });
    }
    var specials = [0, -0, 1, -1, 0.1, 1e21, 1e20, 1.5e-7, 1e-6, 123.456, 1/3, NaN
                  , Infinity, -Infinity, 2.5e300, 5e-324, 1.7976931348623157e308, 2**53, 0.000001234];
    for(i = 0; i < N; i++) specials.push(r(-1e6, 1e6) * Math.pow(10, Math.round(r(-30, 30))));
    out.numstr = specials.map(function(x) { return [b(x), String(x)]; });
    process.stdout.write(JSON.stringify(out) + '\n');
}, function(err) { console.error(err && err.stack || err); process.exit(1); });
