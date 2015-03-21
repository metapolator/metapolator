define([
], function(
) {
    "use strict";
    function ParameterDictController($scope) {
        this.$scope = $scope;
    }
    ParameterDictController.$inject = ['$scope'];
    var _p = ParameterDictController.prototype;

    return ParameterDictController;
});
