define([], function() {
    "use strict";
    function ContainerController($scope) {
        this.$scope = $scope;
        
        this.$scope.name = 'container'
        console.warn('new', this, ':-)', this.$scope.name, this.$scope.model, this.$scope.$parent.name)
    }
    ContainerController.$inject = ['$scope'];
    var _p = ContainerController.prototype;
    
    return ContainerController;
})
