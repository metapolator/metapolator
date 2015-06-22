define([
    'angular'
  , './horizontal-divider-controller'
  , './horizontal-divider-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.horizontalDivider', [])
           .controller('HorizontalDividerController', Controller)
           .directive('mtkHorizontalDivider', directive)
           ;
});
