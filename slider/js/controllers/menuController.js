app.controller('menuController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;


    $scope.newDocument = function(){
        alert ("New Document");
        $scope.data.localmenu.project = false;
    };
    
    $scope.closeDocument = function(){
        alert ("Close Document");
        $scope.data.localmenu.project = false;
    };

});
