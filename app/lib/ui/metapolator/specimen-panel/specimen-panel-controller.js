define([], function() {
    "use strict";
    function SpecimenPanelController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'specimenPanel';
        if ($scope.model.settings.rubberband) {
            
        }
    }

    SpecimenPanelController.$inject = ['$scope'];
    var _p = SpecimenPanelController.prototype;

    return SpecimenPanelController;
}); 