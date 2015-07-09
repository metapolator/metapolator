define([
    'metapolator/errors'
  , 'metapolator/webAPI/window'
  , 'codemirror/lib/codemirror'
], function(
    errors
  , window
) {
    "use strict";

    var CPSParserError = errors.CPSParser
      , CPSError = errors.CPS
      ;

    function RedPill(io, project, angularApp, loadTextEditor) {
        this.angularApp = angularApp;
        this.frontend = undefined;
        this.project = project;
        this.loadTextEditor = loadTextEditor;
        this.model = {
            masters: this.project.masters
        };
        this._cache = {
            lastSelection: []
        };

        // load all masters, because right now it is very confusing
        // when some masters are missing from the MOM
        this.project.masters.forEach(this.project.open, this.project);


        // will be called on angular.bootstrap
        // see ui/app-controller.js
        this.angularApp.constant('registerFrontend', this._registerFrontend.bind(this));
        this.angularApp.constant('redPillModel', this.model);
        this.angularApp.constant('selectGlyphs', this.selectGlyphs.bind(this));
        this.angularApp.constant('ModelController', this.project.controller);
        this.angularApp.constant('io', io);
        this.angularApp.constant('config', {loadTextEditor: loadTextEditor});

        this.project.setUpdateChangedRuleHandlers(
            function() {this.frontend.$scope.$broadcast('cpsUpdate');}.bind(this));

    }

    var _p = RedPill.prototype;

    _p._registerFrontend = function(appController) {
        if(this.frontend !== undefined)
            throw new Error('Registering more than one AppController is not allowed.'
                           +' Don\'t use <red-pill> more than once in a template!');
        this.frontend = appController;
    };

    _p._selectGlyphs = function(selector) {
        try {
            return this.project.controller.queryAll(selector)
                .filter(function(item){ return item.type === 'glyph'; });
        }
        catch(error){
            if(!(error instanceof CPSError))
                throw error;
            console.warn('selector "' + selector + '" did not parse:', error.message);
        }
        return false;
    };

    _p.selectGlyphs = function(selector) {
        var result = this._selectGlyphs(selector);
        if(!result)
            return this._cache.lastSelection;
        this._cache.lastSelection = result;
        return result;
    };

    return RedPill;
});
