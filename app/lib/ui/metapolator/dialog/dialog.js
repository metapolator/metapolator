define([
    'angular'
  , './dialog-controller'
  , './dialog-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.dialog', [])
           .controller('DialogController', Controller)
           .directive('mtkDialog', directive)
           ;
});
