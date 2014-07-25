define([
    'metapolator/errors'
  , 'metapolator/webAPI/window'
  , 'codemirror/lib/codemirror'
], function(
    errors
  , window
  , CodeMirror
) {
    "use strict";
    
    var CPSParserError = errors.CPSParser
      , CPSError = errors.CPS
      ;
    
    function RedPill(project, angularApp) {
        this.angularApp = angularApp
        this.frontend = undefined;
        this.project = project;
        this.model = {
            masters: this.project.masters
        }
        this._cache = {
            codeMirrorDocs: {}
          , lastSelection: []
        }
        
        // load all masters, because right now it is very confusing
        // when some masters are missing from the MOM
        this.project.masters.forEach(this.project.open, this.project);
        
        
        // will be called on angular.bootstrap
        // see ui/app-controller.js 
        this.angularApp.constant('registerFrontend',
                                this._registerFrontend.bind(this))
        this.angularApp.constant('redPillModel', this.model);
        this.angularApp.constant('getMasterSources',
                                this.project.getMasterSources
                                        .bind(this.project));
        this.angularApp.constant('getCodeMirrorDoc',
                                this.getCodeMirrorDoc.bind(this));
        this.angularApp.constant('returnCodeMirrorDoc',
                                this.returnCodeMirrorDoc.bind(this));
        
        this.angularApp.constant('selectGlyphs',
                                this.selectGlyphs.bind(this));
        this.angularApp.constant('ModelController', this.project.controller);
        
        this.angularApp.constant('updateCPS', this.digestCodeMirrorChanges.bind(this));
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
     * few millisecs of silence. because it's very likely
     * that this event is fired often. i.e. a linebreak fires
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
            console.log('The document "' + source + '" can\'t be parsed: ', error.message);
        
        // if there was no error 
        // inform the ui that redrawing is needed. CodeMirror doesn't need
        // any information
        
        // automatic updates are very slow at the moment. Also, this process
        // freezes the ui, so that editing is very painful
        else if(broadcast){
            this.frontend.$scope.$broadcast('cpsUpdate');
        }
    }
    
    _p.getCodeMirrorDoc = function(source) {
        var doc;
        if(!this._cache.codeMirrorDocs[source]) {
            // when we keep this doc around, we can even restore the history
            // when loading the doc a second time
            // also, codemirror is smart enough to propagate changes on one
            // doc to all editor instances that show the doc! However,
            // this is done by instances of linked doc, and we need to
            // manage their creation and destruction
            doc = new CodeMirror.Doc(
                    // this is the initial fill of the doc. later, the doc
                    // will be our  single source of truth (the CPS string)
                    this.project.getCPSRules(source).toString(), 'css');
            this._cache.codeMirrorDocs[source] = {
                doc: doc
                // set the third argument of the bind to false to enable
                // automatic updates on change. false currently because
                // updates are slow.
              , changeHandler: this._throttledDocChangeHandler.bind(this, source, true)
              , timeout: null
              , changes: []
            };
            doc.on('change', this._cache.codeMirrorDocs[source].changeHandler);
        }
        return this._cache.codeMirrorDocs[source]
                                    .doc.linkedDoc({sharedHist: true});
    }
    
    _p.digestCodeMirrorChanges = function() {
        var source;
        for(source in this._cache.codeMirrorDocs)
            if(this._cache.codeMirrorDocs[source].changes.length)
                this._processChangedDoc(source, false);
        this.frontend.$scope.$broadcast('cpsUpdate');
    }
    
    
    _p.returnCodeMirrorDoc = function(linked) {
        // TODO: if all links of a doc are returned AND if the doc is
        // clean (saved) we might consider purging its cache in
        // this._cache.codeMirrorDocs to free some memory.
        // we can get the correct cache
        linked.iterLinkedDocs(
            function(doc){ doc.unlinkDoc(linked); }
        );
    }
    
    _p._selectGlyphs = function(selector) {
        try {
            return this.project.controller.queryAll(selector)
                .filter(function(item){ return item.type === 'glyph'; });
        }
        catch(error){
            if(!(error instanceof CPSError))
                throw error;
            console.log('selector "' + selector + '" did not parse:', error.message);
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
    
    return RedPill;
})
