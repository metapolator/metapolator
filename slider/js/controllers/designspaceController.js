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
            $scope.output.push("Master 0: " + roundup(1 / cake));
            for (var i = 0; i < n; i++) {
                var piece = axes[i].value / (100 - axes[i].value);
                $scope.output.push("Master " + (i + 1) + ": " + roundup(piece / cake));
            }
        }
    };

    function metapolationRatiosWithZero(data) {
        $scope.output = [];
        var axes = data.axes;
        var n = axes.length;
        var cake = 0;
        var mastersNotZero = [];
        $scope.output.push("Master 0: " + 0);
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
                $scope.output.push("Master " + (i + 1) + ": " + roundup(1 / cake));
            } else {
                $scope.output.push("Master " + (i + 1) + ": 0");
            }
        }
    }

    function roundup(a) {
        var b = Math.round(a * 1000) / 1000;
        return b;
    }

});
