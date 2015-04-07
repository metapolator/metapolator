define([
], function(
) {
    "use strict";
    function PropertyDictController($scope) {
        this.$scope = $scope;
    }
    PropertyDictController.$inject = ['$scope'];
    var _p = PropertyDictController.prototype;

    return PropertyDictController;
});
