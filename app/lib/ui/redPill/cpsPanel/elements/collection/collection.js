define([
    'angular'
  , './collection-controller'
  , './collection-directive'
  , './sub-collection-directive'
  , 'metapolator/ui/redPill/cpsPanel/elements/rule/rule'
  , 'metapolator/ui/redPill/cpsPanel/elements/namespaceCollection/namespaceCollection'
  , 'metapolator/ui/redPill/cpsPanel/elements/comment/comment'
], function(
    angular
  , Controller
  , directive
  , subCollectionDirective
  , rule
  , namespaceCollection
  , comment
) {
    "use strict";
    return angular.module('cps.collection', [rule.name, namespaceCollection.name, comment.name])
      .controller('CollectionController', Controller)
      .directive('mtkCpsCollection', directive)
      .directive('mtkCpsSubCollection', subCollectionDirective)
      ;
});
