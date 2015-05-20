define([
    'angular'
  , './collection-controller'
  , './collection-directive'
  , './sub-collection-directive'
  , 'metapolator/ui/redPill/cpsPanel/elements/rule/rule'
  , 'metapolator/ui/redPill/cpsPanel/elements/namespaceCollection/namespaceCollection'
], function(
    angular
  , Controller
  , directive
  , subCollectionDirective
  , rule
  , namespaceCollection
) {
    "use strict";
    return angular.module('cps.collection', [rule.name, namespaceCollection.name])
      .controller('CollectionController', Controller)
      .directive('mtkCpsCollection', directive)
      .directive('mtkCpsSubCollection', subCollectionDirective)
      ;
});
