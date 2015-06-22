define([], function() {
    "use strict";
    function VerticalDividerController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'verticalDivider';
    }

    VerticalDividerController.$inject = ['$scope'];
    var _p = VerticalDividerController.prototype;

    return VerticalDividerController;
}); 