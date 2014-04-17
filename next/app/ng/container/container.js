"use strict";
define([
    'angular'
  , './container-controller'
  , './container-directive'
  , '../widget/widget'
], function(
    angular
  , Controller
  , directive
  , widgetModule
) {
    return angular.module('mtk.container', [widgetModule.name])
           .controller('ContainerController', Controller)
           .directive('mtkContainer', directive)
           ;
})
