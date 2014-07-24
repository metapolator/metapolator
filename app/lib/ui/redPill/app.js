define([
    'angular'
  , './app-controller'
  , './app-directive'
  , './redPillMaster/redPillMaster'
], function(
    angular
  , Controller
  , directive
  , redPillMaster
) {
    "use strict";
    return angular.module('mtk.redPill', [redPillMaster.name])
      .controller('AppController', Controller)
      .directive('redPill', directive)
      ;
})
