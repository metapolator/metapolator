define([
    'angular'
  , './elementToolbar-directive'
], function(
    angular
  , directive
) {
    "use strict";
    return angular.module('cps.elementToolbar', [])
      .directive('mtkElementToolbar', directive)
      ;
});
