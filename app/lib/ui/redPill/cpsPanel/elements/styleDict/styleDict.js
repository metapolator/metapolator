define([
    'angular'
  , './styleDict-controller'
  , './styleDict-directive'
  , 'metapolator/ui/redPill/cpsPanel/elements/rule/rule'
  , 'metapolator/ui/redPill/cpsPanel/dragAndDrop/dragAndDrop'
], function(
    angular
  , Controller
  , directive
  , rule
  , dragAndDrop
) {
    "use strict";
    return angular.module('cps.styleDict', [rule.name, dragAndDrop.name])
      .controller('StyleDictController', Controller)
      .directive('mtkCpsStyleDict', directive)
      ;
});
