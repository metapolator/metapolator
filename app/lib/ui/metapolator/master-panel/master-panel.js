define([
    'angular'
  , './master-panel-controller'
  , './master-panel-directive'
  , './master/master'
  , '../view-rubberband/view-rubberband'
  , 'angular-ui-sortable'
], function(
    angular
  , Controller
  , directive
  , masterModule
  , viewRubberbandModule
  , _uiSortable
) {
    "use strict";
    return angular.module('mtk.masterPanel', ['ui.sortable', masterModule.name, viewRubberbandModule.name])
           .controller('MasterPanelController', Controller)
           .directive('mtkMasterPanel', directive)
           ;
});
