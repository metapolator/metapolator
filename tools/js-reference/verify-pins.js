#!/usr/bin/env node
// Check the pinned JS dependency checkouts (deps.lock -> app/lib/bower_components)
// against the code actually deployed as Metapolator v0.4.0: the minified r.js
// bundle on upstream gh-pages.
//
// Minification keeps string literals (it may change their quoting), so for
// every named engine module in the bundle we tokenize both the bundled module
// and the source file with acorn and require that the bundled module's
// string-literal multiset is contained in the source's. "match" = no bundled
// literal is missing from the source.
//
//   git show upstream/gh-pages:v0.4.0/min/main.js > main.js
//   node tools/js-reference/verify-pins.js main.js            # summary
//   node tools/js-reference/verify-pins.js main.js -v         # every module
//
// Exit status 1 if any engine module mismatches or is missing.
"use strict";
var fs = require('fs')
  , path = require('path')
  , acorn = require(fs.existsSync('/usr/share/nodejs/acorn') ? '/usr/share/nodejs/acorn' : 'acorn')
  , ROOT = path.resolve(__dirname, '..', '..')
  , BOWER = path.join(ROOT, 'app', 'lib', 'bower_components')
  , PREFIX = {
        'Atem-CPS-whitelisting': 'Atem-CPS-whitelisting/lib'
      , 'Atem-CPS-Toolkit': 'Atem-CPS-Toolkit/lib'
      , 'Atem-CPS': 'Atem-CPS/lib'
      , 'Atem-Errors': 'Atem-Errors/lib'
      , 'Atem-IO': 'Atem-IO/lib'
      , 'Atem-Math-Tools': 'Atem-Math-Tools/lib'
      , 'Atem-Pen-Case': 'Atem-Pen-Case/lib'
      , 'Atem-Property-Language': 'Atem-Property-Language/lib'
      , 'Atem-Logging': 'Atem-Logging/lib'
      , 'Atem-MOM-Toolkit': 'Atem-MOM-Toolkit/lib'
      , 'Atem-MOM': 'Atem-MOM/lib'
      , 'obtain': 'obtainJS/lib'
      , 'ufojs': 'ufoJS/lib'
    }
  ;

// String literals of `code`, with constant `"a" + "b"` concatenations folded
// the way the minifier folds them. Identifier tokens are included too, because
// the minifier turns reserved-word property access (`x.delete`) into
// `x["delete"]`.
function strings(code, withIdentifiers) {
    var out = []
      , ast = acorn.parse(code, {ecmaVersion: 'latest', allowHashBang: true
                                , allowReturnOutsideFunction: true})
      ;
    function constStr(node) {
        if(node.type === 'Literal' && typeof node.value === 'string')
            return node.value;
        if(node.type === 'BinaryExpression' && node.operator === '+') {
            var l = constStr(node.left), r = constStr(node.right);
            if(l !== null && r !== null) return l + r;
        }
        return null;
    }
    (function walk(node) {
        if(!node || typeof node.type !== 'string') return;
        var c = constStr(node);
        if(c !== null) { if(c.length >= 4) out.push(c); return; }
        // `x + "a" + "b"` parses as ((x + "a") + "b"); the minifier folds the
        // literal tail too, so also emit the folded tail of such chains.
        if(node.type === 'BinaryExpression' && node.operator === '+') {
            var tail = [], n = node;
            while(n.type === 'BinaryExpression' && n.operator === '+'
                    && constStr(n.right) !== null) {
                tail.unshift(constStr(n.right));
                n = n.left;
            }
            if(tail.length > 1 && tail.join('').length >= 4) out.push(tail.join(''));
        }
        for(var k in node) {
            var v = node[k];
            if(Array.isArray(v)) v.forEach(walk);
            else if(v && typeof v.type === 'string') walk(v);
        }
    })(ast);
    if(withIdentifiers)
        for(var tok of acorn.tokenizer(code, {ecmaVersion: 'latest', allowHashBang: true}))
            if(tok.type === acorn.tokTypes.name || tok.type.keyword)
                out.push(tok.value);
    return out;
}

function count(arr) {
    var m = new Map();
    arr.forEach(function(s) { m.set(s, (m.get(s) || 0) + 1); });
    return m;
}

var bundle = fs.readFileSync(process.argv[2], 'utf8')
  , verbose = process.argv.indexOf('-v') !== -1
  , ast = acorn.parse(bundle, {ecmaVersion: 'latest'})
  , ok = 0, bad = 0, skipped = 0
  ;
// top-level `define("id", [...], factory)` calls, possibly in a sequence expr
var calls = [];
(function walk(node) {
    if(!node || typeof node.type !== 'string') return;
    if(node.type === 'CallExpression' && node.callee.type === 'Identifier'
            && node.callee.name === 'define' && node.arguments.length
            && node.arguments[0].type === 'Literal') {
        calls.push(node);
        return;
    }
    for(var k in node) {
        var v = node[k];
        if(Array.isArray(v)) v.forEach(walk);
        else if(v && typeof v.type === 'string') walk(v);
    }
})(ast);

calls.forEach(function(call) {
    var id = call.arguments[0].value
      , head = id.split('/')[0]
      , src, want, have, missing = []
      ;
    if(!(head in PREFIX)) { skipped++; return; }
    src = path.join(BOWER, PREFIX[head], id.split('/').slice(1).join('/') + '.js');
    if(!fs.existsSync(src)) { bad++; console.log('MISSING ', id); return; }
    // the bundled module minus the define id and its dependency list
    want = count(strings('(' + bundle.slice(call.arguments[call.arguments.length - 1].start,
                                            call.arguments[call.arguments.length - 1].end) + ')'));
    have = count(strings(fs.readFileSync(src, 'utf8'), true));
    want.forEach(function(n, s) { if((have.get(s) || 0) < n) missing.push(s); });
    if(missing.length) {
        bad++;
        console.log('DIFFERS ', id, missing.length + '/' + want.size,
                    JSON.stringify(missing.slice(0, 3)));
    } else {
        ok++;
        if(verbose) console.log('match   ', id);
    }
});
console.log(ok + ' match, ' + bad + ' differ/missing, ' + skipped
            + ' non-engine modules skipped');
process.exit(bad ? 1 : 0);
