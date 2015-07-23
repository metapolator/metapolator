define([
    'angular'
  , './newItem-controller'
  , './newItem-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('cps.newItem', [])
      .controller('NewItemController', Controller)
      .directive('mtkCpsNewItem', directive)
      ;
});
