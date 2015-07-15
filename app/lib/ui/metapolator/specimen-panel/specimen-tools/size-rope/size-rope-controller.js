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

        $scope.handleSVGbox = function() {
            var ul = document.getElementsByClassName("specimen-ul-" + $scope.type)[0];
            var children = ul.children;
            for (var i = 0, l = children.length; i < l; i++) {
                children[i].firstElementChild.style.width = "auto";
            }
        };
    }


    SizeRopeController.$inject = ['$scope'];
    var _p = SizeRopeController.prototype;

    return SizeRopeController;
});
