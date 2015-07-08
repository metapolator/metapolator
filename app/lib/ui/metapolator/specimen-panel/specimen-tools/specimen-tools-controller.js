define([], function() {
    "use strict";
    function SpecimenToolsController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'specimen-tools';
    }


    SpecimenToolsController.$inject = ['$scope'];
    var _p = SpecimenToolsController.prototype;

    return SpecimenToolsController;
});
