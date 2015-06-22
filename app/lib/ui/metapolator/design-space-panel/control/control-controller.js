define([], function() {
    "use strict";
    function ControlController($scope, metapolatorModel) {
        this.$scope = $scope;
        this.$scope.name = 'control';
        $scope.instancePanel = metapolatorModel.instancePanel;
        $scope.designSpacePanel = metapolatorModel.designSpacePanel;
        
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
            metapolatorModel.display.dialog.confirm(message, function(result){
                if(result) {
                    if (n2 == 1) {
                        metapolatorModel.instancePanel.removeInstanceOnDesignSpace(designSpace);
                        designSpace.removeAxis(master);   
                    } else {
                        metapolatorModel.instancePanel.deleteMasterFromInstances(designSpace, master);
                        designSpace.removeAxis(master);
                    }
                    $scope.$apply();
                }
            });
        };
    }

    ControlController.$inject = ['$scope', 'metapolatorModel'];
    var _p = ControlController.prototype;

    return ControlController;
}); 