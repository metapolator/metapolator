define([
    'metapolator/ui/metapolator/services/selection'
], function(
    selection
) {
    "use strict";
    function ParameterPanelController($scope) {
        this.$scope = $scope;
        $scope.selection = selection;
    }

    ParameterPanelController.$inject = ['$scope'];
    var _p = ParameterPanelController.prototype;

    return ParameterPanelController;
}); 