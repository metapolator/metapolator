define([], function() {
    "use strict";
    function SizeRopeController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'sizeRope';

        $scope.limitFontSize = function(fontSize) {
            var size = Math.round(fontSize);
            if (size < 10) {
                size = 10;
            }
            $scope.model.fontSize = size;
            $scope.model.updateLineHeight();
            $scope.$apply();
        };
    }


    SizeRopeController.$inject = ['$scope'];
    var _p = SizeRopeController.prototype;

    return SizeRopeController;
});
