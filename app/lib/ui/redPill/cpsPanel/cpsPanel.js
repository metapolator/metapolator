define([
    'angular'
  , './cpsPanel-controller'
  , './cpsPanel-directive'
  , './elements/parameterDict'
], function(
    angular
  , Controller
  , directive
  , parameterDict
) {
    "use strict";
    return angular.module('mtk.cpsPanel', [parameterDict.name])
      .controller('CpsPanelController', Controller)
      .directive('mtkCpsPanel', directive)
      ;
});
