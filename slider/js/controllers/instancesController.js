app.controller('instancesController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;
    
    $scope.addInstance = function () {
        $scope.data.instances.push({
            name: "New Instance",
            designSpace: "",
            fontFamily: "Roboto",
            fontWeight: 700,
            edit: false,
            display: false
        });
    };
    
    $scope.selectInstancesForEdit = function(thisInstance, sIndex, mIndex) {
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
    };
    
    $scope.deselectAll = function() {
        angular.forEach($scope.data.instaces, function(master) {
            master.edit = false;
        });
    };


});
