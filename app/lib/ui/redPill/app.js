define([
    'angular'
  , './app-controller'
  , './app-directive'
  , './redPillGlyphs/redPillGlyphs'
  , './textEditor/textEditor'
], function(
    angular
  , Controller
  , directive
  , redPillGlyphs
  , textEditor
) {
    "use strict";
    return angular.module('mtk.redPill', [redPillGlyphs.name, textEditor.name])
      .controller('AppController', Controller)
      .directive('redPill', directive)
      ;
})
