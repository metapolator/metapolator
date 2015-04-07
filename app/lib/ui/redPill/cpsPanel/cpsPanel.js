define([
    'angular'
  , './cpsPanel-controller'
  , './cpsPanel-directive'
  , './elements/propertyDict'
], function(
    angular
  , Controller
  , directive
  , propertyDict
) {
    "use strict";
    return angular.module('mtk.cpsPanel', [propertyDict.name])
      .controller('CpsPanelController', Controller)
      .directive('mtkCpsPanel', directive)
      ;
});
