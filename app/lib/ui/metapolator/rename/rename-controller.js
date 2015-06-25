define([
    'jquery'
], function(
    $
) {
    "use strict";
    function RenameController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'rename';
        
        $scope.giveRenamingProperties = function(element0) {
            $(element0).attr("contenteditable", "true");
            $(element0).addClass("renaming");
            $(element0).focus();
            $scope.selectAllText(element0);
        };
        
        $scope.selectAllText = function(element) {
            var doc = document,
                range;
            if (doc.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(element);
                range.select();
            } else if (window.getSelection) {
                var selection = window.getSelection();
                range = document.createRange();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };

        $scope.finishedRenaming = function(element0, element) {
            $scope.$apply(function() {
                $scope.model = element.html();
            });
            document.getSelection().removeAllRanges();
            $(element0).removeAttr("contenteditable");
            $(element0).removeClass("renaming");
        };
    }

    RenameController.$inject = ['$scope'];
    var _p = RenameController.prototype;

    return RenameController;
}); 