"use strict";
define([
    'angular'
  , './container-controller'
  , './container-directive'
], function(
    angular
  , Controller
  , directive
) {
    return angular.module('mtk.container', [])
           .controller('ContainerController', Controller)
           .directive('mtkContainer', directive)
           ;
})
