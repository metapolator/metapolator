define([
    'angular'
  , './specimen-field-controller'
  , './specimen-field-directive'
  , './specimen-rubberband/specimen-rubberband'
], function(
    angular
  , Controller
  , directive
  , specimenRubberbandModule
) {
    "use strict";
    return angular.module('mtk.specimenField', [specimenRubberbandModule.name])
           .controller('SpecimenFieldController', Controller)
           .directive('mtkSpecimenField', directive)
           ;
});
