define([], function() {
    "use strict";
    function AppController($scope, model, registerFrontend) {
        this.$scope = $scope;
        this.$scope.name = 'app'
        // registering the root of the app, for callback purposes
        registerFrontend(this);
        
        this.$scope.model = this.model = model;
        
        // These are used to store the application state.
        // When we switch between masters, for example, a RedPillMasterController
        // will remember its last state via this.$scope.masterData
        this.$scope.currentMaster = model.masters[0]
        this.$scope.masterData = {}
    }
    
    AppController.$inject = ['$scope', 'redPillModel', 'registerFrontend'];
    var _p = AppController.prototype;
    
    _p.redraw = function() {
        this.$scope.$apply()
    }
    
    return AppController;
})
