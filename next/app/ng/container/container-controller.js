"use strict";
define([], function() {
    
    function ContainerController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'container'
        console.log('new', this, ':-)', this.$scope.name)
    }
    ContainerController.$inject = ['$scope'];
    var _p = ContainerController.prototype;
    
    return ContainerController;
})
