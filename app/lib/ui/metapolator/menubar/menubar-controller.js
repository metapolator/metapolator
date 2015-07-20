define([
    'jquery'
], function(
    $
) {
    "use strict";
    function MenubarController($scope) {
        this.$scope = $scope;

        $scope.menuItems = ["Form", "Mix", "Export"];

        $scope.renameProject = function() {
            $("#project-name").attr("contenteditable", "true").addClass("renaming").focus();
            selectAllText(document.getElementById("project-name"));
        };
    
        $scope.newDocument = function() {
            window.open('' + self.location, 'New Metapolator window');
        };
    
        $scope.closeDocument = function() {
            var message = "Close this window?<br><br>WARNING: This is a demo,\neverything will be lost";
            $scope.data.confirm(message, function(result){
                if(result) {
                    window.close();
                }
            });
        };
        
        function selectAllText (element) {
            var doc = document
              , range
              , selection;
            if (doc.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(element);
                range.select();
            } else if (window.getSelection) {
                selection = window.getSelection();
                range = document.createRange();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    MenubarController.$inject = ['$scope'];
    var _p = MenubarController.prototype;

    return MenubarController;
}); 