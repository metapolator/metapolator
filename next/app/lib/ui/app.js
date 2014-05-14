define([
    'angular'
  , './app-controller'
  , './app-directive'
  , './container/container'
], function(
    angular
  , Controller
  , directive
  , containerModule
) {
    "use strict";
    return angular.module('mtk.metapolator', [containerModule.name])
      .controller('AppController', Controller)
      .directive('metapolator', directive)
      ;
})
