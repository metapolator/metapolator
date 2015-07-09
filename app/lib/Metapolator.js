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
        // set initial model data
        // FIXME: this stuff too much hardcoding, we need a saner way to do this things
        model.masterPanel.addSequence("Sequence 1");
        model.instancePanel.addSequence("Family 1");
        // creation of inital masters
        var masters = ["Regular", "Bold", "Light", "Condensed", "Extended", "Italic"];
        var glyphs = ["A", "B", "C", "D", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "space"];
        masters.forEach(function(master) {
            // this = model.masterPanel.sequences[0]
            this.addMaster(master);
            glyphs.forEach(function(glyph) {
                // this = model.masterPanel.sequences[0]
                var masterIndex = this.children.length - 1;
                this.children[masterIndex].addGlyph(glyph);
            }, this);
        }, model.masterPanel.sequences[0]);
        model.designSpacePanel.addDesignSpace();
        model.designSpacePanel.currentDesignSpace = model.designSpacePanel.designSpaces[0];
        return model;
    };

    return Metapolator;
});
