define([], function() {
    "use strict";
    function InstanceController($scope) {
        this.$scope = $scope;
        
        $scope.getDiamondColor = function(instance) {
            if (instance.isCurrent()) {
                return instance.color;
            } else {
                return "none";
            }
        };
        
        $scope.selectInstance = function (instance) {
            instance.setCurrent();
            instance.designSpace.setCurrent();
        };


        $scope.getGlyph = function (glyphName) {
            for (var i = $scope.model.children.length - 1; i >= 0; i--) {
                var thisGlyph = $scope.model.children[i];
                if (thisGlyph.name === glyphName) {
                    return thisGlyph;
                }
            }
        };
    }

    InstanceController.$inject = ['$scope'];
    var _p = InstanceController.prototype;

    return InstanceController;
}); 