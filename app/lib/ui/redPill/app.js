define([
    'angular'
  , './app-controller'
  , './app-directive'
  , './redPillGlyphs/redPillGlyphs'
  , './textEditor/textEditor'
  , './cpsPanel/cpsPanel'
], function(
    angular
  , Controller
  , directive
  , redPillGlyphs
  , textEditor
  , cpsPanel
) {
    "use strict";
    return angular.module('mtk.redPill', [redPillGlyphs.name, textEditor.name, cpsPanel.name])
      .controller('AppController', Controller)
      .directive('redPill', directive)
      ;
});
