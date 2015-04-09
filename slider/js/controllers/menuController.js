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
        $scope.data.localmenu.project = false;
        $("#project-name").attr("contenteditable", "true");
        $("#project-name").addClass("renaming");
        $("#project-name").focus();
        
        $scope.data.selectAllText(document.getElementById("project-name"));
    };
    
    $scope.data.selectAllText = function(element) {
       var doc = document;
       if (doc.body.createTextRange) {
           var range = document.body.createTextRange();
           range.moveToElementText(element);
           range.select();
       } else if (window.getSelection) {
           var selection = window.getSelection();        
           var range = document.createRange();
           range.selectNodeContents(element);
           selection.removeAllRanges();
           selection.addRange(range);
       }
    };
    
    $scope.closeRename = function () {
        $("#layover").hide();
        $("#rename-project").hide();
    };

});
