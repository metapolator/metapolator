define([
    'metapolator/errors'
  , 'metapolator/webAPI/window'
  , 'metapolator/ui/services/GlyphRendererAPI'
], function(
    errors
  , window
  , GlyphRendererAPI
) {
    "use strict";

    var CPSParserError = errors.CPSParser
      , CPSError = errors.CPS
      ;

    function SliderDemo(io, fsEvents, project, angularApp, loadTextEditor) {
        this.angularApp = angularApp
        this.frontend = undefined;
        this.project = project;
        this.fsEvents = fsEvents;
        this.loadTextEditor = loadTextEditor;
        this.model = {
            masters: this.project.masters
        }
        this._cache = {
            lastSelection: []
        }

        console.info('loading masters');
        // load all masters, because right now it is very confusing
        // when some masters are missing from the MOM
        this.project.masters.forEach(this.project.open, this.project);
        console.info('loading masters DONE!');

        // will be called on angular.bootstrap
        // see ui/app-controller.js
        this.angularApp.constant('registerFrontend', this._registerFrontend.bind(this))
        this.angularApp.constant('redPillModel', this.model);
        this.angularApp.constant('selectGlyphs', this.selectGlyphs.bind(this));
        this.angularApp.constant('ModelController', this.project.controller);
        this.angularApp.constant('io', io);
        this.angularApp.constant('config', {loadTextEditor: loadTextEditor})

        this.angularApp.constant('glyphRendererAPI', new GlyphRendererAPI(window.document, this.project.controller));

        this.fsEvents.on('change', this.fileChangeHandler.bind(this));
    }

    var _p = SliderDemo.prototype;

    _p._registerFrontend = function(appController) {
        if(this.frontend !== undefined)
            throw new Error('Registering more than one AppController is not allowed.'
                           +' Don\'t use <red-pill> more than once in a template!')
        this.frontend = appController;
    }

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
    }

    _p.selectGlyphs = function(selector) {
        var result = this._selectGlyphs(selector);
        if(!result)
            return this._cache.lastSelection;
        this._cache.lastSelection = result;
        return result;
    }

    _p.fileChangeHandler = function (path) {
        var match = path.indexOf(this.project.cpsDir)
          , sourceName
          ;
        if(match !== 0)
            return;
        // +1 to remove the leading slash
        sourceName = path.slice(this.project.cpsDir.length + 1);
        try {
            this.project.controller.updateChangedRule(true, sourceName)
                .then(function() {
                    this.frontend.$scope.$broadcast('cpsUpdate');
                }.bind(this), errors.unhandledPromise);
        }
        catch(error) {
            // KeyError will be thrown by RuleController.replaceRule if
            // sourceName is unknown, which is expected at this point,
            // because that means that sourceName is unused.
            if(!(error instanceof errors.Key))
                throw error;
        }
    };

    return SliderDemo;
})
