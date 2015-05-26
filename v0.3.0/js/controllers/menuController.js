app.controller('menuController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.data.alert = function(message, loading) {
        $("#layover").show();
        $("#confirm").show();
        if (loading) {
            $("#confirm-loading").show();
        }
        $("#confirm #confirm-content").html(message);
        setTimeout(function() {
            $("#layover").hide();
            $("#confirm").hide();
        }, 2000);
    };

    $scope.renameProject = function() {
        $scope.data.localmenu.project = false;
        $("#project-name").attr("contenteditable", "true");
        $("#project-name").addClass("renaming");
        $("#project-name").focus();
        $scope.data.selectAllText(document.getElementById("project-name"));
    };

    $scope.newDocument = function() {
        myRef = window.open('' + self.location, 'New Metapolator window');
        $scope.data.localmenu.project = false;
    };

    $scope.closeDocument = function() {
        var message = "Close this window?<br><br>WARNING: This is a demo,\neverything will be lost";
        $scope.data.confirm(message, function(result){
            if(result) {
                window.close();
            }
        });
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

    /***** dialog *****/

    $scope.data.confirm = function(message, callback) {
        $scope.data.dialog(message, false, true);
        $('#dialog-button-true').click(function() {
            $scope.data.closeDialog();
            callback(true);
        });
        $('#dialog-button-false').click(function() {
            $scope.data.closeDialog();
            callback(false);
        });
    };

    $scope.data.dialog = function(message, loading, buttons) {
        $("#layover").fadeIn(100);
        $("#dialog").fadeIn(300);
        $("#dialog #dialog-content").html(message);
        if (loading) {
            $("#dialog-loading").show();
        }
        if (buttons) {
            $("#dialog-confirm").show();
        }
    };

    $scope.data.closeDialog = function() {
        $("#layover").fadeOut(300);
        $("#dialog").fadeOut(100);
        // hide buttons
        $("#dialog-close").hide();
        $("#dialog-confirm").hide();
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

    $scope.data.fontExportWidth

    $scope.setFontExportPanel = function() {
        // this measurement sets the font export panel to a fixed with of 80px. It balances the font family panels with the difference
        var windowWidth = $("body").outerWidth();
        var exportWidth = windowWidth / 16;
        var difference = 80 - exportWidth;
        var newShare = ((windowWidth * 12 / 16) - difference) / windowWidth * 16;
        var newShare2 = ((windowWidth / 16) + difference) / windowWidth * 16;
        $scope.data.view.panels[5] = newShare2;
        $scope.data.view.panels[6] = newShare;
        exportWidth = 80;
        $scope.data.fontExportWidth = exportWidth;
    };

    $scope.setFontExportPanel();

});
