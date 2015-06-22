define([
    'angular'
  , './selection-parameter-controller'
  , './selection-parameter-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.selectionParameter', [])
           .controller('SelectionParameterController', Controller)
           .directive('mtkSelectionParameter', directive)
           ;
});
