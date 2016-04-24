define([
    'jquery'
  , 'jquery-ui'
  , 'angular'
  , './master-panel-controller'
  , './master-panel-directive'
  , './master/master'
  , '../view-rubberband/view-rubberband'
  , 'sortable'
], function(
    jquery
  , jqueryui
  , angular
  , Controller
  , directive
  , masterModule
  , viewRubberbandModule
  , sortableModule
) {
    "use strict";
    return angular.module('mtk.masterPanel', ['ui.sortable', masterModule.name, viewRubberbandModule.name])
           .controller('MasterPanelController', Controller)
           .directive('mtkMasterPanel', directive)
           ;
});
