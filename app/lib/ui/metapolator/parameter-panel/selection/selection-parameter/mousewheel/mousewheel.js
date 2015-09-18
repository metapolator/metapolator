define([
    'angular'
  , './mousewheel-directive.js'
], function (
    angular
  , directive
) {
  "use strict";
  return angular.module('mtk.mousewheel', [])
    .directive('mtkMousewheel', directive);
});