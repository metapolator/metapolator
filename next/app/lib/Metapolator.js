"use strict";
define([
    'require/domReady'
  , 'DOM/document'
  , 'angular'
  , 'ng/app'
], function(
    domReady
  , document
  , angular
  , angularApp
){
    
    function Metapolator(model) {
        this.frontend = undefined;
        this.model = model;
        
        angularApp.constant('registerFrontend', this._registerFrontend.bind(this))
        angularApp.constant('metapolatorModel', this.model)
        
        // this should be the last thing here, because domReady will execute
        // immediately if dom is already ready.
        domReady(this._domReadyHandler.bind(this))
    }
    
    var _p = Metapolator.prototype;

    _p._domReadyHandler = function() {
        angular.bootstrap(document, [angularApp.name]);
    }
    _p._registerFrontend = function(appController) {
        if(this.frontend !== undefined)
            throw new Error('Registering more than one AppController is not allowed.'
                           +' Don\'t use <metapolator> more than once in a template!')
        this.frontend = appController;
    }
    
    return Metapolator;
})
