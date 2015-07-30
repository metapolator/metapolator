define([
    'metapolator/ui/metapolator/ui-tools/dialog'
  , 'metapolator/ui/metapolator/ui-tools/instanceTools'
], function(
    dialog
  , instanceTools
) {
    "use strict";
    function DesignSpacePanelController($scope, project) {
        this.$scope = $scope;
        this.$scope.name = 'designSpacePanel';
        
        $scope.selectDesignSpace = function (space) {
            space.setCurrent();
            // after switching design space, we need to set a new current instance  
            // the last instance used in the design space is stored as lastInstance
            if (space.lastInstance) {
                space.lastInstance.setCurrent();
            } else {
                $scope.model.currentInstance = null;
            }
        };
        
        $scope.addDesignSpace = function() {
            $scope.model.createNewDesignSpace();
            $scope.model.currentInstance = null;
        };
        
        $scope.cloneDesignSpace = function () {
            var oldDesignSpace = $scope.model.currentDesignSpace;
            oldDesignSpace.clone();
            var sequence0 = $scope.model.instanceSequences[0];
            for (var i = $scope.model.instanceSequences.length - 1; i >= 0; i--) {
                var sequence = $scope.model.instanceSequences[i];
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
                designSpace.remove();
            } else {
                var instancesInDesignSpace = $scope.model.getInstancesInDesignSpace(designSpace);
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

    DesignSpacePanelController.$inject = ['$scope', 'project'];
    var _p = DesignSpacePanelController.prototype;

    return DesignSpacePanelController;
}); 