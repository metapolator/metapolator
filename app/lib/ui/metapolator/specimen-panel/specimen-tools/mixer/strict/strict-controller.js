define([], function() {
    "use strict";
    function StrictController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'strict';
        
        $scope.sizes = {
            buttonW : 10, 
            spacing : 6, 
            margin : 2
        };
        
        $scope.setStrict = function(strict) {
            $scope.model.parent.setStrict(strict);    
        };

        $scope.limitX = function(x) {
            var limitLeft = $scope.sizes.margin,
                limitRight = limitLeft + 2 * ($scope.sizes.buttonW + $scope.sizes.spacing);
            if (x < limitLeft) {
                x = limitLeft;
            } else if (x > limitRight) {
                x = limitRight;
            }
            return x;
        };

        $scope.positionX = function(x) {
            var pos0 = $scope.sizes.margin
              , pos1 = $scope.sizes.margin + $scope.sizes.buttonW + $scope.sizes.spacing
              , pos2 = $scope.sizes.margin + 2 * ($scope.sizes.buttonW + $scope.sizes.spacing)
              , strict;
            if (x < (pos1 - 0.5 * $scope.sizes.buttonW)) {
                x = pos0;
                strict = 0;
            } else if (x < (pos2 - 0.5 * $scope.sizes.buttonW)) {
                x = pos1;
                strict = 1;
            } else {
                x = pos2;
                strict = 2;
            }
            return {
                x : x,
                strict : strict
            };
        };
    }


    StrictController.$inject = ['$scope'];
    var _p = StrictController.prototype;

    return StrictController;
});
