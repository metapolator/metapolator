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

    $scope.selectInstancesForEdit = function(thisInstance, sIndex, mIndex) {
        $scope.currentInstance = thisInstance;
        thisInstance.edit = !thisInstance.edit;
        setCurrentDesignSpace(thisInstance.designSpace);
         
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
        if ((designSpace.type == "Control" && designSpace.axes.length > 0) || (designSpace.type == "Explore" && designSpace.masters.length > 0) ) {
            return true;
        } else {
            return false;
        }
    };

});
