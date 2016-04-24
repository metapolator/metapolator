define([
    'angular'
  , './size-input-controller'
  , './size-input-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.sizeInput', [])
           .controller('SizeInputController', Controller)
           .directive('mtkSizeInput', directive)
           ;
});
