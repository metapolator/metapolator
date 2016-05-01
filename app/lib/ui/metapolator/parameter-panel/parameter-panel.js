define([
    'angular'
  , './parameter-panel-controller'
  , './parameter-panel-directive'
  , './selection/selection'
], function(
    angular
  , Controller
  , directive
  , selectionModule
) {
    "use strict";
    return angular.module('mtk.parameterPanel', [selectionModule.name])
           .controller('ParameterPanelController', Controller)
           .directive('mtkParameterPanel', directive)
           ;
});
