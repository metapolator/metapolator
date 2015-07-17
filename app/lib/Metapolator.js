define([
    'webAPI/document'
  , 'metapolator/models/metapolator/AppModel'
  , 'metapolator/ui/services/GlyphRendererAPI'
], function(
    document
  , AppModel
  , GlyphRendererAPI
) {
    "use strict";
    function Metapolator(project, angularApp) {
        this.angularApp = angularApp;
        this.frontend = undefined;
        this.model = this._modelFactory();
        this.project = project;

        // load all masters, because right now it is very confusing
        // when some masters are missing from the MOM
        this.project.masters.forEach(this.project.open, this.project);
        this._loadMOMmasters();

        this.glyphRendererAPI = new GlyphRendererAPI(document, project.controller);
        // FIXME: this is the MOM/CPS model, rename? The name is inherited
        // from the Red Pill, but since we are going to have more models this
        // could get a more distinct name. Should be renamed in the Red Pill as
        // well, if we do so.
        this.angularApp.constant('modelController', this.project.controller);
        this.angularApp.constant('project', this.project);
        this.angularApp.constant('glyphRendererAPI', this.glyphRendererAPI);

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
        var model = new AppModel();
        model.instancePanel.addSequence("Family 1");
        model.designSpacePanel.addDesignSpace();
        model.designSpacePanel.currentDesignSpace = model.designSpacePanel.designSpaces[0];
        return model;
    };

    _p._loadMOMmasters = function() {
        // load initial MOMmasters with MOMglyphs into model
        var sequence = this.model.masterPanel.addSequence("Sequence 1")
          , MOMmasters = this.project.controller.queryAll("master");
        for (var i = 0, l = MOMmasters.length; i < l; i++) {
            var MOMmaster = MOMmasters[i]
              , masterName = MOMmaster.id;
            // skip base for the ui
            if (masterName !== "base") {
                // temp private method, see issue #332
                var cpsFile = this.project.controller._getMasterRule(masterName)
                  , MOMglyphs = MOMmaster.children
                  , master = sequence.addMaster(masterName, MOMmaster, cpsFile);
                for (var j = 0, jl = MOMglyphs.length; j < jl; j++) {
                    var MOMglyph = MOMglyphs[j]
                      , glyphName = MOMglyph.id
                      , MOMpenstrokes = MOMglyph.children
                      , glyph = master.addGlyph(glyphName, MOMglyph);
                    for (var k = 0, kl = MOMpenstrokes.length; k < kl; k++) {
                        var MOMpenstroke = MOMpenstrokes[k]
                          , penstrokeName = "penstroke:i(" + k + ")"
                          , MOMpoints = MOMpenstroke.children
                          , penstroke = glyph.addPenstroke(penstrokeName, MOMpenstroke);
                        for (var m = 0, ml = MOMpoints.length; m < ml; m++) {
                            var pointName = "point:i(" + m + ")";
                            penstroke.addPoint(pointName, MOMpoints[m]);
                        }
                    }
                }
            }
        }
    };

    return Metapolator;
});
