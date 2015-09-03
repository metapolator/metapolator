define([
    'metapolator/ui/redPill/cpsPanel/elementToolbar/clickHandler'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , 'metapolator/models/CPS/elements/Comment'
], function(
    clickHandler
  , helpers
  , Comment
) {
    "use strict";
    function CommentController($scope) {
        this.$scope = $scope;
        // this bindToController thing has the problem that
        // this: angular.element(target).isolateScope().index
        // doesn't work without help.
        this.$scope.index = this.index;
        this.clickToolHandler = clickHandler.bind(this, 'command');

        $scope.edit = false;
        this._editInitialComment = null;
        this._initComment();
    }

    CommentController.$inject = ['$scope'];
    var _p = CommentController.prototype;
    _p.constructor = CommentController;

    _p._updateComment = function(content) {
        var comment = new Comment(content);
        this.$scope.$emit('command', 'replace', this.index, comment);
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
        $scope.comment = this.comment.unescaped;
        this._setValueBoxSize($scope.comment);
    };

    _p.startEdit = function() {
        this.$scope.edit = true;
        this._editInitialComment = this.comment.value;
    };

    _p.finalize = function() {
        // assert this.$scope.edit === true;
        var comment = Comment.escape(this.$scope.comment)
          , initialComment = this._editInitialComment
          ;
        this.$scope.edit = false;
        this._editInitialComment = null;

        if(comment !== initialComment) {
            // update ...
            this._updateComment(comment);
        }
        // this will set the comment to the current
        this._initComment();
    };

    _p.changeComment = function() {
        this._setValueBoxSize(this.$scope.comment);
    };


    return CommentController;
});
