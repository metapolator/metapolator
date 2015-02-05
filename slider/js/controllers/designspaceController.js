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
    $scope.output2 = [];
    $scope.total = 0;
    
    $scope.secondMethod = function(data) {
        $scope.output2 = [];
        var axes = data.axes;
        var n = axes.length;
        var cake = 1;
        for (var i = 0; i < n; i++) {
            cake += axes[i].value  / (100.2 - axes[i].value);

        }
        $scope.output2.push(data.masters[0].name + ": " + roundup(1 / cake));
        for (var i = 0; i < n; i++) {
            var piece = axes[i].value / (100.2 - axes[i].value);
            $scope.output2.push(data.masters[i + 1].name + ": " + roundup(piece / cake));
        }
    }

    $scope.getMetapolationRatios = function(data) {
        $scope.output = [];
        var axes = data.axes;
        var n = axes.length;
        var foundZero = false;
        var cake = 1;
        for (var i = 0; i < n; i++) {
            if (axes[i].value == 100) {
                foundZero = true;
                metapolationRatiosWithZero(data);
                break;
            }
            cake += axes[i].value / (100 - axes[i].value);

        }
        if (!foundZero) {
            $scope.output.push(data.masters[0].name + ": " + roundup(1 / cake));
            for (var i = 0; i < n; i++) {
                var piece = axes[i].value / (100 - axes[i].value);
                $scope.output.push(data.masters[i + 1].name + ": " + roundup(piece / cake));
            }
        }
    };

    function metapolationRatiosWithZero(data) {
        $scope.output = [];
        var axes = data.axes;
        var n = axes.length;
        var cake = 0;
        var mastersNotZero = [];
        $scope.output.push(data.masters[0].name + ": " + 0);
        for (var i = 0; i < n; i++) {
            if (axes[i].value == 100) {
                mastersNotZero.push(1);
                cake++;
            } else {
                mastersNotZero.push(0);
            }
        }
        for (var i = 0; i < n; i++) {
            if (mastersNotZero[i] == 1) {
                $scope.output.push(data.masters[i+1].name + ": " + roundup(1 / cake));
            } else {
                $scope.output.push(data.masters[i+1].name + ": 0");
            }
        }
    }

    function roundup(a) {
        var b = Math.round(a * 1000) / 1000;
        return b;
    }

});
