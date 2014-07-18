define([
    'angular'
  , './widget-controller'
  , './widget-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.widget', [])
           .controller('WidgetController', Controller)
           .directive('mtkWidget', directive)
           ;
})
