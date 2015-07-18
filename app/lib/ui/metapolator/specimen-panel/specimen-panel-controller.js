define([], function() {
    "use strict";
    function SpecimenPanelController($scope) {
        this.$scope = $scope;
    }

    SpecimenPanelController.$inject = ['$scope'];
    var _p = SpecimenPanelController.prototype;

    return SpecimenPanelController;
}); 