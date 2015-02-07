app.controller('designspaceController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.selectDesignSpace = function(i) {
        $scope.data.currentDesignSpace = i;
    };
    
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
    };

    $scope.output = [];
    $scope.total = 0;
    
    $scope.getMetapolationRatios = function(data) {
        var designspace = $scope.data.designSpaces[$scope.data.currentDesignSpace];
        var masterSet = designspace.masters;
        $scope.output = [];
        var axes = data.axes;
        var n = axes.length;
        var cake = 1;
        for (var i = 0; i < n; i++) {
            cake += (axes[i].value + 0.5) / (100.5 - axes[i].value);
        }
        $scope.output.push(data.masters[0].master.name + ": " + roundup(1 / cake));
        masterSet[0].value = roundup(1 / cake);
        
        for (var i = 0; i < n; i++) {
            var piece = (axes[i].value + 0.5) / (100.5 - axes[i].value);
            $scope.output.push(data.masters[i + 1].master.name + ": " + roundup(piece / cake));
            masterSet[i + 1].value = roundup(piece / cake);
        }
    };


    function roundup(a) {
        var b = Math.round(a * 1000) / 1000;
        return b;
    }
    
    //
    
    $scope.removeMaster = function(m) {
        var designspace = $scope.data.designSpaces[$scope.data.currentDesignSpace];
        var masterSet = designspace.masters;
        var master = masterSet[m].name;
        if (confirm("Remove '" + master + "' from this Design Space. Sure?")) {
            masterSet.splice(m, 1);
            designspace.axes.splice((m - 1), 1);
            $scope.$apply();
        }
    };
    
    $scope.promoteMaster = function(m) {
        var designspace = $scope.data.designSpaces[$scope.data.currentDesignSpace];
        var masterSet = designspace.masters;
        var master = masterSet[m];
        var tempMaster = masterSet[0];
        masterSet[0] = masterSet[m];
        masterSet[m] = tempMaster;
        valueToAxes();
    };
    
    function valueToAxes() {
        var designspace = $scope.data.designSpaces[$scope.data.currentDesignSpace];
        designspace.axes = [];
        var masters = designspace.masters;
        for (var i = 1; i < masters.length; i++) {
            var thisRatio = masters[i].value / masters[0].value;
            var thisValue = roundup(thisRatio / (1 + thisRatio) * 100);
            designspace.axes.push({
                value : thisValue
            });
        }
        $scope.$apply();
    }
        

});
