app.controller('instancesController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;
    
    
    
    
/***** selections *****/


    $scope.mouseDown = false;
    
    $scope.toggleViewSet = function(set, initialDisplay) {
        if (initialDisplay == "true") {
            var newStatus = false;
        } else {
            var newStatus = true;
        }
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                var hit = false;
                angular.forEach(set, function(selection) {
                    if (selection.parentObject == family.id && selection.childObject == instance.id) {
                        hit = true;
                    }
                });
                if (hit) {
                    instance.display = newStatus;
                }
            });
        }); 
    };

    $scope.toggleEdit = function(listItem) {
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (listItem.parentObject == family.id && listItem.childObject == instance.id) {
                    instance.edit = !instance.edit;
                    instance.display = instance.edit;
                }
            });
        });  
    };

    $scope.selectEdit = function(set) {
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                var hit = false;
                angular.forEach(set, function(selection) {
                    if (selection.parentObject == family.id && selection.childObject == instance.id) {
                        hit = true;
                    }
                });
                if (hit) {
                    instance.edit = true;
                    instance.display = true;
                } else {
                    instance.edit = false;
                    instance.display = false;
                }
            });
        });
    };

    $scope.deselectAllEdit = function() {
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                instance.edit = false;
            });
        });
    };
    
    
    
    
/***** controlling instances *****/
    
    
    function findInstanceId () {
        var max = 0;
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.id > max) {
                    max = instance.id;
                }
            });
        });
        max++;
        return max;
    }

    $scope.data.addInstance = function() {
        $scope.deselectAllEdit();
        if ($scope.data.canAddInstance()) {
            var designSpace = $scope.data.currentDesignSpace;
            var masterSet = jQuery.extend(true, [], designSpace.masters);
            var newValue = 1 / masterSet.length;
            angular.forEach(masterSet, function(thisMaster) {
                   thisMaster.value = newValue;
            });
            var id = findInstanceId();
            $scope.data.families[0].instances.push({
                id : id,
                edit : true,
                display : true,
                ag : "Ag",
                name : "New Instance " + id,
                designSpace : designSpace.id,
                fontFamily : "Roboto",
                fontWeight : 700,
                masters: masterSet,
            });
            $scope.data.currentInstance = $scope.data.families[0].instances[($scope.data.families[0].instances.length - 1)];
            $scope.data.localmenu.instances = false;
        }
    };
    
    $scope.duplicateInstance = function () {
        if ($scope.data.currentInstance) {
            $scope.deselectAllEdit();
            var duplicate = jQuery.extend(true, {}, $scope.data.currentInstance);
            duplicate.name += " copy";
            duplicate.edit = true;
            duplicate.id = findInstanceId();
            $scope.data.families[0].instances.push(duplicate);
            $scope.data.currentInstance = $scope.data.families[0].instances[($scope.data.families[0].instances.length - 1)];
        }
    };
    
    $scope.deleteInstance = function () {
        if ($scope.data.currentInstance) {
            $scope.data.families[0].instances.splice($scope.data.families[0].instances.indexOf($scope.currentInstance), 1);
            $scope.data.currentInstance = null;
            $scope.data.localmenu.instances = false;
            // set top instance as current
            if ($scope.data.families[0].instances.length) {
                $scope.data.currentInstance = $scope.data.families[0].instances[0];
                $scope.data.currentInstance.edit = true;
            }
        }
    };
    
    
    
    
/***** feedback on design spaces *****/
      
    
     
    $scope.data.currentInstance = null;

    $scope.setCurrentInstance = function(thisInstance) {
        $scope.data.currentInstance = thisInstance;
        setCurrentDesignSpace(thisInstance.designSpace);
        valueToAxes(thisInstance);
    };
    
    function setCurrentDesignSpace (id) {
        for (var i = 0; i < $scope.data.designSpaces.length; i++) {
            if ($scope.data.designSpaces[i].id == id) {
                $scope.data.currentDesignSpace = $scope.data.designSpaces[i];
                break;
            }
        }  
    }
    
    function valueToAxes(instance) {
        var designspace = $scope.data.currentDesignSpace;
        designspace.axes = [];
        var mastersNewOrder = [];
        var mastersCurrentOrder = instance.masters;
        // set masters of instance in order of designspace setup
        for (var i = 0; i < designspace.masters.length; i++) {
            var thisMaster = {
                masterId: designspace.masters[i].masterId,
                value: 0
            };
            for (var j = 0; j < mastersCurrentOrder.length; j++) {
                if (designspace.masters[i].masterId == mastersCurrentOrder[j].masterId) {
                    thisMaster.value = mastersCurrentOrder[j].value;
                }  
            }
            mastersNewOrder.push(thisMaster);
        }
        // translate ratio to slider value
        // the little correction to avoid /0 i not yet included here
        for (var i = 1; i < mastersNewOrder.length; i++) {
            var thisRatio = mastersNewOrder[i].value / mastersNewOrder[0].value;
            
            var thisValue = roundup(100 - (100.5 - 0.5 * thisRatio) / (1 + thisRatio));
            designspace.axes.push({
                value : thisValue
            });
        }
    }
    
    function roundup(a) {
        var b = Math.round(a * 10) / 10;
        return b;
    }


    
    
/***** bottom buttons *****/


    $scope.data.canAddInstance = function() {
        var designSpace = $scope.data.currentDesignSpace;
        if ((designSpace && designSpace.type == "Control" && designSpace.axes.length > 0) || (designSpace.type == "Explore" && designSpace.masters.length > 0) ) {
            return true;
        } else {
            return false;
        }
    };
    
    
    
    
/***** sortable *****/
    
    
    $scope.sortableOptionsMasters = {
        handle : '.list-edit-col',
        helper : 'clone',
    };

});
