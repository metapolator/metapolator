app.controller('menuController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.data.alert = function(message, loading) {
        $("#alert").show();
        if (loading) {
            $("#alert-loading").show();
        }
        $("#alert #alert-content").html(message);
        setTimeout(function() {
            $("#alert").hide();
        }, 2000);
    };

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

    /***** confirm *****/

    $scope.data.confirm = function(message, callback) {
        var confirmButton, cancelButton;
        $("#layover").show();
        $("#confirm").show();
        $("#confirm #confirm-content").html(message);

        $("#confirm-button").click(function() {
            $("#layover").hide();
            $("#confirm").hide();
            callback(true);
        });
        $("#cancel-button").click(function() {
            $("#layover").hide();
            $("#confirm").hide();
            callback(false);
        });
    };

    /***** dividers *****/

    $scope.data.getLandscapeLeft = function() {
        var end = $scope.data.view.viewState * 2;
        var parts = 0;
        for (var i = 0; i < end; i++) {
            parts += $scope.data.view.panels[i];
        }
        var x = "calc(" + (parts / -16) + " * 100%)";
        return x;
    };

});
