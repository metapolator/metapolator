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
    "use strict";
    return angular.module('mtk.container', [widgetModule.name])
           .controller('ContainerController', Controller)
           .directive('mtkContainer', directive)
           ;
})
