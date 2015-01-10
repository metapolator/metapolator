app.controller("mastersController", function($scope, sharedScope) {'use strict';
    $scope.data = sharedScope.data;
    
    $scope.sortableOptions = {
        connectWith : ".master-ul",
        cancel : ".selectable-ag"
    };
});
