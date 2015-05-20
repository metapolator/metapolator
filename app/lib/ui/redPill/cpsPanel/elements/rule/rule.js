define([
    'angular'
  , './rule-controller'
  , './rule-directive'
  , 'metapolator/ui/redPill/cpsPanel/elements/propertyDict/propertyDict'
], function(
    angular
  , Controller
  , directive
  , propertyDict
) {
    "use strict";
    return angular.module('cps.rule', [propertyDict.name])
      .controller('RuleController', Controller)
      .directive('mtkCpsRule', directive)
      ;
});
