define([
    'metapolator/ui/metapolator/services/instanceTools'
  , 'metapolator/ui/metapolator/services/dialog'
], function(
    instanceTools
  , dialog
) {
    'use strict';
    function ControlController($scope, project) {
        this.$scope = $scope;

        $scope.setMetapolationValues = function(instance) {
            instance.setMetapolationValues(project);
        };
        
        $scope.changeSlackMaster = function() {
            var designSpace = $scope.model;
            var slack = designSpace.slack;
            // swop main master in each instance in the design space
            for (var i = $scope.model.instances.length - 1; i >= 0; i--) {
                var sequence = $scope.model.instances.sequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var instance = sequence.children[j];
                    if (instance.designSpace == designSpace) {
                        instance.reDestributeAxes(slack);
                    }
                }
                
            }
            // trigger the designspace to redraw
            designSpace.parent.currentDesignSpaceTrigger++;
        };
        
        $scope.redrawAxesFromInput = function(inputAxis, keyEvent) {
            if (keyEvent === 'blur' || keyEvent.keyCode === 13) {
                var designSpace = $scope.model
                  , slack = designSpace.slack
                  , instance = designSpace.lastInstance
                  , axes = instance.axes
                  , l = axes.length;
                axes[inputAxis].value = format(axes[inputAxis].value);

                // find the highest non-slack master
                var max = 0;
                for (var i = 0; i < l; i++) {
                    if (parseFloat(axes[i].axisValue) >= max && i != slack) {
                        max = parseFloat(axes[i].axisValue);
                    }
                }
                if (inputAxis != slack) {
                    // correct the slack behaviour
                    axes[slack].axisValue = 100 - max;
                } else {
                    var newMax = 100 - axes[slack].axisValue
                      , ratio;
                    if (max !== 0) {
                        ratio = newMax / max;
                    } else {
                        ratio = 1;
                    }
                    // correct all sliders but slack proportionally
                    for (var j = 0; j < l; j++) {
                        if (i != slack) {
                            axes[j].axisValue = instance.formatAxisValue(ratio * axes[j].axisValue);
                        }
                    }
                }
                instance.updateMetapolationValues();
                // trigger the design space to redraw
                designSpace.parent.currentDesignSpaceTrigger++;
            }
            
            function format(value) {
                if (isNaN(value) || value === '' || value < 0) {
                    return 0;
                } else  if (value > 100) {
                    return 100;
                } else {
                    return value;
                }
            }
        };
        
        $scope.removeMaster = function (master, designSpace) {
            var axesWithMaster = $scope.model.parent.getInstanceAxesWithMaster(master, designSpace)
              , n = axesWithMaster.length
              , n2 = designSpace.axes.length
              , message = ''
              , slack;
            if (n2 === 1) {
                if (n === 1) {
                    message = 'Remove master? This will remove an instance as well.';
                } else {
                    message = 'Remove master? This will remove instances as well.';
                }
            }
            else {   
                if (n === 1) {
                    message = 'Remove master? It will no longer be part of the instance afterwards.';
                } else {
                    message = 'Remove master? It will no longer be part of the instances afterwards.';
                }
            }
            dialog.confirm(message, function(result){
                if(result) {
                    if (n2 === 1) {
                        designSpace.removeAxis(master);
                        removeInstances(axesWithMaster);
                    } else {
                        designSpace.removeAxis(master);
                        removeMasterFromInstances(axesWithMaster, slack);
                    }
                    $scope.$apply();
                }
            });
        };

        function removeInstances(axesWithMaster) {
            for (var i = axesWithMaster.length - 1; i >= 0; i--) {
                var instance = axesWithMaster[i].parent;
                instance.remove();
            }
        }

        function removeMasterFromInstances(axesWithMaster) {
            for (var i = axesWithMaster.length - 1; i >= 0; i--) {
                var axis = axesWithMaster[i];
                axis.remove();
            }
        }
    }

    ControlController.$inject = ['$scope', 'project'];
    var _p = ControlController.prototype;

    return ControlController;
}); 