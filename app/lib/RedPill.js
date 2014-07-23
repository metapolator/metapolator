define([

], function(

) {
    "use strict";
    function RedPill(project, angularApp) {
        this.angularApp = angularApp
        this.frontend = undefined;
        this.model = {}
        // will be called on angular.bootstrap
        // see ui/app-controller.js 
        this.angularApp.constant('registerFrontend', this._registerFrontend.bind(this))
        this.angularApp.constant('redPillModel', this.model)
    }
    
    var _p = RedPill.prototype;

    _p._registerFrontend = function(appController) {
        if(this.frontend !== undefined)
            throw new Error('Registering more than one AppController is not allowed.'
                           +' Don\'t use <red-pill> more than once in a template!')
        this.frontend = appController;
    }
    
    return RedPill;
})
