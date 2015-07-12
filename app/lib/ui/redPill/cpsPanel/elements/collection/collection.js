define([
    'angular'
  , './collection-controller'
  , './collection-directive'
  , './collection-drop-directive'
  , 'metapolator/ui/redPill/cpsPanel/elements/rule/rule'
  , 'metapolator/ui/redPill/cpsPanel/elements/namespaceCollection/namespaceCollection'
  , 'metapolator/ui/redPill/cpsPanel/elements/comment/comment'
], function(
    angular
  , Controller
  , directive
  , collectionDropDirective
  , rule
  , namespaceCollection
  , comment
) {
    "use strict";
    return angular.module('cps.collection', [rule.name, namespaceCollection.name, comment.name])
      .controller('CollectionController', Controller)
      .directive('mtkCpsCollection', directive)
      .directive('mtkCollectionDrop', collectionDropDirective)
      ;
});
