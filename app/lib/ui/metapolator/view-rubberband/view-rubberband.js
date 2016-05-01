define([
    'angular'
  , './view-rubberband-controller'
  , './view-rubberband-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.viewRubberband', [])
           .controller('ViewRubberbandController', Controller)
           .directive('mtkViewRubberband', directive)
           ;
});
