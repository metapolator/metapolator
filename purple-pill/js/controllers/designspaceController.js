app.controller('designspaceController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.data.currentDesignSpace = $scope.data.designSpaces[0];

    $scope.data.findMaster = function(id) {
        for (var i = 0; i < $scope.data.sequences.length; i++) {
            for (var j = 0; j < $scope.data.sequences[i].masters.length; j++) {
                if ($scope.data.sequences[i].masters[j].id == id) {
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
        $scope.data.currentInstance.display = true;  
        }
    };

    $scope.addDesignSpace = function() {
        var i = $scope.data.designSpaces.length;
        var id = findDesignSpaceId();
        $scope.data.designSpaces.push({
            name : "Space " + id,
            id : id,
            type : "Control",
            masters : [],
            axes : [],
            triangle : false,
            mainMaster : "0",
            trigger : 0 //this is to trigger the designspace to redraw when a master is renamed
        });
        $scope.data.currentDesignSpace = $scope.data.designSpaces[($scope.data.designSpaces.length - 1)];
        $scope.data.deselectAllEdit();
        $scope.data.currentInstance = null;
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

    $scope.getMetapolationRatios = function() {
        var designspace = $scope.data.currentDesignSpace;
        var masterSet = jQuery.extend(true, [], designspace.masters);
        var axes = designspace.axes;
        var n = axes.length;
        var cake = 1;
        for (var i = 0; i < n; i++) {
            cake += (parseInt(axes[i].value) + 0.5) / (100.5 - parseInt(axes[i].value));
        }
        masterSet[0].value = 1 / cake;

        for (var i = 0; i < n; i++) {
            var piece = (parseInt(axes[i].value) + 0.5) / (100.5 - parseInt(axes[i].value));
            masterSet[i + 1].value = piece / cake;
        }
        $scope.data.currentInstance.masters = masterSet;
    };

    function roundup(a) {
        var b = Math.round(a * 1000) / 1000;
        return b;
    }

    //

    $scope.removeMaster = function(m) {
        var designspace = $scope.data.currentDesignSpace;
        var masterSet = designspace.masters;
        if (confirm("Removing master from this Design Space, and also from all Instances in this Design Space. Sure?")) {
            // remove master from all instances in this design space
            angular.forEach($scope.data.families, function(family) {
                angular.forEach(family.instances, function(instance) {
                    if (instance.designSpace == designspace.id) {
                        // remove axis from instance
                        instance.axes.splice((m - 1), 1);
                        // remove master from masterslist and redistribute proportions over remaining masters
                        angular.forEach(instance.masters, function(master, index) {
                            if (master.masterId == masterSet[m].masterId) {
                                instance.masters.splice(index, 1);
                                reDistribute(instance.masters);
                            }
                        });
                    }
                });
            });
            // remove the master from the designspace
            masterSet.splice(m, 1);
            designspace.axes.splice((m - 1), 1);
            $scope.$apply();
        }
    };

    function reDistribute(masters) {
        var totalValue = 0;
        angular.forEach(masters, function(master) {
            totalValue += master.value;
        });
        var addFactor = 1 / totalValue;
        angular.forEach(masters, function(master) {
            master.value *= addFactor;
        });
        return masters;
    }


    $scope.changeMainMaster = function() {
        var designspace = $scope.data.currentDesignSpace;
        // swop main master in each instance in the design space
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designSpace == designspace.id) {
                    // swop masters
                    var masterSet = instance.masters;
                    var n = designspace.mainMaster;
                    var tempMaster = masterSet[0];
                    masterSet[0] = masterSet[n];
                    masterSet[n] = tempMaster;
                    
                    // calculate metapolation value to new axes
                    instance.axes = [];
                    for (var i = 1; i < masterSet.length; i++) {
                        var thisRatio = masterSet[i].value / masterSet[0].value;
                        var thisValue = roundupsmall(100 - (100.5 - 0.5 * thisRatio) / (1 + thisRatio));
                        instance.axes.push({
                            value : thisValue
                        });
                    }
                }
            });
        });
        
        // swop main master in the designspace
        var masterSet = designspace.masters;
        var n = designspace.mainMaster;
        var tempMaster = masterSet[0];
        masterSet[0] = masterSet[n];
        masterSet[n] = tempMaster;
        designspace.mainMaster = "0";
        
        // trigger the designspace to redraw
        $scope.data.currentDesignSpace.trigger++;
    };

    function valueToAxes() {
        var designspace = $scope.data.currentDesignSpace;
        // for all instances in this design space
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designSpace == designspace.id) {
                    console.log("revalue");
                    instance.axes = [];
                    var masters = instance.masters;
                    for (var i = 1; i < masters.length; i++) {
                        var thisRatio = masters[i].value / masters[0].value;
                        var thisValue = roundupsmall(100 - (100.5 - 0.5 * thisRatio) / (1 + thisRatio));
                        instance.axes.push({
                            value : thisValue
                        });
                    }
                }
            });
        });
        console.log($scope.data.currentInstance.masters[0]);
        /*
        designspace.axes = [];
        var masters = designspace.masters;
        for (var i = 1; i < masters.length; i++) {
            var thisRatio = masters[i].value / masters[0].value;
            var thisValue = roundupsmall(100 - (100.5 - 0.5 * thisRatio) / (1 + thisRatio));
            designspace.axes.push({
                value : thisValue
            });
        }
        */
    }

    function roundupsmall(a) {
        var b = Math.round(a * 10) / 10;
        return b;
    }

});
