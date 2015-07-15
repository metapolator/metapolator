define([
    'angular'
  , './namespaceCollection-controller'
  , './namespaceCollection-directive'
  , 'metapolator/ui/redPill/cpsPanel/elementToolbar/elementToolbar'
], function(
    angular
  , Controller
  , directive
  , elementToolbar
) {
    "use strict";

    // Can't require collection here, it would be recursive!
    var collectionName = 'cps.collection';

    return angular.module('cps.namespaceCollection', [collectionName, elementToolbar.name])
      .controller('NamespaceCollectionController', Controller)
      .directive('mtkCpsNamespaceCollection', directive)
      ;
});
