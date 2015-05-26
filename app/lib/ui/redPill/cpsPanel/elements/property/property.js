define([
    'angular'
  , './property-controller'
  , './property-directive'
  , './newProperty-controller'
  , './newProperty-directive'
  , './editProperty-directive'
], function(
    angular
  , Controller
  , directive
  , NewPropertyController
  , newPropertyDirective
  , editPropertyDirective
) {
    "use strict";
    return angular.module('cps.property', [])
      .controller('PropertyController', Controller)
      .directive('mtkCpsProperty', directive)
      .controller('NewPropertyController', NewPropertyController)
      .directive('mtkCpsNewProperty', newPropertyDirective)
      .directive('mtkCpsEditProperty', editPropertyDirective)
      ;
});
