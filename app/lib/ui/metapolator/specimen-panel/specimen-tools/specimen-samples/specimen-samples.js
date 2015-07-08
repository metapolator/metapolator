define([
    'angular'
  , '../../../local-menu/local-menu'
  , './specimen-samples-controller'
  , './specimen-samples-directive'
], function(
    angular
  , localMenuModule
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.specimenSamples', [localMenuModule.name])
           .controller('SpecimenSamplesController', Controller)
           .directive('mtkSpecimenSamples', directive)
           ;
});
