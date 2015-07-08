define([
    'angular'
  , './font-export-panel-controller'
  , './font-export-panel-directive'
  , '../local-menu/local-menu'
], function(
    angular
  , Controller
  , directive
  , localMenuModule
) {
    "use strict";
    return angular.module('mtk.fontExportPanel', [localMenuModule.name])
           .controller('FontExportPanelController', Controller)
           .directive('mtkFontExportPanel', directive)
           ;
});
