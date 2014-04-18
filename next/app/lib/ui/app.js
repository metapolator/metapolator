"use strict";
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
    return angular.module('mtk.metapolator', [containerModule.name])
      .controller('AppController', Controller)
      .directive('metapolator', directive)
      ;
})
