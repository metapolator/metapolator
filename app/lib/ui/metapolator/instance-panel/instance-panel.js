define([
    'angular'
  , './instance-panel-controller'
  , './instance-panel-directive'
  , './instance/instance'
  , '../view-rubberband/view-rubberband'
  , '../local-menu/local-menu'
], function(
    angular
  , Controller
  , directive
  , instanceModule
  , viewRubberbandModule
  , localMenuModule
) {
    "use strict";
    return angular.module('mtk.instancePanel', [instanceModule.name, viewRubberbandModule.name, localMenuModule.name])
           .controller('InstancePanelController', Controller)
           .directive('mtkInstancePanel', directive)
           ;
});
