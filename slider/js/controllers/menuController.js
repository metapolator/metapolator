app.controller('menuController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.newDocument = function() {
        alert("New Document");
        $scope.data.localmenu.project = false;
    };

    $scope.closeDocument = function() {
        alert("Close Document");
        $scope.data.localmenu.project = false;
    };

    $scope.data.selectMenu = function(menu) {
        $scope.data.localmenu[menu] = !$scope.data.localmenu[menu];
        for (var x in $scope.data.localmenu) {
            if (x != menu) {
                $scope.data.localmenu[x] = false;
            }
        }
    };
    
    $scope.renameProject = function () {
        $("#layover").show();
        $("#rename-project").show();
        $scope.data.localmenu.project = false;
    };
    
    $scope.closeRename = function () {
        $("#layover").hide();
        $("#rename-project").hide();
    };

});
