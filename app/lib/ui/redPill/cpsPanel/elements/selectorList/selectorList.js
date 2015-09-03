define([
    'angular'
  , './selectorList-controller'
  , './selectorList-directive'
  , './newSelectorList-controller'
  , './newSelectorList-directive'
], function(
    angular
  , Controller
  , directive
  , NewSelectorListController
  , newSelectorListDirective
) {
    "use strict";
    return angular.module('cps.selectorList', [])
      .controller('SelectorListController', Controller)
      .directive('mtkCpsSelectorList', directive)
      .controller('NewSelectorListController', NewSelectorListController)
      .directive('mtkCpsNewSelectorList', newSelectorListDirective)
      ;
});
