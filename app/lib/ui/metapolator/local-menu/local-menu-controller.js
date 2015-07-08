define([], function() {
    "use strict";
    function LocalMenuController($scope, metapolatorModel) {
        // mind the $scope.releaseLocalMenu() on app.tpl
        // which handles the click outside a lm-head button
        // to collapse an open local menu body
        this.$scope = $scope;
        this.$scope.name = 'localMenu';
        this.$scope.display = this.display = metapolatorModel.display;
        
        this.toggleMenu = function(name) {
            if ($scope.display.localMenu == name) {
                // close the current menu
                $scope.display.localMenu = null;
            } else {
                $scope.display.localMenu = name;
            }
        };
        
        this.closeMenu = function() {
            $scope.display.localMenu = null;
        };
    }

    LocalMenuController.$inject = ['$scope', 'metapolatorModel'];
    var _p = LocalMenuController.prototype;

    return LocalMenuController;
}); 