define([
    'angular'
  , './comment-controller'
  , './comment-directive'
  , 'metapolator/ui/redPill/cpsPanel/elementToolbar/elementToolbar'
], function(
    angular
  , Controller
  , directive
  , elementToolbar
) {
    "use strict";
    return angular.module('cps.comment', [elementToolbar.name])
      .controller('CommentController', Controller)
      .directive('mtkCpsComment', directive)
      ;
});
