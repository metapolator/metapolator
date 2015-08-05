define([], function() {
    "use strict";
    function VerticalDividerController($scope) {
        this.$scope = $scope;
    }

    VerticalDividerController.$inject = ['$scope'];
    var _p = VerticalDividerController.prototype;

    return VerticalDividerController;
}); 