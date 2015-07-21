define([], function() {
    "use strict";
    function ViewRubberbandController($scope, metapolatorModel) {
        this.$scope = $scope;
        this.$scope.name = 'viewRubberband';

        $scope.selectSet = function(set, startDisplay) {
            if (set.length > 0) {
                for (var i = 0, l = set.length; i < l; i++) {
                    var master = set[i];
                    master.display = !startDisplay;
                }
                // the type is set via attr and detected in the directive
                if ($scope.type === "masters") {
                    metapolatorModel.specimen1.updateSelectedMasters(metapolatorModel.masterSequences);
                } else if ($scope.type === "instances") {
                    metapolatorModel.specimen2.updateSelectedMasters(metapolatorModel.instanceSequences);
                }
            }
        };
    }


    ViewRubberbandController.$inject = ['$scope', 'metapolatorModel'];
    var _p = ViewRubberbandController.prototype;

    return ViewRubberbandController;
});
