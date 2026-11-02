#!/usr/bin/env node
// Drive the original JS Metapolator engine (Atem-MOM + Atem-CPS + cpsLib)
// headless under Node and dump reference ("golden") outputs that the Rust
// port is tested against.
//
//   node tools/js-reference/golden.js PROJECTDIR OUTDIR [master ...]
//
// For every master (default: all persisted masters of the project) writes
//   OUTDIR/<master>.ufo/   UFO export (ufoJS UFOWriter via Atem-MOM UFOExporter)
//   OUTDIR/<master>.ufo2/  UFO 2 export without rounding, as the UI exported
//   OUTDIR/<master>.otf    OTF export (opentype.js via Atem-MOM OTFExporter)
// and OUTDIR/manifest.json listing what was exported (OTF errors included).
//
// PROJECTDIR is a v0.4-format project (see extract-fixtures.sh).
"use strict";

var path = require('path')
  , fs = require('fs')
  , amd = require('./amd.js')
  , ROOT = amd.ROOT
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

amd.require([
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
        manifest.otf = {};
        masters.forEach(function(name) {
            console.warn('exporting', name);
            project.exportUFOInstance(false, name, 'out/' + name + '.ufo', 3, undefined);
            manifest.masters.push(name);
            // what the UI's font export did: UFO 2, precision -1 (no rounding)
            (function() {
                var genIo = project.getUFOExportGenerator(false, name, name + '.ufo2', 2, -1)
                  , gen = genIo[0];
                while(!gen.next().done);
                mem.mkDir(false, 'out/' + name + '.ufo2');
                genIo[1].copyRecursive(false, name + '.ufo2', mem, 'out/' + name + '.ufo2');
            })();
            // OTF via opentype.js; errors are part of the reference behaviour.
            // Project.getOTFInstance is broken upstream (calls `do_export`),
            // the UI used getOTFExportGenerator, so do the same.
            try {
                var genIo = project.getOTFExportGenerator(false, name, name + '.otf')
                  , gen = genIo[0], step;
                while(!(step = gen.next()).done);
                mem.writeFile(false, 'out/' + name + '.otf', Buffer.from(step.value));
                manifest.otf[name] = 'ok';
            }
            catch(e) {
                manifest.otf[name] = 'error: ' + (e && e.message || e);
            }
        });

        if(fs.existsSync(outDir))
            throw new Error('OUTDIR exists, refusing to overwrite: ' + outDir);
        fs.mkdirSync(outDir, { recursive: true });
        mem.copyRecursive(false, 'out', diskIO, outDir);
        fs.writeFileSync(path.join(outDir, 'manifest.json'),
                         JSON.stringify(manifest, null, 2) + '\n');
});
