define([], function() {
    "use strict";
    function WidgetController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'widget'
        console.log('new', this, ':-)', this.$scope.name, this.$scope.model, this.$scope.$parent.name)
    }
    
    WidgetController.$inject = ['$scope'];
    var _p = WidgetController.prototype;
    
    return WidgetController;
})
