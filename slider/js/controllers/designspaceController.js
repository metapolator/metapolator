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
    
    $scope.output = [];
    $scope.total = 0;
    
    $scope.getMetapolationRatios = function (data) {
        $scope.output = [];
        var axes = data.axes;
        var n = axes.length;
        var cake = 1;
        for (var i = 0; i < n; i++) {
            cake += axes[i].value / ( 100 - axes[i].value);
        }
        $scope.output.push("Master 0: " + roundup(1 / cake));
        for (var i = 0; i < n; i++) {
            var piece = axes[i].value / ( 100 - axes[i].value);
            $scope.output.push("Master " + (i + 1) + ": " + roundup(piece/cake));
        }
    };
    
    function roundup (a) {
        var b = Math.round(a * 1000) / 1000;
        return b;
    }
    
});
