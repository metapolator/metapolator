define([
    'angular'
  , './comment-controller'
  , './comment-directive'
  , 'metapolator/ui/redPill/cpsPanel/elementToolbar/elementToolbar'
  , './new-comment-directive'
  , './new-comment-controller'
], function(
    angular
  , Controller
  , directive
  , elementToolbar
  , newCommentDirective
  , NewCommentController
) {
    "use strict";
    return angular.module('cps.comment', [elementToolbar.name])
      .controller('CommentController', Controller)
      .controller('NewCommentController', NewCommentController)
      .directive('mtkCpsComment', directive)
      .directive('mtkCpsNewComment', newCommentDirective)
      ;
});
