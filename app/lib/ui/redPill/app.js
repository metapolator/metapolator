define([
    'angular'
  , './app-controller'
  , './app-directive'
  , './redPillGlyphs/redPillGlyphs'
], function(
    angular
  , Controller
  , directive
  , redPillGlyphs
) {
    "use strict";
    return angular.module('mtk.redPill', [redPillGlyphs.name])
      .controller('AppController', Controller)
      .directive('redPill', directive)
      ;
})
