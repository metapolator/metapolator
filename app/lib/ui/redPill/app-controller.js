define([], function() {
    "use strict";
    function AppController($scope, model, registerFrontend) {
        this.$scope = $scope;
        this.$scope.name = 'app'
        // registering the root of the app, for callback purposes
        registerFrontend(this);
        
        this.$scope.model = this.model = model;
    }
    
    AppController.$inject = ['$scope', 'redPillModel', 'registerFrontend'];
    var _p = AppController.prototype;
    
    _p.redraw = function() {
        this.$scope.$apply()
    }
    
    return AppController;
})
