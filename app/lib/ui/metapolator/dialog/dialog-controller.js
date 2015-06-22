define([], function() {
    "use strict";
    function DialogController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'dialog';
    }

    DialogController.$inject = ['$scope'];
    var _p = DialogController.prototype;

    return DialogController;
}); 