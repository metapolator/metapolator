define([], function() {
    "use strict";
    function HorizontalDividerController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'horizontalDivider';
    }

    HorizontalDividerController.$inject = ['$scope'];
    var _p = HorizontalDividerController.prototype;

    return HorizontalDividerController;
}); 