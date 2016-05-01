define([
    'angular'
  , './control-controller'
  , './control-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.control', [])
           .controller('ControlController', Controller)
           .directive('mtkControl', directive)
           ;
});
