define([
    'angular'
  , './selection-parameter-controller'
  , './selection-parameter-directive'
  , '../../../directive/mousewheel/mousewheel'
  , '../../../directive/enter/enter'
], function(
    angular
  , Controller
  , directive
  , mousewheelModule
  , enterModule
) {
    "use strict";
    return angular.module('mtk.selectionParameter', [mousewheelModule.name, enterModule.name])
           .controller('SelectionParameterController', Controller)
           .directive('mtkSelectionParameter', directive)
           ;
});
