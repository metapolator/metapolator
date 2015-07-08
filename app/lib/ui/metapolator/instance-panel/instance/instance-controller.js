define([], function() {
    "use strict";
    function InstanceController($scope, metapolatorModel) {
        this.$scope = $scope;
        this.$scope.name = 'instance';
        
        
        $scope.getDiamondColor = function(instance) {
            if (instance === metapolatorModel.instancePanel.currentInstance) {
                return instance.color;
            } else {
                return "none";
            }
        };
        
        $scope.selectInstance = function (instance) {
            metapolatorModel.instancePanel.setCurrentInstance(instance);
            if (instance.designSpace !== metapolatorModel.designSpacePanel.currentDesignSpace) {
                metapolatorModel.designSpacePanel.setCurrentDesignSpace(instance.designSpace);   
            }
        };


        $scope.getGlyph = function (glyphName) {
            for (var i = $scope.model.children.length - 1; i >= 0; i--) {
                var thisGlyph = $scope.model.children[i];
                if (thisGlyph.name === glyphName) {
                    return thisGlyph;
                }
            }
        };
    }

    InstanceController.$inject = ['$scope', 'metapolatorModel'];
    var _p = InstanceController.prototype;

    return InstanceController;
}); 