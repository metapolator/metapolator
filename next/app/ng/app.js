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
  , container
) {
    
    return angular.module('mtk.metapolator', [container.name])
      .controller('AppController', Controller)
      .directive('metapolator', directive)
      ;
})
