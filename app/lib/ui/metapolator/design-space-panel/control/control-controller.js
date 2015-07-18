define([
    'metapolator/ui/metapolator/services/instanceTools'
  , 'metapolator/ui/metapolator/services/dialog'
], function(
    instanceTools
  , dialog
) {
    "use strict";
    function ControlController($scope, metapolatorModel, project) {
        this.$scope = $scope;
        this.$scope.name = 'control';
        $scope.instancePanel = metapolatorModel.instancePanel;
        $scope.designSpacePanel = metapolatorModel.designSpacePanel;

        $scope.setMetapolationValues = function(instance) {
            instance.setMetapolationValues(project);
        };
        
        $scope.changeSlackMaster = function() {
            var designSpace = $scope.model;
            var slack = designSpace.slack;
            // swop main master in each instance in the design space
            for (var i = metapolatorModel.instancePanel.sequences.length - 1; i >= 0; i--) {
                var sequence = metapolatorModel.instancePanel.sequences[i];
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
            if (keyEvent == "blur" || keyEvent.keyCode == 13) {
                window.logCall("redrawAxesFromInput");
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
                    var newMax = 100 - axes[slack].axisValue;
                    if (max != 0) {
                        var ratio = newMax / max;
                    } else {
                        var ratio = 1;
                    }
                    // correct all sliders but slack proportionally
                    for (var i = 0; i < l; i++) {
                        if (i != slack) {
                            var thisValue = instance.formatAxisValue(ratio * axes[i].axisValue);
                            axes[i].axisValue = thisValue;
                        }
                    }
                }
                instance.updateMetapolationValues();
                // trigger the design space to redraw
                designSpace.parent.currentDesignSpaceTrigger++;
            }
            
            function format(value) {
                var output;
                if (isNaN(value) || value == "" || value < 0) {
                    return 0;
                } else  if (value > 100) {
                    return 100;
                } else {
                    return value;
                }
            }
        };
        
        $scope.removeMaster = function (master, designSpace) {
            var n = metapolatorModel.instancePanel.countInstancesWithMaster(master);
            var n2 = designSpace.axes.length;
            var message = "";
            if (n2 == 1) {
                if (n == 1) {
                    message = "Remove master? This will remove an instance as well.";
                } else {
                    message = "Remove master? This will remove instances as well.";
                }
            }
            else {   
                if (n == 1) {
                    message = "Remove master? It will no longer be part of the instance afterwards.";
                } else {
                    message = "Remove master? It will no longer be part of the instances afterwards.";
                }
            }
            dialog.confirm(message, function(result){
                if(result) {
                    if (n2 == 1) {
                        designSpace.removeAxis(master);   
                        metapolatorModel.instancePanel.removeInstanceOnDesignSpace(designSpace);
                    } else {
                        designSpace.removeAxis(master);
                        metapolatorModel.instancePanel.deleteMasterFromInstances(designSpace, master);
                    }
                    $scope.$apply();
                }
            });
        };
    }

    ControlController.$inject = ['$scope', 'metapolatorModel', 'project'];
    var _p = ControlController.prototype;

    return ControlController;
}); 