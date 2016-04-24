define([
    'jquery'
  , 'webAPI/document'
  , 'metapolator/models/metapolator/AppModel'
  , 'metapolator/rendering/glyphBasics'
  , 'metapolator/rendering/dataTransformationCaches/DrawPointsProvider'
  , 'metapolator/rendering/dataTransformationCaches/BBoxProvider'
  , 'metapolator/ui/services/GlyphUIService'
  , 'metapolator/ui/metapolator/ui-tools/selectionTools'
], function(
    $
  , document
  , AppModel
  , glyphBasics
  , DrawPointsProvider
  , BBoxProvider
  , GlyphUIService
  , selection
) {
    "use strict";
    function Metapolator(project, angularApp) {
        this.angularApp = angularApp;
        this.frontend = undefined;
        this.project = project;
        this.model = this._modelFactory();


        // load all masters, because right now it is very confusing
        // when some masters are missing from the MOM
        this.project.masters.forEach(this.project.open, this.project);
        this._loadMOMmasters();


        this.drawPointsOutlineProvider = new DrawPointsProvider(glyphBasics.outlinesRenderer);
        // this will be used for for https://github.com/metapolator/metapolator/issues/587
        this.bBoxService = new BBoxProvider(this.drawPointsOutlineProvider);
        this.glyphUIService = new GlyphUIService(document, this.drawPointsOutlineProvider);

        // FIXME: this is the MOM/CPS model, rename? The name is inherited
        // from the Red Pill, but since we are going to have more models this
        // could get a more distinct name. Should be renamed in the Red Pill as
        // well, if we do so.
        // Maybe momModel?
        this.angularApp.constant('modelController', this.project.controller);
        this.angularApp.constant('project', this.project);
        this.angularApp.constant('glyphUIService', this.glyphUIService);

        // will be called on angular.bootstrap
        // see ui/app-controller.js
        this.angularApp.constant('registerFrontend', this._registerFrontend.bind(this));
        this.angularApp.constant('metapolatorModel', this.model);
    }

    var _p = Metapolator.prototype;

    _p._registerFrontend = function(appController) {
        if (this.frontend !== undefined)
            throw new Error('Registering more than one AppController is not allowed.'
                           + ' Don\'t use <metapolator> more than once in a template!');
        this.frontend = appController;
    };

    // probably this should be replaced by sth. like `new AppModel(data);`
    _p._modelFactory = function() {
        var model = new AppModel(this.project);
        model.addInstanceSequence("Family 1");
        model.createNewDesignSpace();
        return model;
    };

    _p._loadMOMmasters = function() {
        // load initial MOMmasters with MOMglyphs into model
        var sequence = this.model.addSequence("Sequence 1")
          , MOMmasters = this.project.controller.queryAll("master");
        for (var i = 0, l = MOMmasters.length; i < l; i++) {
            var MOMmaster = MOMmasters[i]
              , masterName = MOMmaster.id;
            // skip base for the ui
            if (masterName.indexOf('master-') === 0) {
                // temp private method, see issue #332
                var cpsFile = this.project.controller._getMasterRule(masterName)
                  , master = sequence.addMaster(masterName, MOMmaster, cpsFile);
                  ;
            }
        }
        selection.injectSequences(this.model.masterSequences);
        selection.updateSelection('master');
    };

    return Metapolator;
});
