// Shared setup for running the pinned JS engine under Node (used by golden.js
// and by the differential probes under crates/*/tests/probes/).
//
//   var amd = require('<repo>/tools/js-reference/amd.js');
//   amd.require(['Atem-CPS/CPS/parsing/parseRules', ...], function(parseRules, ...) {...});
//
// See README.md ("Workarounds") for why each shim exists.
"use strict";
var path = require('path')
  , ROOT = path.resolve(__dirname, '..', '..')
  , BOWER = path.join(ROOT, 'app', 'lib', 'bower_components')
  , requirejs = require(path.join(BOWER, 'r.js', 'dist', 'r.js'))
  , Module = require('module')
  , NODE_SHIMS = { lie: Promise }
  , origLoad = Module._load
  ;

// obtainJS asks for the 'lie' Promise polyfill; r.js ignores a configured
// nodeRequire, so hook Node's loader.
Module._load = function(request) {
    if(Object.prototype.hasOwnProperty.call(NODE_SHIMS, request))
        return NODE_SHIMS[request];
    return origLoad.apply(this, arguments);
};

// ufoJS: use its W3C branch with a pure-JS jsdom instead of libxmljs.
(function installDOM() {
    var JSDOM = require(path.join(__dirname, 'node_modules', 'jsdom')).JSDOM
      , win = new JSDOM('<!doctype html><html></html>').window
      ;
    ['window', 'document', 'DOMParser', 'XMLSerializer', 'XPathEvaluator'
    , 'XPathResult', 'Node'].forEach(function(k) {
        global[k] = k === 'window' ? win : win[k];
    });
    global.XSLTProcessor = undefined;
})();

requirejs.config({ baseUrl: path.join(ROOT, 'app', 'lib') });

var configured = null;
function configure() {
    if(!configured)
        configured = new Promise(function(resolve, reject) {
            requirejs(['bower_components/Atem-RequireJS-Config/nodeConfig'], function(configureFn) {
                configureFn({
                    baseUrl: path.join(ROOT, 'app', 'lib')
                  , bowerPrefix: 'bower_components'
                  , paths: { metapolator: './' }
                }, requirejs);
                resolve();
            }, reject);
        });
    return configured;
}

function fail(err) { console.error(err && err.stack || err); process.exit(1); }

exports.ROOT = ROOT;
exports.BOWER = BOWER;
exports.requirejs = requirejs;
exports.require = function(deps, callback) {
    configure().then(function() {
        requirejs(deps, function() {
            try { callback.apply(null, arguments); }
            catch(err) { fail(err); }
        }, fail);
    }, fail);
};
