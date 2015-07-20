define([
    'metapolator/ui/metapolator/services/dialog'
], function(
    dialog
) {
    "use strict";
    function DialogController($scope) {
        this.$scope = $scope;

        $scope.closeDialogScreen = function() {
            dialog.closeDialogScreen();
        };
    }

    DialogController.$inject = ['$scope'];
    var _p = DialogController.prototype;

    return DialogController;
}); 