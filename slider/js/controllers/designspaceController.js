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
        var endSum = 0;
        var cumulusRatio = 1;
        //
        for (var i = 0; i < n; i++) {
            var a = axes[i].value / 100;
            var b = 1 - a;
            var currentRatio = a / b;
            
            endSum = endSum + cumulusRatio * currentRatio;
            cumulusRatio = cumulusRatio * currentRatio;
        }
        var thisMaster = 1 / (1 + endSum);
        $scope.output.push("Master 0: " + roundup(thisMaster));
        var lastMaster = thisMaster;
        //
        for (var i = 0; i < n; i++) {
            var a = axes[i].value / 100;
            var b = 1 - a;
            lastMaster = lastMaster * a/b;
            $scope.output.push("Master " + (i + 1) + ": " + roundup(lastMaster));
        }
    }
    
    function roundup (a) {
        var b = Math.round(a * 1000) / 1000;
        return b;
    }
    
});
