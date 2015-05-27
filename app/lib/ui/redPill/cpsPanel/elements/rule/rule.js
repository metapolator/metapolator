define([
    'angular'
  , './rule-controller'
  , './rule-directive'
  , 'metapolator/ui/redPill/cpsPanel/elements/propertyDict/propertyDict'
  , 'metapolator/ui/redPill/cpsPanel/elements/selectorList/selectorList'
], function(
    angular
  , Controller
  , directive
  , propertyDict
  , selectorList
) {
    "use strict";
    return angular.module('cps.rule', [propertyDict.name, selectorList.name])
      .controller('RuleController', Controller)
      .directive('mtkCpsRule', directive)
      ;
});
