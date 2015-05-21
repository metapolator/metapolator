define([
    'angular'
  , './property-controller'
  , './property-directive'
  , './newProperty-controller'
  , './newProperty-directive'
], function(
    angular
  , Controller
  , directive
  , NewPropertyController
  , newPropertyDirective
) {
    "use strict";
    return angular.module('cps.property', [])
      .controller('PropertyController', Controller)
      .directive('mtkCpsProperty', directive)
      .controller('NewPropertyController', NewPropertyController)
      .directive('mtkCpsNewProperty', newPropertyDirective)
      ;
});
