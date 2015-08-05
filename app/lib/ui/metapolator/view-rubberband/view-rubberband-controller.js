define([], function() {
    "use strict";
    function ViewRubberbandController($scope, metapolatorModel) {
        this.$scope = $scope;

        $scope.selectSet = function(set, startDisplay) {
            if (set.length > 0) {
                for (var i = 0, l = set.length; i < l; i++) {
                    var master = set[i];
                    master.display = !startDisplay;
                }
            }
        };
    }


    ViewRubberbandController.$inject = ['$scope', 'metapolatorModel'];
    var _p = ViewRubberbandController.prototype;

    return ViewRubberbandController;
});
