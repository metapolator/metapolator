define([], function() {
    "use strict";
    function SizeInputController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'sizeInput';
    }


    SizeInputController.$inject = ['$scope'];
    var _p = SizeInputController.prototype;

    return SizeInputController;
});
