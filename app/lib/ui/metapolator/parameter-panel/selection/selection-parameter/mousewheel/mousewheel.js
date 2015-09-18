define([
    'angular'
  , './mousewheel-directive'
], function (
    angular
  , directive
) {
  "use strict";
  return angular.module('mtk.mousewheel', [])
    .directive('mtkMousewheel', directive);
});