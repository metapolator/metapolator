define([], function() {
    "use strict";
    function DesignSpacePanelController($scope, metapolatorModel) {
        this.$scope = $scope;
        this.$scope.name = 'designSpacePanel';
        
        $scope.selectDesignSpace = function (space) {
            $scope.model.setCurrentDesignSpace(space); 
            // after switching design space, we need to set a new current instance  
            metapolatorModel.instancePanel.setCurrentInstance(getCurrentInstance());

            function getCurrentInstance() {
                for (var i = metapolatorModel.instancePanel.sequences.length - 1; i >= 0; i--) {
                    var sequence = metapolatorModel.instancePanel.sequences[i];
                    for (var j = sequence.children.length - 1; j >= 0; j--) {
                        var instance = sequence.children[j];
                        if (instance.designSpace == space) {
                            // this picks the last created instance in this space (because of --)
                            return instance;
                        }
                    }
                } 
            }
        };
        
        $scope.addDesignSpace = function() {
            $scope.model.addDesignSpace();
            metapolatorModel.instancePanel.setCurrentInstance(null);
        };
        
        $scope.duplicateDesignSpace = function () {
            var oldDesignSpace = $scope.model.currentDesignSpace
              , panel = metapolatorModel.instancePanel;
            $scope.model.duplicateDesignSpace();
            var designSpace = $scope.model.currentDesignSpace;
            var sequence0 = metapolatorModel.instancePanel.sequences[0];
            for (var i = metapolatorModel.instancePanel.sequences.length - 1; i >= 0; i--) {
                var sequence = metapolatorModel.instancePanel.sequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var instance = sequence.children[j];
                    if (instance.designSpace == oldDesignSpace) {
                        var axes = angular.copy(instance.axes);
                        sequence0.addInstance(axes, $scope.model.currentDesignSpace);
                    }
                }
            } 
            panel.setCurrentInstance(panel.sequences[0].children[panel.sequences[0].children.length - 1]);
        };
        
        $scope.removeDesignSpace = function () {
            var designSpace = $scope.model.currentDesignSpace;
            if (designSpace.axes.length == 0) {
                $scope.model.removeDesignSpace(designSpace);
            } else {
                var n = metapolatorModel.instancePanel.countInstancesWithDesignSpace(designSpace);
                if (n == 1) {
                    var message = "Delete this design space and its instance?";
                } else {
                    var message = "Delete this design space and its " + n + " instances?";
                }
                metapolatorModel.display.dialog.confirm(message, function(result){
                    if (result) {
                        metapolatorModel.instancePanel.removeInstanceOnDesignSpace(designSpace);
                        $scope.model.removeDesignSpace(designSpace);
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