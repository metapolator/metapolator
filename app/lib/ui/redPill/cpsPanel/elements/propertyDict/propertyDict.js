define([
    'angular'
  , './propertyDict-controller'
  , './propertyDict-directive'
  , 'metapolator/ui/redPill/cpsPanel/elements/property/property'
], function(
    angular
  , Controller
  , directive
  , property
) {
    "use strict";
    return angular.module('cps.propertyDict', [property.name])
      .controller('PropertyDictController', Controller)
      .directive('mtkCpsPropertyDict', directive)
      ;
});
