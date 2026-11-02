#!/usr/bin/env node
// The Metapolator UI model with the original JS code, as a reference for
// crates/mp-app (tests/ui_model.rs): AppModel, MasterSequenceModel,
// ParameterModel/OperatorModel (the parameter panel), the master
// duplication of the master panel, instanceTools and InstanceModel (the
// design space panel), and the specimen panel's text → glyphs logic.
//
//   node tools/js-reference/ui-model-golden.js OUTDIR
//
// Writes OUTDIR/steps.json (the effective parameter values after every
// step), OUTDIR/specimen.json, and the exports after the last step:
// OUTDIR/<master>.ufo2/ (UFO 2, unrounded: the UI's export) and
// OUTDIR/<master>.otf. The project is the deployed v0.4.0 default
// (tests/fixtures/v0.4.0-full). The steps are listed in STEPS below; the
// Rust test replays the same list.
"use strict";
var path = require('path')
  , fs = require('fs')
  , amd = require('./amd.js')
  , ROOT = amd.ROOT
  , outDir = path.resolve(process.argv[2] || '')
  ;
if(!process.argv[2]) { console.error('usage: ui-model-golden.js OUTDIR'); process.exit(2); }
process.chdir(ROOT);

// the specimen controller wants jquery for its layout timer only
amd.requirejs.define('jquery', [], function() { return function() { return { css: function() {} }; }; });

var STEPS = JSON.parse(fs.readFileSync(path.join(__dirname, 'ui-model-steps.json'), 'utf8'));

