define([
    'angular'
  , './importCollection-controller'
  , './importCollection-directive'
  , 'metapolator/ui/redPill/cpsPanel/elementToolbar/elementToolbar'
], function(
    angular
  , Controller
  , directive
  , elementToolbar
) {
    "use strict";
    return angular.module('cps.importCollection', [elementToolbar.name])
      .controller('ImportCollectionController', Controller)
      .directive('mtkCpsImportCollection', directive)
      ;
});
