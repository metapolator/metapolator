define([
    'angular'
  , './app-controller'
  , './app-directive'
  , './redPillMaster/redPillMaster'
  , './redPillGlyphs/redPillGlyphs'
], function(
    angular
  , Controller
  , directive
  , redPillMaster
  , redPillGlyphs
) {
    "use strict";
    return angular.module('mtk.redPill', [redPillMaster.name, redPillGlyphs.name])
      .controller('AppController', Controller)
      .directive('redPill', directive)
      ;
})
