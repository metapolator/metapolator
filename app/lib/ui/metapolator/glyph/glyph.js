define([
    'angular'
  , './glyph-controller'
  , './glyph-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.glyph', [])
           .controller('GlyphController', Controller)
           .directive('mtkGlyph', directive)
           ;
});
