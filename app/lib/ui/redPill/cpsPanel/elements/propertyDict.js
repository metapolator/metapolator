define([
    'angular'
  , './propertyDict-controller'
  , './propertyDict-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('cps.propertyDict', [])
      .controller('PropertyDictController', Controller)
      .directive('mtkCpsPropertyDict', directive)
      ;
});
