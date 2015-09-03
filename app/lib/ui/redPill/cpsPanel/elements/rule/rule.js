define([
    'angular'
  , './rule-controller'
  , './rule-directive'
  , 'metapolator/ui/redPill/cpsPanel/elements/propertyDict/propertyDict'
  , 'metapolator/ui/redPill/cpsPanel/elements/selectorList/selectorList'
  , 'metapolator/ui/redPill/cpsPanel/elementToolbar/elementToolbar'
  , './newRule-controller'
  , './newRule-directive'
], function(
    angular
  , Controller
  , directive
  , propertyDict
  , selectorList
  , elementToolbar
  , NewRuleController
  , newRuleDirective
) {
    "use strict";
    return angular.module('cps.rule', [propertyDict.name, selectorList.name, elementToolbar.name])
      .controller('RuleController', Controller)
      .directive('mtkCpsRule', directive)
      .controller('NewRuleController', NewRuleController)
      .directive('mtkCpsNewRule', newRuleDirective)
      ;
});
