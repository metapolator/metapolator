define([
    'angular'
  , './property-controller'
  , './property-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('cps.property', [])
      .controller('PropertyController', Controller)
      .directive('mtkCpsProperty', directive)
      ;
});
