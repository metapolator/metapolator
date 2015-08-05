define([], function() {
    'use strict';
    function StrictController($scope) {
        this.$scope = $scope;

        $scope.setStrict = function(strict) {
            $scope.model.strict = strict;
        };
    }


    StrictController.$inject = ['$scope'];
    var _p = StrictController.prototype;

    return StrictController;
});
