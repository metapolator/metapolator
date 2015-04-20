app.controller('designspaceController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.data.currentDesignSpace = $scope.data.designSpaces[0];
    $scope.designSpaceWidth

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

    $scope.selectDesignSpace = function(designSpace) {
        $scope.data.currentDesignSpace = designSpace;
        var id = designSpace.id;
        // set last instance of this design space as current instance
        var instanceInSpace = null;
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designSpace == id) {
                    instanceInSpace = instance;
                }
            });
        });
        $scope.data.deselectAllEdit();
        if (instanceInSpace) {
            $scope.data.currentInstance = instanceInSpace;
            $scope.data.currentInstance.edit = true;
        }
    };

    $scope.addDesignSpace = function() {
        var id = findDesignSpaceId();
        $scope.data.designSpaces.push({
            name : "Space " + id,
            id : id,
            type : "x",
            axes : [],
            mainMaster : 0,
            trigger : 0 //this is to trigger the designspace to redraw when a master is renamed
        });
        $scope.data.currentDesignSpace = $scope.data.designSpaces[($scope.data.designSpaces.length - 1)];
        $scope.data.deselectAllEdit();
        $scope.data.currentInstance = null;
        $scope.data.localmenu.designspace = false;
    };

    $scope.removeDesignSpace = function() {
        if ($scope.data.currentDesignSpace.axes.length == 0) {
            $scope.data.designSpaces.splice($scope.data.designSpaces.indexOf($scope.data.currentDesignSpace), 1);
            $scope.setLastDesignspace();
        } else {
            if (confirm("This will remove all Instances in this Design Space. Sure?")) {
                $scope.data.designSpaces.splice($scope.data.designSpaces.indexOf($scope.data.currentDesignSpace), 1);
                $scope.data.deleteInstanceDirect($scope.data.currentDesignSpace.id);
            }
        }
        $scope.setLastDesignspace();   
        $scope.data.localmenu.designspace = false;
    };

    $scope.setLastDesignspace = function() {
        var lastDesignspace;
        angular.forEach($scope.data.designSpaces, function(space) {
            lastDesignspace = space;
        });
        $scope.selectDesignSpace(lastDesignspace);
    };

    $scope.duplicateDesignSpace = function() {
        var duplicate = jQuery.extend(true, {}, $scope.data.currentDesignSpace);
        var oldId = duplicate.id;
        var duplicateId = findDesignSpaceId();
        duplicate.name += " copy";
        duplicate.id = duplicateId;
        $scope.data.designSpaces.push(duplicate);
        $scope.data.currentDesignSpace = $scope.data.designSpaces[($scope.data.designSpaces.length - 1)];
        // duplicate its instances
        var toBeDuplicated = [];
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designSpace == oldId) {
                    toBeDuplicated.push(instance);
                }
            });
        });
        angular.forEach(toBeDuplicated, function(duplicate) {
            $scope.data.duplicateInstance(duplicate, duplicateId);
        });
        $scope.data.localmenu.designspace = false;
    };

    function findDesignSpaceId() {
        var max = 0;
        for (var i = 0; i < $scope.data.designSpaces.length; i++) {
            if ($scope.data.designSpaces[i].id > max) {
                max = $scope.data.designSpaces[i].id;
            }
        }
        max++;
        return max;
    }


    $scope.output = [];
    $scope.total = 0;

    $scope.data.getMetapolationRatios = function(instance) {
        var axes = instance.axes;
        var n = axes.length;
        var cake = 0;
        for (var i = 0; i < n; i++) {
            cake += parseFloat(axes[i].value);
        }
        for (var i = 0; i < n; i++) {
            var piece = parseFloat(axes[i].value);
            instance.axes[i].metapValue = piece / cake;
        }
    };

    function roundup(a) {
        var b = Math.round(a * 1000) / 1000;
        return b;
    }

    //

    $scope.removeMaster = function(m, designspace) {
        var axesSet = designspace.axes;
        if (confirm("Removing master from this Design Space, and also from all Instances in this Design Space. Sure?")) {
            // remove master from all instances in this design space
            angular.forEach($scope.data.families, function(family) {
                angular.forEach(family.instances, function(instance) {
                    if (instance.designSpace == designspace.id) {
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
            $scope.$apply();
            //$scope.data.currentDesignSpace.trigger++;

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

    $scope.data.removeMasterFromDesignSpace = function(masterName) {
        // this is a method called from the masters list, when deleting a master
        angular.forEach($scope.data.designSpaces, function(designspace) {
            angular.forEach(designspace.axes, function(axis, index) {
                if (axis.masterName == masterName) {
                    $scope.removeMaster(index, designspace);
                }
            });
        });
    };

    $scope.data.checkIfIsLargest = function() {
        var isLargest = false;
        var designspace = $scope.data.currentDesignSpace;
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
                    if (instance.designSpace == designspace.id) {
                        $scope.reDestributeAxes(instance.axes);
                    }
                });
            });
        }
    };

    $scope.reDestributeAxes = function(axes) {
        var designspace = $scope.data.currentDesignSpace;
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
        var designspace = $scope.data.currentDesignSpace;
        var slack = designspace.mainMaster;
        // swop main master in each instance in the design space
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designSpace == designspace.id) {
                    $scope.reDestributeAxes(instance.axes);
                }
            });
        });
        // trigger the designspace to redraw
        $scope.data.currentDesignSpace.trigger++;
    };

    function formatX(x) {
        var roundedX = Math.round(x * 10) / 10;
        var toF = roundedX.toFixed(1);
        return toF;
    }

    function roundupsmall(a) {
        var b = Math.round(a * 10) / 10;
        return b;
    }


    $scope.redrawAxesFromInput = function(inputAxis, keyEvent) {
        if (keyEvent == "blur" || keyEvent.keyCode == 13) {
            var designspace = $scope.data.currentDesignSpace;
            var slack = $scope.data.currentDesignSpace.mainMaster;
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
            $scope.data.currentDesignSpace.trigger++;
        }
    };

});
