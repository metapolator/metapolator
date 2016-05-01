define([
    'angular'
  , './local-menu-controller'
  , './local-menu-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.localMenu', [])
           .controller('LocalMenuController', Controller)
           .directive('mtkLocalMenu', directive)
           ;
});
