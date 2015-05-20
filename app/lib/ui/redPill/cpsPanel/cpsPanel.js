define([
    'angular'
  , './cpsPanel-controller'
  , './cpsPanel-directive'
  , './elements/collection/collection'
], function(
    angular
  , Controller
  , directive
  , collection
) {
    "use strict";
    return angular.module('mtk.cpsPanel', [collection.name])
      .controller('CpsPanelController', Controller)
      .directive('mtkCpsPanel', directive)
      ;
});
