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
    
    /**
     * We will throttle the change rate and only update after a
     * few millisecs of silence, because it's very likely
     * that this event is fired often, i.e. a linebreak fires
     * change twice, first for the linebreak then for the auto
     * indent feature.
     * A good throttle interval is whatever requestAnimationFrame
     * does, rather than an arbitrary value with setTimeout.
     * 
     * if recordChangesOnly is true the processing of the changes will
     * not be scheduled. This is currently used, because auto-updating
     * takes too much time and slows down the ui.
     */
    _p._throttledDocChangeHandler = function(source, recordChangesOnly, doc, changeObj) {
        var data = this._cache.codeMirrorDocs[source];
        data.changes.push(changeObj);
        
        if(recordChangesOnly)
            return;
        
        // reset the timeout
        if(data.timeout)
            window.cancelAnimationFrame(data.timeout);
        data.timeout = window.requestAnimationFrame(
                            this._processChangedDoc.bind(this, source, true));
    }
    
    /**
     * Called after a culminating changes in a requestAnimationFrame period.
     * All doc data is in the cache.
     */
    _p._processChangedDoc = function(source, broadcast) {
        var data = this._cache.codeMirrorDocs[source]
          , error
          ;
        data.timeout = null;
        data.changes = [];
        
        // todo: try catch here. an error will be thrown when the
        // document content is garbage 
        try {
            this.project.updateCPSRule(source, data.doc.getValue());
        }
        catch(err){
            error = err;
            if(!(error instanceof CPSParserError))
                throw error;
        }
        
        if(error)
            console.warn('The document "' + source + '" can\'t be parsed: ', error.message);
        // broadcast if there was no error
        else if(broadcast) {
            this.frontend.$scope.$broadcast('cpsUpdate');
        }
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
            this.project.refreshCPSRules(true, sourceName)
                // then update the display
                .then(function() {
                    this.frontend.$scope.$broadcast('cpsUpdate');
                }.bind(this));
        }
        catch(error) {
            // KeyError will be thrown by refreshCPSRules if sourceName
            // is unknown, which is expected at this point, because
            // that means that sourceName is unused.
            if(!(error instanceof errors.Key))
                throw error;
        }
    };
    
    return RedPill;
})
