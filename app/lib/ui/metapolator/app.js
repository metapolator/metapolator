define([
     'angular'
  , './app-controller'
  , './app-directive'
  , './parameter-panel/parameter-panel'
  , './specimen-panel/specimen-panel'
  , './master-panel/master-panel'
  , './design-space-panel/design-space-panel'
  , './instance-panel/instance-panel'
  , './font-export-panel/font-export-panel'
  , './metadata-panel/metadata-panel'
  , './menubar/menubar'
  , './dialog/dialog'
  , './divider/horizontal-divider/horizontal-divider'
  , './divider/vertical-divider/vertical-divider'
], function(
    angular
  , Controller
  , directive
  , parameterPanelModule
  , specimenPanelModule
  , masterPanelModule
  , designSpacePanelModule
  , instancePanelModule
  , fontExportPanelModule
  , metadataPanel
  , menubarModule
  , dialogModule
  , horizontalDividerModule
  , verticallDividerModule
) {
    "use strict";
    return angular.module('mtk.metapolator', [parameterPanelModule.name, specimenPanelModule.name, masterPanelModule.name, designSpacePanelModule.name, instancePanelModule.name, fontExportPanelModule.name, menubarModule.name, dialogModule.name, metadataPanel.name, horizontalDividerModule.name, verticallDividerModule.name])
      .controller('AppController', Controller)
      .directive('metapolator', directive)
      ;
});
