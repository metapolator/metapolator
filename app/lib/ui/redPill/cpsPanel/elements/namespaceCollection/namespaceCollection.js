define([
    'angular'
  , './namespaceCollection-controller'
  , './namespaceCollection-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";

    // Can't require collection here, it would be recursive!
    var collectionName = 'cps.collection';

    return angular.module('cps.namespaceCollection', [collectionName])
      .controller('NamespaceCollectionController', Controller)
      .directive('mtkCpsNamespaceCollection', directive)
      ;
});
