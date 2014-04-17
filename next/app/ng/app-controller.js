"use strict";
define([], function() {
    
    function AppController($scope, registerFrontend) {
        registerFrontend(this);
        this.$scope = $scope;
        this.$scope.name = 'app'
        this.greetMe('metapolating World')
    }
    AppController.$inject = ['$scope', 'registerFrontend'];
    var _p = AppController.prototype;
    
    _p.greetMe = function(me) {
        this.$scope.greetMe = me;
    }
    
    _p.provideInterface = function(model) {
        console.log('providing an interface for', model)
        // I want a widget instantiated in "the" container displaying name and value
        
    }
    
    return AppController;
})
