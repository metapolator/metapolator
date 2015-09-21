define([
    'angular'
  , './selection-parameter-controller'
  , './selection-parameter-directive'
  , './mousewheel/mousewheel'
], function(
    angular
  , Controller
  , directive
  , mousewheelModule
) {
    "use strict";
    return angular.module('mtk.selectionParameter', [mousewheelModule.name])
           .controller('SelectionParameterController', Controller)
           .directive('mtkSelectionParameter', directive)
           ;
});
