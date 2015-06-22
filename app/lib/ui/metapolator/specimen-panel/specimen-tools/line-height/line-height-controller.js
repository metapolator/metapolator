define([], function() {
    "use strict";
    function LineHeightController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'lineHeight';
        
        $scope.options = [{
            name : "Tight",
            img : "tight.png",
            title : "Tight: 1.2@10pt, 1@24, 0.8@300﻿"
        }, {
            name : "Normal",
            img : "normal.png",
            title : "Normal: 1.5@10pt, 1.2@24, 0.9@300"
        }, {
            name : "Loose",
            img : "loose.png",
            title : "Loose: 2@10pt, 1.5@24, 1.1@300﻿"
        }];
        
        $scope.changeLineHeightSetting = function(index) {
            $scope.model.lineHeightSetting = index;
            $scope.model.updateLineHeight();
        };
    }


    LineHeightController.$inject = ['$scope'];
    var _p = LineHeightController.prototype;

    return LineHeightController;
});
