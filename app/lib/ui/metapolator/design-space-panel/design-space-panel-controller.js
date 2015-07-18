define([
    'metapolator/ui/metapolator/services/dialog'
], function(
    dialog
) {
    "use strict";
    function DesignSpacePanelController($scope, metapolatorModel) {
        this.$scope = $scope;
        this.$scope.name = 'designSpacePanel';
        
        $scope.selectDesignSpace = function (space) {
            $scope.model.setCurrentDesignSpace(space); 
            // after switching design space, we need to set a new current instance  
            // the last instance used in the design space is stored as lastInstance
            if (space.lastInstance) {
                space.lastInstance.setCurrent();
            } else {
                metapolatorModel.instancePanel.setCurrentInstance(null);
            }
        };
        
        $scope.addDesignSpace = function() {
            $scope.model.addDesignSpace();
            metapolatorModel.instancePanel.setCurrentInstance(null);
            $scope.model.currentDesignSpace.lastInstance = null;
        };
        
        $scope.duplicateDesignSpace = function () {
            var oldDesignSpace = $scope.model.currentDesignSpace
              , panel = metapolatorModel.instancePanel;
            $scope.model.duplicateDesignSpace();
            var sequence0 = metapolatorModel.instancePanel.sequences[0];
            for (var i = metapolatorModel.instancePanel.sequences.length - 1; i >= 0; i--) {
                var sequence = metapolatorModel.instancePanel.sequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var instance = sequence.children[j];
                    if (instance.designSpace === oldDesignSpace) {
                        var axes = [];
                        for (var k = 0, l = instance.axes.length; k < l; k++) {
                            var axis = instance.axes[k];
                            axes.push({
                                axisValue: axis.axisValue,
                                metapolationValue : axis.metapolationValue,
                                master: axis.master
                            });
                        }
                        sequence0.addInstance(axes, $scope.model.currentDesignSpace);
                    }
                }
            } 
            panel.setCurrentInstance(panel.sequences[0].children[panel.sequences[0].children.length - 1]);
        };
        
        $scope.removeDesignSpace = function () {
            var designSpace = $scope.model.currentDesignSpace
              , message;
            if (designSpace.axes.length === 0) {
                $scope.model.removeDesignSpace(designSpace);
            } else {
                var n = metapolatorModel.instancePanel.countInstancesWithDesignSpace(designSpace);
                if (n === 1) {
                    message = "Delete this design space and its instance?";
                } else {
                    message = "Delete this design space and its " + n + " instances?";
                }
                dialog.confirm(message, function(result){
                    if (result) {
                        metapolatorModel.instancePanel.removeInstanceOnDesignSpace(designSpace);
                        designSpace.remove();
                        $scope.$apply();
                    }
                });
            }
        };
    }

    DesignSpacePanelController.$inject = ['$scope', 'metapolatorModel'];
    var _p = DesignSpacePanelController.prototype;

    return DesignSpacePanelController;
}); 