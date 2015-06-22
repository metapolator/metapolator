define([
    'angular'
  , './vertical-divider-controller'
  , './vertical-divider-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.verticalDivider', [])
           .controller('VerticalDividerController', Controller)
           .directive('mtkVerticalDivider', directive)
           ;
});
