app.controller("designSpaceController", function($scope) {
    $scope.designSpaces = [{
        name : "Space 1",
        content : "My first content",
        type : "x"
    }];

    $scope.selectedDesignSpaces = $scope.designSpaces[0];
    $scope.selectDesignSpace = function(i) {
        $scope.selectedDesignSpaces = i;
    }
    $scope.addDesignSpace = function() {
        var i = $scope.designSpaces.length;
        $scope.designSpaces.push({
            name : "Space " + (i + 1),
            content : "",
            type : "x"
        });
        $scope.selectedDesignSpaces = $scope.designSpaces[i];
    }
});
