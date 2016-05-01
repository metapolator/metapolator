define([], function() {
    "use strict";
    function MetadataPanelController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'metadataPanel';
    }

    MetadataPanelController.$inject = ['$scope'];
    var _p = MetadataPanelController.prototype;

    return MetadataPanelController;
}); 