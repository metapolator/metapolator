define([
    'angular'
  , './comment-controller'
  , './comment-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('cps.comment', [])
      .controller('CommentController', Controller)
      .directive('mtkCpsComment', directive)
      ;
});
