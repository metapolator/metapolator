define([
    'angular'
  , './property-controller'
  , './property-directive'
  , './newProperty-controller'
  , './newProperty-directive'
  , './editProperty-directive'
  , 'metapolator/ui/redPill/cpsPanel/elementToolbar/elementToolbar'
], function(
    angular
  , Controller
  , directive
  , NewPropertyController
  , newPropertyDirective
  , editPropertyDirective
  , elementToolbar
) {
    "use strict";
    return angular.module('cps.property', [elementToolbar.name])
      .controller('PropertyController', Controller)
      .directive('mtkCpsProperty', directive)
      .controller('NewPropertyController', NewPropertyController)
      .directive('mtkCpsNewProperty', newPropertyDirective)
      .directive('mtkCpsEditProperty', editPropertyDirective)
      ;
});
