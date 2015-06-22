define([
    'angular'
  , './size-rope-controller'
  , './size-rope-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.sizeRope', [])
           .controller('SizeRopeController', Controller)
           .directive('mtkSizeRope', directive)
           ;
});
