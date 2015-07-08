define([
    'angular'
  , './design-space-panel-controller'
  , './design-space-panel-directive'
  , './control/control'
  , '../rename/rename'
], function(
    angular
  , Controller
  , directive
  , controlModule
  , renameModule
) {
    "use strict";
    return angular.module('mtk.designSpacePanel', [controlModule.name, renameModule.name])
           .controller('DesignSpacePanelController', Controller)
           .directive('mtkDesignSpacePanel', directive)
           ;
});
