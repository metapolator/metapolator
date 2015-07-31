define([
    'angular'
  , './newItem-controller'
  , './newItem-directive'
  , 'metapolator/ui/redPill/cpsPanel/elements/comment/comment'
  , 'metapolator/ui/redPill/cpsPanel/elements/importCollection/importCollection'
], function(
    angular
  , Controller
  , directive
  , comment
  , importCollection
) {
    "use strict";
    return angular.module('cps.newItem', [comment.name, importCollection.name])
      .controller('NewItemController', Controller)
      .directive('mtkCpsNewItem', directive)
      ;
});
