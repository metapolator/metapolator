"use strict";
define([
    'angular'
  , './widget-controller'
  , './widget-directive'
], function(
    angular
  , Controller
  , directive
) {
    return angular.module('mtk.widget', [])
           .controller('WidgetController', Controller)
           .directive('mtkWidget', directive)
           ;
})
