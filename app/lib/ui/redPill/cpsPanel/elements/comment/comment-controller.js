define([
    'metapolator/ui/redPill/cpsPanel/elementToolbar/clickHandler'
], function(
    clickHandler
) {
    "use strict";
    function CommentController($scope) {
        this.$scope = $scope;
        // this bindToController thing has the problem that
        // this: angular.element(target).isolateScope().index
        // doesn't work without help.
        this.$scope.index = this.index;
        this.clickToolHandler = clickHandler.bind(this, 'toolClick');
    }

    CommentController.$inject = ['$scope'];
    var _p = CommentController.prototype;
    _p.constructor = CommentController;

    return CommentController;
});
