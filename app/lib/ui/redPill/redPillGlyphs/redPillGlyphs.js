define([
    'angular'
  , './redPillGlyphs-controller'
  , './redPillGlyphs-directive'
  , './redPillGlyph-directive'
], function(
    angular
  , Controller
  , directive
  , redPillGlyphDirective
) {
    "use strict";
    return angular.module('mtk.redPillGlyphs', [])
           .controller('RedPillGlyphsController', Controller)
           .directive('mtkRedPillGlyphs', directive)
           .directive('mtkRedPillGlyph', redPillGlyphDirective)
           ;
});
