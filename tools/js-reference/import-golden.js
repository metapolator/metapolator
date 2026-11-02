#!/usr/bin/env node
// Import UFOs with the original JS engine (Atem-MOM UFOImporter) into a fresh
// project and record what came out, as the reference for the Rust importer.
//
//   node tools/js-reference/import-golden.js OUTDIR UFODIR [UFODIR ...]
//
// For every UFODIR (relative to the repo root) writes
//   OUTDIR/<name>/project/   the saved in-memory project (MOM/*.yaml, CPS/*, ...)
//   OUTDIR/<name>/export.ufo the imported master exported again as UFO
//                            (precision 3, like golden.js)
// where <name> is the UFO directory name without ".ufo"; the master is
// called "base-<name>".
"use strict";
var path = require('path')
  , fs = require('fs')
  , amd = require('./amd.js')
  , ROOT = amd.ROOT
  ;

var args = process.argv.slice(2);
if(args.length < 2) {
    console.error('usage: import-golden.js OUTDIR UFODIR [UFODIR ...]');
    process.exit(2);
}
var outDir = path.resolve(args[0])
  , ufos = args.slice(1)
  ;
process.chdir(ROOT);

amd.require([
    'Atem-IO/io/staticNodeJS'
  , 'Atem-IO/io/InMemory'
  , 'Atem-MOM/project/Project'
], function(diskIO, InMemory, Project) {
    if(fs.existsSync(outDir))
        throw new Error('OUTDIR exists, refusing to overwrite: ' + outDir);
    fs.mkdirSync(outDir, { recursive: true });
    ufos.forEach(function(ufo) {
        var name = path.basename(ufo).replace(/\.ufo$/, '')
          , mem = new InMemory()
          , mounts = [
                { io: diskIO, mountPoint: 'lib/MOM'
                , pathOffset: 'app/lib/bower_components/Atem-MOM/lib/cpsLib' }
              , { io: diskIO, mountPoint: 'lib/metapolator'
                , pathOffset: 'app/lib/bower_components/metapolator-cpsLib/lib' }
            ]
          , project, master, target = path.join(outDir, name)
          ;
        console.warn('importing', ufo);
        // init() creates the project directory itself
        project = new Project(mem, 'project', undefined, mounts);
        project.init(false);
        master = project.import(false, 'base-' + name, ufo, undefined, diskIO);
        project.save(false);
        mem.mkDir(false, 'out');
        project.exportUFOInstance(false, master.id, 'out/export.ufo', 3, undefined);
        fs.mkdirSync(path.join(target, 'project'), { recursive: true });
        mem.copyRecursive(false, 'project', diskIO, path.join(target, 'project'));
        mem.copyRecursive(false, 'out', diskIO, target);
    });
});
