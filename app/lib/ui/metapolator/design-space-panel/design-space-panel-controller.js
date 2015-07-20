define([
    'metapolator/ui/metapolator/services/dialog'
  , 'metapolator/ui/metapolator/services/instanceTools'
], function(
    dialog
  , instanceTools
) {
    "use strict";
    function DesignSpacePanelController($scope, metapolatorModel, project) {
        this.$scope = $scope;
        this.$scope.name = 'designSpacePanel';
        
        $scope.selectDesignSpace = function (space) {
            space.setCurrent();
            // after switching design space, we need to set a new current instance  
            // the last instance used in the design space is stored as lastInstance
            if (space.lastInstance) {
                space.lastInstance.setCurrent();
            } else {
                metapolatorModel.instancePanel.currentInstance = null;
            }
        };
        
        $scope.addDesignSpace = function() {
            $scope.model.createNewDesignSpace();
            metapolatorModel.instancePanel.currentInstance = null;
        };
        
        $scope.cloneDesignSpace = function () {
            var oldDesignSpace = $scope.model.currentDesignSpace
              , panel = metapolatorModel.instancePanel;
            oldDesignSpace.clone();
            var sequence0 = metapolatorModel.instancePanel.sequences[0];
            for (var i = metapolatorModel.instancePanel.sequences.length - 1; i >= 0; i--) {
                var sequence = metapolatorModel.instancePanel.sequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var instance = sequence.children[j];
                    if (instance.designSpace === oldDesignSpace) {
                        // clone the instance as well
                        var axes = []
                          , clone;
                        for (var k = 0, l = instance.axes.length; k < l; k++) {
                            var axis = instance.axes[k];
                            axes.push({
                                axisValue: axis.axisValue,
                                metapolationValue : axis.metapolationValue,
                                master: axis.master
                            });
                        }
                        clone = sequence0.createNewInstance(axes, $scope.model.currentDesignSpace);
                        instanceTools.registerInstance(project, clone);
                        sequence0.addInstance(clone);
                    }
                }
            } 
        };
        
        $scope.removeDesignSpace = function () {
            var designSpace = $scope.model.currentDesignSpace
              , message;
            if (designSpace.axes.length === 0) {
                $scope.model.removeDesignSpace(designSpace);
            } else {
                var instancesInDesignSpace = metapolatorModel.instancePanel.getInstancesInDesignSpace(designSpace);
                var n = instancesInDesignSpace.length;
                if (n === 1) {
                    message = "Delete this design space and its instance?";
                } else {
                    message = "Delete this design space and its " + n + " instances?";
                }
                dialog.confirm(message, function(result){
                    if (result) {
                        removeInstancesInDesignSpace(instancesInDesignSpace);
                        designSpace.remove();
                        $scope.$apply();
                    }
                });
            }
        };

        function removeInstancesInDesignSpace(instances) {
            for (var i = 0, l = instances.length; i < l; i++) {
                var instance = instances[i];
                instance.remove();
            }
        }
    }

    DesignSpacePanelController.$inject = ['$scope', 'metapolatorModel', 'project'];
    var _p = DesignSpacePanelController.prototype;

    return DesignSpacePanelController;
}); 