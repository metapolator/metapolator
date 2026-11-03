#!/usr/bin/env node
// Differential probe: parse CPS sources and Property-Language formulas with
// the original JS engine (Atem-CPS + Atem-Property-Language, pinned in
// tools/js-reference/deps.lock) and dump the result as JSON for
// crates/mp-cps/tests/cps_parse.rs.
//
//   node crates/mp-cps/tests/probes/cps-parse.js > crates/mp-cps/tests/data/cps-parse.json
//
// Inputs: every .cps of the two CPS libraries and of tests/fixtures, the
// generated interpolation/metapolation CPS for 0..4 masters,
// the /*---*/-separated chunks of tests/data/edge-cases.cps (each parsed on
// its own), and the selector strings in tests/data/selectors.txt.
"use strict";
var fs = require('fs')
  , path = require('path')
  , amd = require('../../../../tools/js-reference/amd.js')
  , ROOT = amd.ROOT
  , HERE = __dirname
  ;
// the engine reports invalid properties via console.info/warn/log: keep
// stdout for the JSON result only
console.info = console.warn = console.log = console.error;

function listCPS(dir) {
    var out = [];
    (function walk(d) {
        fs.readdirSync(d).sort().forEach(function(n) {
            var p = path.join(d, n);
            if(fs.statSync(p).isDirectory()) walk(p);
            else if(n.slice(-4) === '.cps') out.push(p);
        });
    })(dir);
    return out;
}

var buf = new DataView(new ArrayBuffer(8));
function bits(x) { buf.setFloat64(0, x); return buf.getBigUint64(0).toString(16).padStart(16, '0'); }

amd.require([
    'Atem-CPS/CPS/parsing/parseRules'
  , 'Atem-CPS/CPS/parsing/parseSelectorList'
  , 'Atem-CPS/CPS/elements/PropertyCollection'
  , 'Atem-CPS/CPS/elements/AtNamespaceCollection'
  , 'Atem-CPS/CPS/elements/AtImportCollection'
  , 'Atem-CPS/CPS/elements/Rule'
  , 'Atem-CPS/CPS/elements/Comment'
  , 'Atem-CPS/CPS/elements/GenericCPSNode'
  , 'Atem-CPS/CPS/elements/Property'
  , 'Atem-CPS/CPS/elements/SelectorList'
  , 'Atem-CPS/CPS/SelectorEngine'
  , 'Atem-MOM/cpsTools'
  , 'Atem-Property-Language/parsing/NameToken'
  , 'Atem-Property-Language/parsing/OperatorToken'
  , 'Atem-MOM/cpsGenerators/interpolation'
  , 'Atem-MOM/cpsGenerators/metapolation'
], function(parseRules, parseSelectorList, PropertyCollection, AtNamespaceCollection
          , AtImportCollection, Rule, Comment, GenericCPSNode, Property, SelectorList
          , SelectorEngine, cpsTools, NameToken, OperatorToken, interpolation, metapolation) {

    function dumpSelectorList(sl) {
        return {
            invalid: sl.invalid, message: sl.message || null, str: String(sl)
          , selectors: sl.value.map(function(cs) {
                return { str: String(cs), normalized: cs.normalizedName, invalid: cs.invalid
                       , message: cs.message || null
                       , specificity: cs.invalid ? null : cs.specificity };
            })
        };
    }
    function dumpStackItem(item) {
        if(typeof item === 'number') return { n: bits(item) };
        if(typeof item === 'string') return { s: item };
        if(item instanceof SelectorList) return { sel: String(item) };
        if(item instanceof NameToken) return { name: item.literal };
        if(item instanceof OperatorToken) return { op: item.literal, consumes: item.consumes };
        return { unknown: String(item) };
    }
    function dumpProperty(p) {
        var out = { name: p.name, value: p.value.valueString, invalid: p.invalid };
        if(p.invalid) out.message = p.message;
        else out.stack = p.value.value._stack._stack.map(dumpStackItem);
        return out;
    }
    function dumpItems(items) {
        return items.map(function(item) {
            if(item instanceof Rule)
                return { rule: dumpSelectorList(item.getSelectorList())
                       , properties: item.properties.items.map(function(p) {
                            return p instanceof Property ? dumpProperty(p)
                                 : p instanceof Comment ? { comment: p.value }
                                 : { generic: String(p) };
                         }) };
            if(item instanceof AtImportCollection)
                return { import: item.resourceName };
            if(item instanceof AtNamespaceCollection)
                return { namespace: item.selectorList ? dumpSelectorList(item.selectorList) : null
                       , items: dumpItems(item.items) };
            if(item instanceof PropertyCollection)
                return { collection: item.name, items: dumpItems(item.items) };
            if(item instanceof Comment) return { comment: item.value };
            if(item instanceof GenericCPSNode) return { generic: String(item), type: item.type };
            if(item instanceof Property) return { property: dumpProperty(item) };
            return { unknown: String(item) };
        });
    }
    var empty = new PropertyCollection([], 'stub', 0)
      , api = {
            initializePropertyValue: cpsTools.initializePropertyValue
          , selectorEngine: new SelectorEngine()
          , getRule: function() { return empty; }
        }
      , sources = []
      , out = { node: process.version, files: [], selectors: [] }
      , n
      ;
    [ path.join(amd.BOWER, 'Atem-MOM', 'lib', 'cpsLib')
    , path.join(amd.BOWER, 'metapolator-cpsLib', 'lib')
    , path.join(ROOT, 'tests', 'fixtures')
    ].forEach(function(dir) {
        listCPS(dir).forEach(function(p) {
            sources.push([path.relative(ROOT, p), fs.readFileSync(p, 'utf8')]);
        });
    });
    for(n = 0; n <= 4; n++) {
        sources.push(['generated://interpolation/0/' + n, interpolation(n)]);
        sources.push(['generated://metapolation/0/' + n, metapolation(n)]);
    }
    fs.readFileSync(path.join(HERE, '..', 'data', 'edge-cases.cps'), 'utf8')
      .split('\n/*---*/\n').forEach(function(chunk, i) {
        sources.push(['edge-cases.cps#' + i, chunk]);
    });
    sources.forEach(function(src) {
        var rec = { name: src[0], source: src[1] };
        try { rec.items = dumpItems(parseRules.fromString(src[1], src[0], api).items); }
        catch(e) { rec.error = String(e.message || e); }
        out.files.push(rec);
    });
    fs.readFileSync(path.join(HERE, '..', 'data', 'selectors.txt'), 'utf8').split('\n')
      .filter(function(l) { return l.length && l[0] !== '#'; })
      .forEach(function(line) {
        var rec = { input: line };
        try { rec.result = dumpSelectorList(parseSelectorList.fromString(line)); }
        catch(e) { rec.error = String(e.message || e); }
        out.selectors.push(rec);
    });
    process.stdout.write(JSON.stringify(out, null, 1) + '\n');
});
