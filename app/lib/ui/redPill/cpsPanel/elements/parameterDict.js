define([
    'angular'
  , './parameterDict-controller'
  , './parameterDict-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('cps.parameterDict', [])
      .controller('ParameterDictController', Controller)
      .directive('cpsParameterDict', directive)
      ;
});
