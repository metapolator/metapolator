require([
    'require/domReady'
  , 'angular'
  , 'metapolator/ui/metapolator/app'
  , 'metapolator/ui/metapolator/ui-tools/selectionTools'

  , 'Atem-MOM/project/Project'
  , 'metapolator/models/metapolator/AppModel'
  , 'Atem-IO/io/staticBrowserREST'
  , 'Atem-IO/io/InMemory'

  , 'Atem-MOM/rendering/basics'
  , 'Atem-MOM-Toolkit/dataTransformationCaches/DrawPointsProvider'
  , 'Atem-MOM-Toolkit/dataTransformationCaches/BBoxProvider'
  , 'Atem-MOM-Toolkit/services/glyph/GlyphUIService'
  , 'Atem-CPS-Toolkit/services/dragAndDrop/DragDataService'
  , 'Atem-CPS-Toolkit/services/dragAndDrop/DragIndicatorService'
  , 'Atem-MOM/cpsTools'
  , 'Atem-MOM/errors'
],
function (
    domReady
  , angular
  , angularApp
  , selectionTools
  , Project
  , AppModel
  , ioREST
  , InMemory

  , renderingBasics
  , DrawPointsProvider
  , BBoxProvider
  , GlyphUIService
  , DragDataService
  , DragIndicatorService
  , cpsTools
  , errors
) {
    "use strict";
    /*global document:true*/
    document.body.classList.add('dependencies-ready');

    // TODO: probably we should eventually subclass MOM/Project
    // and initialize all the Metapolator model stuff there. That's
    // the best way to manage persistence.
    function modelFactory(project) {
        // FIXME: I'm not very happy with this
        // Why is this not part of AppModel, e.g. AppModel.factory?
        var model = new AppModel(project);
        model.addInstanceSequence("Family 1");
        model.createNewDesignSpace();
        return model;
    };

    function loadMOMmastersIntoMetapolator(metapolatorModel, cpsController) {
        // load initial MOMmasters with MOMglyphs into model
        var sequence = metapolatorModel.addSequence("Sequence 1")
            // FIXME: is this the right way to do it? (Hint: no but we don't
            // have much better alternatives yet.)
          , MOMmasters = cpsController.queryAll("master")
          ;
        for (var i = 0, l = MOMmasters.length; i < l; i++) {
            var MOMmaster = MOMmasters[i]
              , masterName = MOMmaster.id;
            // skip base-masters for the ui. Could also be checked by
            // `if(master.baseNode)` because at the moment a base-master
            // has no baseNode, the others have one.
            // This skips instance-masters as well!
            if (masterName.indexOf('master-') === 0) {
                var cpsFile = cpsController.getCPSName(masterName)
                    // Todo: Is this masterName the "display" name or is it used
                    // like MOMmaster.id? If it's the latter, there shouldn't
                    // be such redundancies.
                  , master = sequence.addMaster(masterName, MOMmaster, cpsFile);
                  ;
            }
        }
        selectionTools.injectSequences(metapolatorModel.masterSequences);
        selectionTools.updateSelection('master');
    };

    function main() {
        var projectDir = 'project'
          , drawPointsOutlineProvider = new DrawPointsProvider(renderingBasics.outlinesRenderer)
          // this will be used for for https://github.com/metapolator/metapolator/issues/587
          , bBoxService = new BBoxProvider(drawPointsOutlineProvider)
          , glyphUIService = new GlyphUIService(document, drawPointsOutlineProvider)
          , dragDataService = new DragDataService()
          , dragIndicatorService = new DragIndicatorService()
          , io = new InMemory()
          // InMemory is its own event emitter
          //, fsEvents = io
          // BUT, we don't use fsEvents currently (see also MOM/project/Project)
          , cpsLibIoMounts = [
                // add more of these configuration objects to include more
                // libraries each object yields in a call to MountingIO.mount
                // the keys correlate with the argument names of MountingIO
                // however, Project does some augmentation.
                {
                    io: ioREST
                  , mountPoint: 'lib/MOM'
                  , pathOffset: 'lib/bower_components/Atem-MOM/lib/cpsLib'
                }
              , {
                    io: ioREST
                  , mountPoint: 'lib/metapolator'
                  , pathOffset: 'lib/bower_components/metapolator-cpsLib/lib'
                }
            ]
          , project = new Project(io, projectDir, undefined, cpsLibIoMounts)
          , metapolatorModel = modelFactory(project)
          , promise
          ;

        angularApp.constant('cpsTools', cpsTools);

        angularApp.constant('bBoxService', bBoxService);
        // render glyphs
        angularApp.constant('glyphUIService', glyphUIService);
        // for cps-panel
        angularApp.constant('dragDataService', dragDataService);
        angularApp.constant('dragIndicatorService', dragIndicatorService);

        // TODO: make a way to switch projects from within the app
        angularApp.constant('project', project);
        angularApp.constant('cpsController', project.controller);
        angularApp.constant('ruleController', project.ruleController);

        angularApp.constant('metapolatorModel', metapolatorModel);

        io.mkDir(false, 'project');
        promise = ioREST.copyRecursive(true, 'project', io, 'project')
                 .then(project.load.bind(project, true))
                 // currently no async openSession (no big issue since we
                 // use mostly InMemoryIO)
                 .then(project.openSession.bind(project, false))
                 .then(loadMOMmastersIntoMetapolator.bind(null, metapolatorModel, cpsController))
                 .then(null, errors.unhandledPromise)
                 ;
        // this should be the last thing here, because domReady will execute
        // immediately if the DOM is already ready.
        domReady(function() {
            promise.then(angular.bootstrap.bind(angular, document, [angularApp.name]))
                   .then(null, errors.unhandledPromise)
                   ;
        });
    }
    main();
});
