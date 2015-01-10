app.controller('designspaceController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.selectDesignSpace = function(i) {
        $scope.data.currentDesignSpace = i;
    }
    $scope.addDesignSpace = function() {
        var i = $scope.data.designSpaces.length;
        $scope.data.designSpaces.push({
            name : "Space " + (i + 1),
            type : "x",
            masters : [],
            axes : [],
            triangle : false
        });
        $scope.data.currentDesignSpace = i;
    }
    
});
