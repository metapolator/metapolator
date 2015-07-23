define([
], function(
) {
    "use strict";
    function NewItemController($scope) {
        this.$scope = $scope;
        $scope.element = null;
        this.elements = {
            'rule': 'mtk-cps-new-rule'
          , '@namespace': 'mtk-cps-new-namespace-collection'
          , '@import': 'mtk-cps-new-import-collection'
          , 'comment': 'mtk-cps-new-comment'
        };
        $scope.elementKeys = Object.keys(this.elements);
    }

    NewItemController.$inject = ['$scope'];
    var _p = NewItemController.prototype;
    _p.constructor = NewItemController;

    return NewItemController;
});
