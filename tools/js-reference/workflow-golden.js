#!/usr/bin/env node
// The Metapolator UI workflow with the original JS engine, as a reference
// for the Rust port (crates/mp-mom/tests/workflow.rs):
//
//   1. init a project
//   2. import UFOs like the UI: base-<name> (Project.import) plus the
//      editable master-<name> (createDerivedMaster with ui-master.cps)
//   3. create an instance metapolating the UI masters (instanceTools:
//      '@import "generated://metapolation/0/<n>";' plus baseMaster<i> and
//      proportion<i> element properties)
//   4. save, and export every master: UFO 3 (precision 3), UFO 2 unrounded
//      (what the UI exported), OTF. Export failures are recorded as
//      <master>.<kind>.error.
//
//   node tools/js-reference/workflow-golden.js OUTDIR NAME=UFODIR [NAME=UFODIR ...] \
//        --instance NAME=proportion,NAME=proportion,...
"use strict";
var path = require('path')
  , fs = require('fs')
  , amd = require('./amd.js')
  , ROOT = amd.ROOT
  ;

var args = process.argv.slice(2)
  , outDir = path.resolve(args.shift())
  , ufos = [], instance = null
  ;
while(args.length) {
    var a = args.shift();
    if(a === '--instance') instance = args.shift().split(',').map(function(x) { return x.split('='); });
    else ufos.push(a.split('='));
}
process.chdir(ROOT);

amd.require([
    'Atem-IO/io/staticNodeJS'
  , 'Atem-IO/io/InMemory'
  , 'Atem-MOM/project/Project'
  , 'Atem-MOM/cpsTools'
], function(diskIO, InMemory, Project, cpsTools) {
    if(fs.existsSync(outDir)) throw new Error('OUTDIR exists: ' + outDir);
    var mem = new InMemory()
      , mounts = [
            { io: diskIO, mountPoint: 'lib/MOM', pathOffset: 'app/lib/bower_components/Atem-MOM/lib/cpsLib' }
          , { io: diskIO, mountPoint: 'lib/metapolator', pathOffset: 'app/lib/bower_components/metapolator-cpsLib/lib' }
        ]
      , uiMasterCPS = fs.readFileSync(path.join(amd.BOWER, 'metapolator-cpsLib', 'lib', 'ui-master.cps'), 'utf8')
      , project = new Project(mem, 'project', undefined, mounts)
      , names = []
      ;
    project.init(false);
    ufos.forEach(function(u) {
        var base = project.import(false, 'base-' + u[0], u[1], undefined, diskIO)
          , ui = project.createDerivedMaster(false, base.id, 'master-' + u[0], uiMasterCPS);
        project.addMasterToSession(ui.id); // the UI passes the node, which breaks save()
        names.push(base.id, ui.id);
    });
    if(instance) {
        var cps = '@import "generated://metapolation/0/' + instance.length + '";'
          , inst = project.createDerivedMaster(false, 'master-' + instance[0][0], 'instance-0', cps)
          , items = [];
        project.addMasterToSession(inst.id);
        instance.forEach(function(ax, i) {
            items.push(cpsTools.makeProperty('baseMaster' + i, 'S"master#' + cpsTools.escapeSelectorName('master-' + ax[0]) + '"'));
            items.push(cpsTools.makeProperty('proportion' + i, parseFloat(ax[1])));
        });
        inst.properties.splice(0, inst.properties.length, items);
        inst.attachData('requiredMasters', instance.map(function(ax) { return 'master-' + ax[0]; }));
        names.push(inst.id);
    }
    project.save(false);
    mem.mkDir(false, 'out');
    names.forEach(function(name) {
        function attempt(kind, fn) {
            try { fn(); }
            catch(e) { mem.writeFile(false, 'out/' + name + '.' + kind + '.error', String(e && e.message || e).split('\n')[0] + '\n'); }
        }
        attempt('ufo', function() {
            project.exportUFOInstance(false, name, 'out/' + name + '.ufo', 3, undefined);
        });
        attempt('ufo2', function() {
            var genIo = project.getUFOExportGenerator(false, name, name + '.ufo2', 2, -1), gen = genIo[0];
            while(!gen.next().done);
            mem.mkDir(false, 'out/' + name + '.ufo2');
            genIo[1].copyRecursive(false, name + '.ufo2', mem, 'out/' + name + '.ufo2');
        });
        attempt('otf', function() {
            var genIo = project.getOTFExportGenerator(false, name, name + '.otf'), gen = genIo[0], step;
            while(!(step = gen.next()).done);
            mem.writeFile(false, 'out/' + name + '.otf', Buffer.from(step.value));
        });
    });
    fs.mkdirSync(path.join(outDir, 'project'), { recursive: true });
    mem.copyRecursive(false, 'project', diskIO, path.join(outDir, 'project'));
    mem.copyRecursive(false, 'out', diskIO, outDir);
    fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({
        ufos: ufos, instance: instance, masters: names }, null, 2) + '\n');
});
