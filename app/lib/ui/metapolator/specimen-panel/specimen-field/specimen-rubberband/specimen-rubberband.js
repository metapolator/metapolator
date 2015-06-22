define([
    'angular'
  , './specimen-rubberband-controller'
  , './specimen-rubberband-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.specimenRubberband', [])
           .controller('SpecimenRubberbandController', Controller)
           .directive('mtkSpecimenRubberband', directive)
           ;
});
