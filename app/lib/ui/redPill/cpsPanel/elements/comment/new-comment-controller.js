define([
    'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , 'metapolator/models/CPS/elements/Comment'
], function(
    helpers
  , Comment
) {
    "use strict";
    function NewCommentController($scope) {
        this.$scope = $scope;
        // this bindToController thing has the problem that
        // this: angular.element(target).isolateScope().index
        // doesn't work without help.
        this.$scope.index = this.index;

        $scope.edit = true;
        this._initComment();
    }

    NewCommentController.$inject = ['$scope'];
    var _p = NewCommentController.prototype;
    _p.constructor = NewCommentController;

    _p._insertComment = function(raw) {
        var content = Comment.escape(raw)
          , comment = new Comment(content)
          ;
        this.$scope.$emit('command', 'insert', this.index, comment);
    };

    _p._setValueBoxSize = function(value) {
        var sizes = helpers.calculateTextBoxSize(value)
          , cols = sizes[0]
          , lines = sizes[1];
        this.$scope.valueWidth = cols;
        this.$scope.valueHeight = lines;
    };

    _p._initComment = function() {
        var $scope = this.$scope;
        $scope.comment = '';
        this._setValueBoxSize($scope.comment);
    };

    _p.finalize = function() {
        this._insertComment(this.$scope.comment);
    };

    _p.changeComment = function() {
        this._setValueBoxSize(this.$scope.comment);
    };


    return NewCommentController;
});
