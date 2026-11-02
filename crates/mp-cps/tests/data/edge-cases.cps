/* hand-written edge cases; chunks are separated by lines of exactly slash-star-dash-dash-dash-star-slash and parsed independently */
@import 'lib/MOM/primary.cps';
/*---*/
@import "generated://metapolation/0/2";
/*---*/
@unknown foo bar;
/*---*/
glyph, master > glyph:i(-1), *, .klass, #anid, glyph#a.b.c { }
/*---*/
glyph {
    a: 1;
}
/*---*/
glyph {
    b: 1 + 2 * 3 - 4 / 5 ^ 6;
}
/*---*/
glyph {
    c: -5;
}
/*---*/
glyph {
    d: x-1;
}
/*---*/
glyph {
    e: x - 1;
}
/*---*/
glyph {
    f: (1 + 2) * 3;
}
/*---*/
glyph {
    g: parent:children[index - 1];
}
/*---*/
glyph {
    h: parent:children[index+1]:on;
}
/*---*/
glyph {
    i: S"master#master-regular":width;
}
/*---*/
glyph {
    j: Vector 1 2 + Polar 3 deg 45;
}
/*---*/
glyph {
    k: min 1000 base0:inTension * _p0;
}
/*---*/
glyph {
    l: List 1 2 3;
}
/*---*/
glyph {
    m: "a string" + "b";
}
/*---*/
glyph {
    n: tension2controlIn pointBefore:on pointBefore:outDir inTension inDir on;
}
/*---*/
glyph {
    o: 1 2;
}
/*---*/
glyph {
    p: (1;
}
/*---*/
glyph {
    q: Infinity;
}
/*---*/
glyph {
    r: -Infinity;
}
/*---*/
glyph {
    s: 5.;
}
/*---*/
glyph {
    t: .5e3;
}
/*---*/
glyph {
    u: minimum;
}
/*---*/
glyph {
    v: maxi + 1;
}
/*---*/
glyph {
    w: - (2 + x);
}
/*---*/
glyph {
    x: 2 * - 3;
}
/*---*/
glyph {
    y: Identity * Scaling 2 3;
}
/*---*/
glyph {
    z: Selector "glyph#" + this:id;
}
/*---*/
glyph {
    aa: master[Selector "glyph#" + this:id];
}
/*---*/
glyph {
    bb: /* comment */ 7 /* another */;
}
/*---*/
glyph {
    cc: 1
        + 2;
}
/*---*/
glyph {
    dd: _print 3;
}
/*---*/
glyph {
    ee: normalizeAngle -1;
}
/*---*/
glyph {
    ff: Transformation 1 0 0 1 10 20;
}
/*---*/
glyph {
    gg: a b c;
}
/*---*/
glyph {
    hh:;
}
/*---*/
glyph {
    ii: :;
}
/*---*/
glyph {
    jj: 3 * (4 + (5 - 6)) [0];
}
/*---*/
center:i(0)>left, center:i(-1) > right, a b > c d {
    on: Polar onLength onDir + parent:on;
}
/*---*/
@namespace("glyph penstroke") {
    center { x: 1; }
    @namespace("left, right") {
        * { y: 2; }
    }
}
/*---*/
@namespace(glyph) {
    contour > p { z: 3; }
}
/*---*/
a ~ b, a + b, ::before, :hover { bad: 1; }
/*---*/
@dictionary {
    dictprop: 4;
}
/*---*/
glyph {
    v: a ^ b;
}
/*---*/
glyph {
    v: a ~ b;
}
/*---*/
glyph {
    v: a ! b;
}
/*---*/
glyph {
    v: a @ b;
}
/*---*/
glyph {
    v: a $ b;
}
/*---*/
glyph {
    v: a % b;
}
/*---*/
glyph {
    v: a & b;
}
/*---*/
glyph {
    v: a | b;
}
/*---*/
glyph {
    v: a ? b;
}
/*---*/
glyph {
    v: a < b;
}
/*---*/
glyph {
    v: a > b;
}
/*---*/
glyph {
    v: a = b;
}
/*---*/
glyph {
    v: a # b;
}
/*---*/
glyph {
    v: a ` b;
}
/*---*/
glyph {
    v: a \\ b;
}
/*---*/
glyph {
    v: a ' b;
}
/*---*/
glyph {
    v: 'single';
}
/*---*/
glyph {
    v: a . b;
}
/*---*/
glyph {
    v: a , b;
}
/*---*/
glyph {
    v: a [ b ];
}
/*---*/
glyph {
    v: a { b };
}
/*---*/
glyph {
    v: S'x';
}
/*---*/
glyph {
    v: url(x);
}
/*---*/
glyph {
    v: #abc;
}
/*---*/
glyph {
    v: 1 !important;
}
/*---*/
glyph {
    v: 1px;
}
/*---*/
glyph {
    v: 50%;
}
/*---*/
glyph {
    v: rgb(1,2,3);
}
/*---*/
glyph {
    v: a/b;
}
/*---*/
glyph {
    v: a,b;
}
/*---*/
glyph {
    v: a=b;
}
/*---*/
glyph {
    v: @x;
}
/*---*/
glyph {
    v: a:b:c;
}
/*---*/
glyph {
    v: -a;
}
/*---*/
glyph {
    v: --a;
}
/*---*/
glyph {
    v: a--b;
}
/*---*/
glyph {
    v: 1e;
}
/*---*/
glyph {
    v: 1e+;
}
/*---*/
glyph {
    v: x.y;
}
/*---*/
glyph {
    v: "unterminated;
}
/*---*/
glyph {
    v: a"b"c;
}
/*---*/
glyph {
    v: é;
}
/*---*/
glyph {
    v: a	b;
}
/*---*/
glyph {
    v: $x;
}
/*---*/
glyph {
    v: *x;
}
/*---*/
glyph {
    v: x*y;
}
/*---*/
glyph {
    v: 2*3;
}
/*---*/
glyph {
    v: -1-1;
}
/*---*/
glyph {
    v: a+-1;
}
/*---*/
glyph {
    v: 3 - -2;
}
/*---*/
glyph {
    v: (-2);
}
/*---*/
glyph {
    v: a[-1];
}
/*---*/
glyph {
    v: [1];
}
/*---*/
glyph {
    v: ();
}
/*---*/
glyph {
    v: +1;
}
/*---*/
glyph {
    v: 1 +;
}
/*---*/
glyph {
    v: "a;b";
}
/*---*/
glyph {
    v: S"a;b";
}
/*---*/
glyph {
    -x: 1;
}
/*---*/
glyph {
    _x: 1;
}
/*---*/
glyph {
    x-y: 1;
}
/*---*/
glyph {
    1x: 1;
}
/*---*/
glyph {
    x1: 1;
}
/*---*/
glyph {
    x_1: 1;
}
/*---*/
glyph {
    $x: 1;
}
/*---*/
glyph {
    *x: 1;
}
/*---*/
a ~ b {
    x: 1;
}
/*---*/
a + b {
    x: 1;
}
/*---*/
:hover {
    x: 1;
}
/*---*/
::before {
    x: 1;
}
/*---*/
a:i(x) {
    x: 1;
}
/*---*/
a:i() {
    x: 1;
}
/*---*/
a:i(1.5) {
    x: 1;
}
/*---*/
a:i(+2) {
    x: 1;
}
/*---*/
a:i( -3 ) {
    x: 1;
}
/*---*/
a:nth-child(2) {
    x: 1;
}
/*---*/
glyph#a\.b {
    x: 1;
}
/*---*/
*.c {
    x: 1;
}
/*---*/
a.b:i(0)#c {
    x: 1;
}
/*---*/
a  >  b {
    x: 1;
}
/*---*/
a >b {
    x: 1;
}
/*---*/
a> b {
    x: 1;
}
/*---*/
a
>
b {
    x: 1;
}
/*---*/
glyph { a: 1 }
/*---*/
glyph { a: 1;; b: 2; }
/*---*/
glyph { }
/*---*/
glyph {}
master {}
/*---*/
glyph {
    a: 1;
    a: x-1;
}
/*---*/
glyph {
    a: 1;
    a: 2;
}
/*---*/
@import "x" "y";
/*---*/
@import x;
/*---*/
@import url(x);
/*---*/
@import 'a';
@import 'b';
glyph { a: 1; }
/*---*/
@namespace("a, b") { c { d: 1; } }
/*---*/
@namespace('a') { c { d: 1; } }
/*---*/
@namespace(a b) { c { d: 1; } }
/*---*/
@namespace("a ~ b") { c { d: 1; } }
/*---*/
@namespace { c { d: 1; } }
/*---*/
@namespace("x") { }
/*---*/
/* only a comment */
/*---*/

