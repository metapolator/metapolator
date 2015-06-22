define([
    'angular'
  , './specimen-panel-controller'
  , './specimen-panel-directive'
  , './specimen-tools/specimen-tools'
  , './specimen-field/specimen-field'
], function(
    angular
  , Controller
  , directive
  , specimenToolsModule
  , specimenFieldModule
) {
    "use strict";
    return angular.module('mtk.specimenPanel', [specimenToolsModule.name, specimenFieldModule.name])
           .controller('SpecimenPanelController', Controller)
           .directive('mtkSpecimenPanel', directive)
           ;
});
