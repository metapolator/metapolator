define([
    'metapolator/ui/redPill/cpsPanel/elementToolbar/clickHandler'
], function(
    clickHandler
) {
    "use strict";
    function GenericController($scope) {
        this.$scope = $scope;
        // this bindToController thing has the problem that
        // this: angular.element(target).isolateScope().index
        // doesn't work without help.
        this.$scope.index = this.index;
        this.clickToolHandler = clickHandler.bind(this, 'command');

        $scope.edit = false;
    }

    GenericController.$inject = ['$scope'];
    var _p = GenericController.prototype;
    _p.constructor = GenericController;

    return GenericController;
});
