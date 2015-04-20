app.controller('designspaceController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    // controlling and selecting designspaces

    $scope.data.currentDesignspace = $scope.data.designspaces[0];
    $scope.designspaceWidth;

    $scope.data.findMaster = function(masterName) {
        for (var i = 0; i < $scope.data.sequences.length; i++) {
            for (var j = 0; j < $scope.data.sequences[i].masters.length; j++) {
                if ($scope.data.sequences[i].masters[j].name == masterName) {
                    return $scope.data.sequences[i].masters[j];
                    break;
                }
            }
        }
    };

    $scope.selectDesignspace = function(designspace) {
        $scope.data.currentDesignspace = designspace;
        $scope.data.selectCurrentInstanceFromDesignspace(designspace.id);
    };
    
    $scope.data.getDesignspaceName = function (designspaceId) {
        var designspaceName;
        angular.forEach($scope.data.designspaces, function(designspace) {
            if (designspace.id == designspaceId) {
                designspaceName = designspace.name;
            }
        });
        return designspaceName;
    };
   

    $scope.addDesignspace = function() {
        var id = findDesignspaceId();
        $scope.data.designspaces.push({
            name : "Space " + id,
            id : id,
            type : "x",
            axes : [],
            mainMaster : 0,
            trigger : 0 //this is to trigger the designspace to redraw when a master is renamed
        });
        $scope.data.currentDesignspace = $scope.data.designspaces[($scope.data.designspaces.length - 1)];
        $scope.data.currentInstance = null;
        $scope.data.localmenu.designspace = false;
    };

    $scope.removeDesignspace = function() {
        if ($scope.data.currentDesignspace.axes.length == 0) {
            remove();
        } else {
            if (confirm("This will remove all Instances in this Design Space. Sure?")) {
                remove();
            }
        }
        function remove(){
            $scope.data.designspaces.splice($scope.data.designspaces.indexOf($scope.data.currentDesignspace), 1);
            $scope.setLastDesignspace();
        }
        $scope.setNewCurrentDesignspace();   
        $scope.data.localmenu.designspace = false;
    };

    $scope.setNewCurrentDesignspace = function() {
        $scope.data.currentDesignspace = $scope.data.designspaces[($scope.data.designspaces.length - 1)];
    };

    $scope.duplicateDesignspace = function() {
        var duplicate = jQuery.extend(true, {}, $scope.data.currentDesignspace);
        var oldId = duplicate.id;
        var duplicateId = findDesignspaceId();
        duplicate.name += " copy";
        duplicate.id = duplicateId;
        $scope.data.designspaces.push(duplicate);
        $scope.data.currentDesignspace = $scope.data.designspaces[($scope.data.designspaces.length - 1)];
        // duplicate its instances
        var toBeDuplicated = [];
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designspace == oldId) {
                    toBeDuplicated.push(instance);
                }
            });
        });
        angular.forEach(toBeDuplicated, function(duplicate) {
            $scope.data.duplicateInstance(duplicate, duplicateId);
        });
        $scope.data.localmenu.designspace = false;
    };

    function findDesignspaceId() {
        var max = 0;
        for (var i = 0; i < $scope.data.designspaces.length; i++) {
            if ($scope.data.designspaces[i].id > max) {
                max = $scope.data.designspaces[i].id;
            }
        }
        max++;
        return max;
    }




    //

    $scope.removeMasterFromDesignspace = function(m, designspace, confirmNeeded) {
        var axesSet = designspace.axes;
        if (confirmNeeded) {
            if (confirm("Removing master from this Design Space, and also from all Instances in this Design Space. Sure?")) {
                deleteMaster();
                $scope.$apply();
            }
        } else {
            deleteMaster();
        }
        
        function deleteMaster() {
           // remove master from all instances in this design space
            angular.forEach($scope.data.families, function(family) {
                angular.forEach(family.instances, function(instance) {
                    if (instance.designspace == designspace.id) {
                        // remove axis from instance
                        if (instance.axes.length == 1) {
                            $scope.data.deleteInstanceFromDesignspace(instance);
                        } else {
                            instance.axes.splice(m, 1);
                            $scope.reDistributeValues(instance.axes);
                        }
                    }
                });
            });
            // remove the master from the designspace
            designspace.axes.splice(m, 1);
            if (designspace.axes.length == 0) {
                designspace.type = "x";
            }
    
            // reassigning the key of mainmaster
            if (m < designspace.mainMaster) {
                designspace.mainMaster--;
            } else if (m == designspace.mainMaster) {
                designspace.mainMaster = 0;
            }
            if (designspace.axes.length < 3) {
                designspace.mainMaster = 0;
            }
        }

    };

    $scope.data.removeMasterFromEachDesignspaces = function(masterName) {
        // this is a method called from the masters list, when deleting a master
        angular.forEach($scope.data.designspaces, function(designspace) {
            angular.forEach(designspace.axes, function(axis, index) {
                if (axis.masterName == masterName) {
                    $scope.removeMasterFromDesignspace(index, designspace, false);
                }
            });
        });
    };

    $scope.data.checkIfIsLargest = function() {
        console.log("check if is largest");
        var isLargest = false;
        var designspace = $scope.data.currentDesignspace;
        var axes = designspace.axes;
        if (axes.length > 2) {
            var slack = axes[designspace.mainMaster];
            var newMaster = axes[axes.length - 1];
            angular.forEach(axes, function(axis) {
                if (newMaster.value > axis.value && axis != slack) {
                    isLargest = true;
                }
            });
            angular.forEach($scope.data.families, function(family) {
                angular.forEach(family.instances, function(instance) {
                    if (instance.designspace == designspace.id) {
                        $scope.reDestributeAxes(instance.axes);
                    }
                });
            });
        }
    };

    $scope.reDestributeAxes = function(axes) {
        console.log("redistribute axes");
        var designspace = $scope.data.currentDesignspace;
        var slack = designspace.mainMaster;
        // 1 find highest of the others
        var max = 0;
        var highest;
        for (var i = 0; i < axes.length; i++) {
            if (parseFloat(axes[i].value) >= max && i != slack) {
                highest = i;
                max = parseFloat(axes[i].value);
            }
        }

        // 2 find ratio of others compared to highest
        var ratio = 100 / (parseFloat(axes[highest].value) + parseFloat(axes[slack].value));
        for (var i = 0; i < axes.length; i++) {
            axes[i].value = formatX(ratio * axes[i].value);
        }
    };

    $scope.reDistributeValues = function(axes) {
        console.log("redistribute values");
        var totalValue = 0;
        angular.forEach(axes, function(axis) {
            totalValue += axis.metapValue;
        });
        var addFactor = 1 / totalValue;
        angular.forEach(axes, function(axis) {
            axis.metapValue *= addFactor;
        });
    };

    $scope.changeMainMaster = function() {
        console.log("change mainmaster");
        var designspace = $scope.data.currentDesignspace;
        var slack = designspace.mainMaster;
        // swop main master in each instance in the design space
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designspace == designspace.id) {
                    $scope.reDestributeAxes(instance.axes);
                }
            });
        });
        // trigger the designspace to redraw
        $scope.data.currentDesignspace.trigger++;
    };

    function formatX(x) {
        var roundedX = Math.round(x * 10) / 10;
        var toF = roundedX.toFixed(1);
        return toF;
    }



    $scope.redrawAxesFromInput = function(inputAxis, keyEvent) {
        console.log("redraw after input");
        if (keyEvent == "blur" || keyEvent.keyCode == 13) {
            var designspace = $scope.data.currentDesignspace;
            var slack = $scope.data.currentDesignspace.mainMaster;
            var instance = $scope.data.currentInstance;
            var axes = instance.axes;
            // prevent input beyond 0 - 100 or NaN
            if (isNaN(axes[inputAxis].value) || axes[inputAxis].value == "") {
                axes[inputAxis].value = 0;
            }
            if (axes[inputAxis].value > 100) {
                axes[inputAxis].value = 100;
            }
            if (axes[inputAxis].value < 0) {
                axes[inputAxis].value = 0;
            }
            designspace.axes[inputAxis].value = axes[inputAxis].value;
            // find the highest non-slack master
            var max = 0;
            for (var i = 0; i < axes.length; i++) {
                if (parseFloat(axes[i].value) >= max && i != slack) {
                    max = parseFloat(axes[i].value);
                }
            }
            if (inputAxis != slack) {
                // correct the slack behaviour
                axes[slack].value = 100 - max;
                designspace.axes[slack].value = 100 - max;
            } else {
                var newMax = 100 - axes[slack].value;
                if (max != 0) {
                    var ratio = newMax / max;
                } else {
                    var ratio = 1;
                }
                // correct all sliders but slack proportionally
                for (var i = 0; i < axes.length; i++) {
                    if (i != slack) {
                        var thisValue = formatX(ratio * axes[i].value);
                        axes[i].value = thisValue;
                        designspace.axes[i].value = thisValue;
                    }
                }
            }
            $scope.data.getMetapolationRatios(instance);
            $scope.data.currentDesignspace.trigger++;
        }
    };

});
