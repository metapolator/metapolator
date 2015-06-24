define([
    'jquery'
], function(
    $
) {
    "use strict";
    function MenubarController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'panel';
        //$scope.projectName = metapolatorModel.projectName;
        
        $scope.renameProject = function() {
            $("#project-name").attr("contenteditable", "true");
            $("#project-name").addClass("renaming");
            $("#project-name").focus();
            selectAllText(document.getElementById("project-name"));
        };
    
        $scope.newDocument = function() {
            myRef = window.open('' + self.location, 'New Metapolator window');
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
        }
    }

    MenubarController.$inject = ['$scope'];
    var _p = MenubarController.prototype;

    return MenubarController;
}); 