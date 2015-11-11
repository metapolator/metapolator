define([], function() {
    "use strict";
    function SizeInputController($scope) {
        this.$scope = $scope;

        $scope.handleSVGbox = function() { // FIXME Make this DRY: same function in size-rope-controller
            var ul = document.getElementsByClassName("specimen-ul-" + $scope.type)[0];
            var children = ul.children;
            for (var i = 0, l = children.length; i < l; i++) {
                children[i].firstElementChild.style.width = "auto";
            }
        };
    }


    SizeInputController.$inject = ['$scope'];
    var _p = SizeInputController.prototype;

    return SizeInputController;
});
