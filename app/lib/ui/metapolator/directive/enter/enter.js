define([
    'angular'
  , './enter-directive'
], function (
    angular
  , directive
) {
  "use strict";
  return angular.module('mtk.enter', [])
    .directive('mtkEnter', directive);
});
