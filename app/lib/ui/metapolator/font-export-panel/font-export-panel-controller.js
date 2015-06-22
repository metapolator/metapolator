define([], function() {
    "use strict";
    function FontExportPanelController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'fontExport';
        
        $scope.checkAll = function(setting) {
            for (var i = $scope.model.sequences.length - 1; i >= 0; i--) {
                var sequence = $scope.model.sequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var instance = sequence.children[j];
                    instance.exportFont = setting;
                }
            } 
        };
    }

    FontExportPanelController.$inject = ['$scope'];
    var _p = FontExportPanelController.prototype;

    return FontExportPanelController;
}); 