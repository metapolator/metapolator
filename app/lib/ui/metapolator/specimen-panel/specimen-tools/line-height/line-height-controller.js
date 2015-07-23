define([], function() {
    'use strict';
    function LineHeightController($scope) {
        this.$scope = $scope;

        $scope.options = [{
            name : 'Tight',
            img : 'tight.png',
            title : 'Tight: 1.2@10pt, 1@24, 0.8@300﻿'
        }, {
            name : 'Normal',
            img : 'normal.png',
            title : 'Normal: 1.5@10pt, 1.2@24, 0.9@300'
        }, {
            name : 'Loose',
            img : 'loose.png',
            title : 'Loose: 2@10pt, 1.5@24, 1.1@300﻿'
        }];
        
        $scope.changeLineHeightSetting = function(index) {
            $scope.model.lineHeightSetting = index;
            updateLineHeight();
        };

        // todo: this function is double, try to move it
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

        updateLineHeight();
    }


    LineHeightController.$inject = ['$scope'];
    var _p = LineHeightController.prototype;

    return LineHeightController;
});
