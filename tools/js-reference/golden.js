#!/usr/bin/env node
// Drive the original JS Metapolator engine (Atem-MOM + Atem-CPS + cpsLib)
// headless under Node and dump reference ("golden") outputs that the Rust
// port is tested against.
//
//   node tools/js-reference/golden.js PROJECTDIR OUTDIR [master ...]
//
// For every master (default: all persisted masters of the project) writes
//   OUTDIR/<master>.ufo/   UFO export (ufoJS UFOWriter via Atem-MOM UFOExporter)
// and OUTDIR/manifest.json listing what was exported.
//
// PROJECTDIR is a v0.4-format project (see extract-fixtures.sh).
"use strict";

var path = require('path')
  , fs = require('fs')
  , ROOT = path.resolve(__dirname, '..', '..')
  , BOWER = path.join(ROOT, 'app', 'lib', 'bower_components')
  , requirejs = require(path.join(BOWER, 'r.js', 'dist', 'r.js'))
  ;

function usage() {
    console.error('usage: golden.js PROJECTDIR OUTDIR [master ...]');
    process.exit(2);
}

var args = process.argv.slice(2);
if(args.length < 2) usage();
var projectDir = path.resolve(args[0])
  , outDir = path.resolve(args[1])
  , onlyMasters = args.slice(2)
  ;
process.chdir(ROOT);

// Node modules the engine pulls in via require.nodeRequire. npm is not used:
// 'lie' (an ES6 Promise polyfill, obtainJS/lib/Promise.js) is the native one.
// r.js ignores a configured nodeRequire, so hook Node's loader instead.
var Module = require('module')
  , NODE_SHIMS = { lie: Promise }
  , origLoad = Module._load
  ;
Module._load = function(request) {
    if(Object.prototype.hasOwnProperty.call(NODE_SHIMS, request))
        return NODE_SHIMS[request];
    return origLoad.apply(this, arguments);
};

// ufoJS/lib/xml/main.js has a Node branch that needs jsdom<=9 internals plus
// libxmljs (a native addon that does not build on current Node). Expose a
// current, pure-JS jsdom window instead, so ufoJS takes its W3C/browser branch.
(function installDOM() {
    var JSDOM = require('jsdom').JSDOM
      , win = new JSDOM('<!doctype html><html></html>').window
      ;
    ['window', 'document', 'DOMParser', 'XMLSerializer', 'XPathEvaluator'
    , 'XPathResult', 'Node'].forEach(function(k) {
        global[k] = k === 'window' ? win : win[k];
    });
    global.XSLTProcessor = undefined; // referenced, never used by ufoJS here
})();

requirejs.config({ baseUrl: path.join(ROOT, 'app', 'lib') });

requirejs(['bower_components/Atem-RequireJS-Config/nodeConfig'], function(configure) {
    configure({
        baseUrl: path.join(ROOT, 'app', 'lib')
      , bowerPrefix: 'bower_components'
      , paths: { metapolator: './' }
    }, requirejs);

    requirejs([
        'Atem-IO/io/staticNodeJS'
      , 'Atem-IO/io/InMemory'
      , 'Atem-MOM/project/Project'
    ], function(diskIO, InMemory, Project) {
        // Work on an in-memory copy like the browser app (app/lib/main.js):
        // Project writes log.yaml into the project dir, and UFOWriter refuses
        // to export into an existing directory.
        var mem = new InMemory()
          , cpsLibIoMounts = [
                // Atem-IO Mounting strips a leading '/' from pathOffset, so
                // these are relative to ROOT (the cwd, see process.chdir).
                { io: diskIO, mountPoint: 'lib/MOM'
                , pathOffset: 'app/lib/bower_components/Atem-MOM/lib/cpsLib' }
              , { io: diskIO, mountPoint: 'lib/metapolator'
                , pathOffset: 'app/lib/bower_components/metapolator-cpsLib/lib' }
            ]
          , project, masters
          , manifest = { project: path.relative(ROOT, projectDir), masters: [] }
          ;
        mem.mkDir(false, 'project');
        diskIO.copyRecursive(false, projectDir, mem, 'project');
        mem.mkDir(false, 'out');

        project = new Project(mem, 'project', undefined, cpsLibIoMounts);
        project.load(false);
        masters = onlyMasters.length ? onlyMasters : project._persistedMasters.slice();
        masters.sort();
        // Open every persisted master first: derived masters (interpolations)
        // query their sources by id (e.g. master#master-regular), which only
        // resolves for open masters. bin/metapolator-export did the same.
        project._persistedMasters.slice().sort().forEach(function(name) {
            project.openMaster(false, name);
        });
        masters.forEach(function(name) {
            console.warn('exporting', name);
            project.exportUFOInstance(false, name, 'out/' + name + '.ufo', 3, undefined);
            manifest.masters.push(name);
        });

        if(fs.existsSync(outDir))
            throw new Error('OUTDIR exists, refusing to overwrite: ' + outDir);
        fs.mkdirSync(outDir, { recursive: true });
        mem.copyRecursive(false, 'out', diskIO, outDir);
        fs.writeFileSync(path.join(outDir, 'manifest.json'),
                         JSON.stringify(manifest, null, 2) + '\n');
    }, function(err) { console.error(err && err.stack || err); process.exit(1); });
}, function(err) { console.error(err && err.stack || err); process.exit(1); });
