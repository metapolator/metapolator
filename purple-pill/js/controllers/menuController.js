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
        if (confirm("Close this window?\n\nWARNING: This is a demo,\neverything will be lost")) {
            window.close();
        }
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

    $scope.data.dialog = function(message, loading, buttons) {
        $("#layover").fadeIn(100);
        $("#dialog").fadeIn(300);
        $("#dialog #dialog-content").html(message);
        if (loading) {
            $("#dialog-loading").show();
        }
        if (buttons == "close") {
            $("#dialog-close").show();
        } else {
            $("#dialog-close").hide();
        }
    };

    $scope.data.closeDialog = function() {
        $("#layover").fadeOut(300);
        $("#dialog").fadeOut(100);
    };

    /***** dividers *****/

    $scope.data.getLandscapeLeft = function() {
        var end = $scope.data.view.viewState * 2;
        var parts = 0;
        for (var i = 0; i < end; i++) {
            parts += $scope.data.view.panels[i].share;
        }
        var x = "calc(" + (parts / -16) + " * 100%)";
        return x;
    };

    $scope.data.fontExportWidth

    $scope.setFontExportPanel = function() {
        // this measurement sets the font export panel to a fixed with of 80px. It balances the font family panels with the difference
        var windowWidth = $(window).outerWidth();
        var exportWidth = windowWidth / 16;
        var difference = 80 - exportWidth;
        var newShare = ((windowWidth * 12 / 16) - difference) / windowWidth * 16;
        var newShare2 = ((windowWidth / 16) + difference) / windowWidth * 16;
        $scope.data.view.panels[5].share = newShare2;
        $scope.data.view.panels[6].share = newShare;
        exportWidth = 80;
        $scope.data.fontExportWidth = exportWidth;
    };

    $scope.reAdjustPanels = function (){
        var windowWidth = $(window).outerWidth();
        angular.forEach($scope.data.view.panels, function(panel) {
            if (panel.restricted) {
                var width = panel.share / 16 * windowWidth, difference;
                if (width < panel.min) {
                    difference = width - panel.min;
                } else if (width > panel.max) {
                    difference = width - panel.max;
                }
                if (difference) {
                    panel.share = (width - difference) / windowWidth * 16;
                    angular.forEach(panel.giveTo, function(giveTo) {
                        var giveToPanel = $scope.data.view.panels[giveTo];
                        var newShare = ((giveToPanel.share / 16 * windowWidth) + difference) / windowWidth * 16;
                        giveToPanel.share = newShare; 
                    });
                }
            }
        });
        $scope.data.view.totalPanelParts = $scope.data.getTotalParts();
        // trigger to reposition the dividers
        $scope.data.view.dividerTrigger++;
    };
    
    $scope.data.getTotalParts = function() {
        var parts = 0;
        angular.forEach($scope.data.view.panels, function(panel) {
            parts += panel.share;
        });  
        return parts;
    };

    $scope.setFontExportPanel();
    $scope.reAdjustPanels();

});
