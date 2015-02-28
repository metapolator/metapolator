app.controller('instancesController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;
    
    
    function findInstanceId () {
        var max = 0;
        for (var i =0; i < $scope.data.instances.length; i++) {
            if ($scope.data.instances[i].id > max) {
                max = $scope.data.instances[i].id;
            }
        }
        max++;
        return max;
    }

    $scope.addInstance = function() {
        var designSpace = $scope.data.currentDesignSpace;
        var id = findInstanceId();
        $scope.data.instances.push({
            id : id,
            name : "New Instance " + id,
            designSpace : designSpace.id,
            fontFamily : "Roboto",
            fontWeight : 700,
            edit : false,
            display : false,
            masters: jQuery.extend(true, [], designSpace.masters),
        });
        $scope.currentInstance = $scope.data.instances[($scope.data.instances.length - 1)];
    };
    
    $scope.duplicateInstance = function () {
        var duplicate = jQuery.extend(true, {}, $scope.currentInstance);
        duplicate.name += " copy";
        $scope.data.instances.push(duplicate);
        $scope.currentInstance = $scope.data.instances[($scope.data.instances.length - 1)];
    };
    
    $scope.deleteInstance = function () {
        $scope.data.instances.splice($scope.data.instances.indexOf($scope.currentInstance), 1);
        $scope.currentInstance = null;
    };
    
    // selecting
    
    $scope.currentInstance = null;
    
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
            var thisValue = roundup(thisRatio / (1 + thisRatio) * 100);
            designspace.axes.push({
                value : thisValue
            });
        }
    }
    
    function roundup(a) {
        var b = Math.round(a * 10) / 10;
        return b;
    }

    $scope.selectInstancesForEdit = function(thisInstance, sIndex, mIndex) {
        $scope.currentInstance = thisInstance;
        thisInstance.edit = !thisInstance.edit;
        setCurrentDesignSpace(thisInstance.designSpace);
        valueToAxes(thisInstance);
         
        /*
        if ($scope.commandDown || $scope.controlDown) {// toggle on ctrl click
            thisInstance.edit = !thisInstance.edit;
            $scope.selectionStart = [sIndex, mIndex];
        } else if ($scope.shiftDown) {// set end for shift click
            $scope.selectionEnd = [sIndex, mIndex];
            //
            console.log("todo: shift selecting");
        } else {// clean click clears all but current
            $scope.selectionStart = [sIndex, mIndex];
            $scope.deselectAll();
            thisInstance.edit = true;
        }
        */
    };

    $scope.deselectAll = function() {
        angular.forEach($scope.data.instaces, function(master) {
            master.edit = false;
        });
    };
    
    

    // buttons visible
    $scope.canAddInstance = function() {
        var designSpace = $scope.data.currentDesignSpace;
        if ((designSpace && designSpace.type == "Control" && designSpace.axes.length > 0) || (designSpace.type == "Explore" && designSpace.masters.length > 0) ) {
            return true;
        } else {
            return false;
        }
    };

});