amd.require([
    'Atem-IO/io/staticNodeJS'
  , 'Atem-IO/io/InMemory'
  , 'Atem-MOM/project/Project'
  , 'metapolator/models/metapolator/AppModel'
  , 'metapolator/ui/metapolator/ui-tools/selectionTools'
  , 'metapolator/ui/metapolator/ui-tools/instanceTools'
  , 'metapolator/ui/metapolator/specimen-panel/specimen-field/specimen-field-controller'
], function(diskIO, InMemory, Project, AppModel, selection, instanceTools, SpecimenFieldController) {
    if(fs.existsSync(outDir)) throw new Error('OUTDIR exists: ' + outDir);
    var mem = new InMemory()
      , mounts = [
            { io: diskIO, mountPoint: 'lib/MOM', pathOffset: 'app/lib/bower_components/Atem-MOM/lib/cpsLib' }
          , { io: diskIO, mountPoint: 'lib/metapolator', pathOffset: 'app/lib/bower_components/metapolator-cpsLib/lib' }
        ]
      , project = new Project(mem, 'project', undefined, mounts)
      , model, sequence, operatorId = 0, record = []
      ;
    mem.mkDir(false, 'project');
    diskIO.copyRecursive(false, 'tests/fixtures/v0.4.0-full', mem, 'project');
    project.load(false);
    project.openSession(false);

    // main.js: modelFactory + loadMOMmastersIntoMetapolator
    model = new AppModel(project);
    model.addInstanceSequence('Family 1');
    model.createNewDesignSpace();
    sequence = model.addSequence('Sequence 1');
    project.controller.queryAll('master').forEach(function(m) {
        if(m.id.indexOf('master-') === 0)
            sequence.addMaster(m.id, m, project.controller.getCPSName(m));
    });
    selection.injectSequences(model.masterSequences);
    selection.updateSelection('master');

    function master(name) {
        return sequence.children.filter(function(m) { return m.name === name; })[0];
    }
    function display(m) {
        // every glyph is shown once (glyph directive: checkIfIsDisplayed)
        m.children.forEach(function(g) { g.checkIfIsDisplayed(); });
    }
    function drawMaster(mom) {
        mom.children.forEach(function(g) {
            try { g.getComputedStyle().get('width'); } catch(e) { /* drawn with an error */ }
        });
    }
    function byName(list, name) { return list.filter(function(x) { return x.name === name; })[0]; }
    function selectMasters(names) {
        sequence.children.forEach(function(m) { m.edit = names.indexOf(m.name) !== -1; m.deselectAllChildren(); });
        selection.updateSelection('master');
    }
    function selectGlyphs(pairs) {
        sequence.children.forEach(function(m) { m.deselectAllChildren(); });
        pairs.forEach(function(p) { master(p[0]).findGlyphByName(p[1]).edit = true; });
        selection.updateSelection('glyph');
    }
    function setOperator(level, param, op, value) {
        // selection-controller addParameterToElements, then
        // selection-parameter-controller updateCPS (elements in reverse)
        var sel = selection.selection[level]
          , base = byName(selection.baseParameters, param)
          , baseOp = byName(selection.baseOperators, op)
          , els = sel.elements, i, p, o
          ;
        for(i=els.length-1;i>=0;i--) {
            p = els[i].getParameterByName(param);
            if(!p || !p.operators.some(function(x) { return x.base === baseOp; }))
                els[i].addParameterOperator(base, baseOp, operatorId);
        }
        operatorId++;
        for(i=els.length-1;i>=0;i--) {
            p = els[i].checkIfHasParameter(base);
            o = p.operators.filter(function(x) { return x.base === baseOp; })[0];
            o.setValue(value);
            p.changedOperator(o);
        }
        selection.updateSelection(level);
    }
    function removeOperator(level, param, op) {
        var els = selection.selection[level].elements, i, p, o;
        for(i=els.length-1;i>=0;i--) {
            p = els[i].getParameterByName(param);
            o = p && p.operators.filter(function(x) { return x.base.name === op; })[0];
            if(o) p.removeOperator(o, els[i]);
        }
        selection.updateSelection(level);
    }
    function duplicateSelected() {
        // master-panel-controller duplicateMasters / setCloneProperties
        var clones = [];
        sequence.children.forEach(function(m) {
            m.deselectAllChildren();
            if(!m.edit) return;
            var clone = m.clone(), newId = sequence.addToMasterId()
              , mom = project.cloneMaster(false, m.name, 'master-' + m.sequenceId + '-' + newId);
            clone.name = mom.id;
            clone.id = newId;
            clone.setMasterAndMOM(clone, mom);
            clone.displayName = clone.displayName + ' copy';
            clone.cpsFile = project.controller.getCPSName(mom);
            m.edit = false;
            clone.parameters.forEach(function(p) { p.destackOperators(); });
            clones.push(clone);
        });
        clones.forEach(function(c) { sequence.add(c); });
        selection.updateSelection('master');
        // the specimen then draws the (selected) clones, which builds their
        // StyleDicts; that calls PropertyDict.keys(), which repairs the
        // `_keys = null` left by the clone's PropertyDict.splice. Without
        // it the next new property crashes setProperty (upstream bug, see
        // notes/rust-port/upstream-bugs.md).
        clones.forEach(function(c) {
            c.children.forEach(function(g) { g.momElement.getComputedStyle().get('width'); });
        });
    }
    function addToDesignSpace(name) {
        // master-panel-controller addMasterToDesignSpace (one instance sequence)
        var designSpace = model.currentDesignSpace, m = master(name), inst;
        if(designSpace.axes.length === 0) {
            designSpace.addAxis(m);
            inst = model.instanceSequences[0].createNewInstance([{master: m, axisValue: 50, metapolationValue: 1}], designSpace, project);
            instanceTools.registerInstance(project, inst);
            model.instanceSequences[0].addInstance(inst);
            // the instance specimen draws the new current instance, which
            // loads its CPS rule; instanceTools.update's reloadRule fails
            // for a rule that was never loaded
            drawMaster(inst.momElement);
        } else {
            designSpace.addAxis(m);
            model.instanceSequences[0].children.forEach(function(inst) {
                if(inst.designSpace !== designSpace) return;
                inst.addAxis(m, inst.axes.length === 1 ? 100 - inst.axes[0].axisValue : 0, null, project);
                instanceTools.update(project, inst);
            });
        }
    }
    function setAxes(values) {
        // the end of a slider drag: axis values, then setMetapolationValues
        var inst = model.currentInstance;
        values.forEach(function(v, i) { inst.axes[i].axisValue = v.toFixed(1); });
        inst.setMetapolationValues();
    }
    // numbers as String(x) (shortest round trip) so that Rust parses them
    // exactly; undefined/null as null
    function num(p) {
        return p && p.effectiveValue !== undefined && p.effectiveValue !== null ? String(p.effectiveValue) : null;
    }
    function snapshot(step) {
        var widths = {}, weights = {};
        sequence.children.forEach(function(m) {
            widths[m.name] = {};
            m.children.forEach(function(g) {
                var p = g.getParameterByName('Width');
                widths[m.name][g.name] = num(p);
            });
            weights[m.name] = {};
            STEPS.weightGlyphs.forEach(function(gn) {
                var g = m.findGlyphByName(gn);
                weights[m.name][gn] = g.children.map(function(ps) {
                    return ps.children.map(function(pt) {
                        return num(pt.getParameterByName('Weight'));
                    });
                });
            });
        });
        var insts = [];
        model.instanceSequences[0].children.forEach(function(i) {
            insts.push({ name: i.momElement.id, axes: i.axes.map(function(a) { return [a.master.name, String(parseFloat(a.axisValue)), String(a.metapolationValue)]; }) });
        });
        record.push({ step: step, widths: widths, weights: weights, instances: insts });
    }

    display(master('master-regular'));
    snapshot(null);
    STEPS.steps.forEach(function(s) {
        switch(s[0]) {
            case 'selectMasters': selectMasters(s[1]); break;
            case 'selectGlyphs': selectGlyphs(s[1]); break;
            case 'set': setOperator(s[1], s[2], s[3], s[4]); break;
            case 'remove': removeOperator(s[1], s[2], s[3]); break;
            case 'duplicate': duplicateSelected(); break;
            case 'designSpace': addToDesignSpace(s[1]); break;
            case 'axes': setAxes(s[1]); break;
            default: throw new Error('unknown step ' + s[0]);
        }
        snapshot(s);
    });

    mem.mkDir(false, 'out');
    var names = sequence.children.map(function(m) { return m.name; })
            .concat(model.instanceSequences[0].children.map(function(i) { return i.momElement.id; }));
    names.forEach(function(name) {
        var genIo = project.getUFOExportGenerator(false, name, name + '.ufo2', 2, -1), gen = genIo[0], step;
        while(!gen.next().done);
        mem.mkDir(false, 'out/' + name + '.ufo2');
        genIo[1].copyRecursive(false, name + '.ufo2', mem, 'out/' + name + '.ufo2');
        genIo = project.getOTFExportGenerator(false, name, name + '.otf');
        gen = genIo[0];
        while(!(step = gen.next()).done);
        mem.writeFile(false, 'out/' + name + '.otf', Buffer.from(step.value));
    });

    // the specimen panel
    var specimen = [];
    STEPS.specimen.forEach(function(c) {
        var $scope = { model: { mixer: { specimenSample: { text: c[0] }, filter: c[1], strict: c[2], fontBy: 'Specimen' } } };
        new SpecimenFieldController($scope, model);
        specimen.push({ text: c[0], filter: c[1], strict: c[2], glyphsOut: $scope.glyphsOut() });
    });

    fs.mkdirSync(outDir, { recursive: true });
    mem.copyRecursive(false, 'out', diskIO, outDir);
    fs.writeFileSync(path.join(outDir, 'steps.json'), JSON.stringify(record) + '\n');
    fs.writeFileSync(path.join(outDir, 'specimen.json'), JSON.stringify(specimen, null, 1) + '\n');
    fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({ exported: names }, null, 2) + '\n');
});
