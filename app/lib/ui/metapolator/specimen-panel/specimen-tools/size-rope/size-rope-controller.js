define([], function() {
    "use strict";
    function SizeRopeController($scope) {
        this.$scope = $scope;

        $scope.limitFontSize = function(fontSize) {
            var size = Math.round(fontSize);
            if (size < 10) {
                size = 10;
            }
            $scope.model.fontSize = size;
            updateLineHeight();
            $scope.$apply();
        };

        $scope.handleSVGbox = function() {
            var ul = document.getElementsByClassName("specimen-ul-" + $scope.type)[0];
            var children = ul.children;
            for (var i = 0, l = children.length; i < l; i++) {
                children[i].firstElementChild.style.width = "auto";
            }
        };

        function updateLineHeight() {
            var lineHeight
              , lineHeightSetting = $scope.model.lineHeightSetting
              , fontSize = $scope.model.fontSize;
            // 0 = tight, 1 = normal, 2 = loose, -1 = custom (don't touch it then')
            if (lineHeightSetting !== -1) {
                if (lineHeightSetting === 1) {
                    lineHeight = (1 / (0.1 * fontSize + 0.58) + 0.8673).toFixed(1);
                } else if (lineHeightSetting === 0) {
                    lineHeight = (1 / (0.1525 * fontSize + 0.85) + 0.7785).toFixed(1);
                } else if (lineHeightSetting === 2) {
                    lineHeight = (1 / (0.087 * fontSize + 0.195) + 1.062).toFixed(1);
                }
                $scope.model.lineHeight = lineHeight;
            }
        }
    }


    SizeRopeController.$inject = ['$scope'];
    var _p = SizeRopeController.prototype;

    return SizeRopeController;
});
