define([], function() {
    "use strict";
    function AppController($scope, model, registerFrontend) {
        registerFrontend(this);
        this.$scope = $scope;
        this.$scope.name = 'app'
        
        this.$scope.model = this.model = model;
        
        console.log('new', this, ':-)', this.$scope.name, this.$scope.$parent)
        this.greetMe('metapolating World')
    }
    AppController.$inject = ['$scope', 'metapolatorModel', 'registerFrontend'];
    var _p = AppController.prototype;
    
    _p.greetMe = function(me) {
        this.$scope.greetMe = me;
    }
    
    _p.redraw = function() {
        this.$scope.$apply()
    }
    
    return AppController;
})
