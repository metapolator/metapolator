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
    
    function RedPill(project, angularApp, fsEvents) {
        this.angularApp = angularApp
        this.frontend = undefined;
        this.project = project;
        this.fsEvents = fsEvents;
        this.model = {
            masters: this.project.masters
        }
        this._cache = {
            lastSelection: []
        }
        
        // load all masters, because right now it is very confusing
        // when some masters are missing from the MOM
        this.project.masters.forEach(this.project.open, this.project);
        
        
        // will be called on angular.bootstrap
        // see ui/app-controller.js 
        this.angularApp.constant('registerFrontend', this._registerFrontend.bind(this))
        this.angularApp.constant('redPillModel', this.model);
        this.angularApp.constant('selectGlyphs', this.selectGlyphs.bind(this));
        this.angularApp.constant('ModelController', this.project.controller);
        
        this.fsEvents.on('change', this.fileChangeHandler.bind(this));
    }
    
    var _p = RedPill.prototype;

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
                }.bind(this));
        }
        catch(error) {
            // KeyError will be thrown by RuleController.replaceRule if
            // sourceName is unknown, which is expected at this point,
            // because that means that sourceName is unused.
            if(!(error instanceof errors.Key))
                throw error;
        }
    };
    
    return RedPill;
})
