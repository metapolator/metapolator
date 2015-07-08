define([
    'angular'
  , 'd3'
  , './strict-controller'
  , './strict-directive'
], function(
    angular
  , d3
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.strict', [])
           .controller('StrictController', Controller)
           .directive('mtkStrict', directive)
           ;
});
