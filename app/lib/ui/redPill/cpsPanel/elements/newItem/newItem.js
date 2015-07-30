define([
    'angular'
  , './newItem-controller'
  , './newItem-directive'
  , 'metapolator/ui/redPill/cpsPanel/elements/comment/comment'
], function(
    angular
  , Controller
  , directive
  , comment
) {
    "use strict";
    return angular.module('cps.newItem', [comment.name])
      .controller('NewItemController', Controller)
      .directive('mtkCpsNewItem', directive)
      ;
});
