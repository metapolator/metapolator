define([
    'angular'
  , './importCollection-controller'
  , './importCollection-directive'
  , 'metapolator/ui/redPill/cpsPanel/elementToolbar/elementToolbar'
  , './newImportCollection-controller'
  , './newImportCollection-directive'

], function(
    angular
  , Controller
  , directive
  , elementToolbar
  , NewImportColectionController
  , newImportColectionirective
) {
    "use strict";
    return angular.module('cps.importCollection', [elementToolbar.name])
      .controller('ImportCollectionController', Controller)
      .directive('mtkCpsImportCollection', directive)
      .controller('NewImportCollectionController', NewImportColectionController)
      .directive('mtkCpsNewImportCollection', newImportColectionirective)
      ;
});
