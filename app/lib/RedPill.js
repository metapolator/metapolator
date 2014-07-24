define([

], function(

) {
    "use strict";
    function RedPill(project, angularApp) {
        this.angularApp = angularApp
        this.frontend = undefined;
        this.project = project;
        this.model = {
            masters: this.project.masters
        }
        // maybe think about memory leaks?
        this._cache = {
            modelControllers: {}
            
        }
        
        // will be called on angular.bootstrap
        // see ui/app-controller.js 
        this.angularApp.constant('registerFrontend', this._registerFrontend.bind(this))
        this.angularApp.constant('redPillModel', this.model)
        this.angularApp.constant('getModelController', this.getModelController.bind(this))
    }
    
    var _p = RedPill.prototype;

    _p._registerFrontend = function(appController) {
        if(this.frontend !== undefined)
            throw new Error('Registering more than one AppController is not allowed.'
                           +' Don\'t use <red-pill> more than once in a template!')
        this.frontend = appController;
    }
    
    _p.getModelController = function(master) {
        console.log('see TODO (RedPill.js)')
        // TODO: caching open resources is rather a job for project
        // also, when we open several masters and all use the same cps files
        // it would be nice to have these files opened (and also altered)
        // in a central place, so that it is possible to propagate changes
        //  to all users of the files (and derivates!?)
        if(!this._cache.modelControllers[master])
            this._cache.modelControllers[master] = this.project.open(master);
        return this._cache.modelControllers[master];
    }
    
    return RedPill;
})
