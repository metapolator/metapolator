"use strict";
define([

], function(

) {
    function Metapolator(model, angularApp) {
        this.angularApp = angularApp
        this.frontend = undefined;
        this.model = model;
        
        // will be called on angular.bootstrap
        // see ui/app-controller.js 
        this.angularApp.constant('registerFrontend', this._registerFrontend.bind(this))
        this.angularApp.constant('metapolatorModel', this.model)
    }
    
    var _p = Metapolator.prototype;

    _p._registerFrontend = function(appController) {
        if(this.frontend !== undefined)
            throw new Error('Registering more than one AppController is not allowed.'
                           +' Don\'t use <metapolator> more than once in a template!')
        this.frontend = appController;
    }
    
    return Metapolator;
})
