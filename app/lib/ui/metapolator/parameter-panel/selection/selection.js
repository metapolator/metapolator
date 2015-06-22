define([
    'angular'
  , './selection-controller'
  , './selection-directive'
  , './selection-parameter/selection-parameter'
], function(
    angular
  , Controller
  , directive
  , selectionParameterModule
) {
    "use strict";
    return angular.module('mtk.selection', [selectionParameterModule.name])
           .controller('SelectionController', Controller)
           .directive('mtkSelection', directive)
           ;
});
