define([
    'angular'
  , './instance-panel-controller'
  , './instance-panel-directive'
  , './instance/instance'
  , '../view-rubberband/view-rubberband'
  , '../local-menu/local-menu'
  , 'angular-ui-sortable'
], function(
    angular
  , Controller
  , directive
  , instanceModule
  , viewRubberbandModule
  , localMenuModule
  , _uiSortable
) {
    "use strict";
    return angular.module('mtk.instancePanel', ['ui.sortable', instanceModule.name, viewRubberbandModule.name, localMenuModule.name])
           .controller('InstancePanelController', Controller)
           .directive('mtkInstancePanel', directive)
           ;
});
