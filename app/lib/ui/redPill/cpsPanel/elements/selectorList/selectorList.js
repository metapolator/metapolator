define([
    'angular'
  , './selectorList-controller'
  , './selectorList-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('cps.selectorList', [])
      .controller('SelectorListController', Controller)
      .directive('mtkCpsSelectorList', directive)
      ;
});
