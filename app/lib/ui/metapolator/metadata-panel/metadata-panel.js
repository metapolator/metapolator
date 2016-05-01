define([
    'angular'
  , './metadata-panel-controller'
  , './metadata-panel-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.metadataPanel', [])
           .controller('MetadataPanelController', Controller)
           .directive('mtkMetadataPanel', directive)
           ;
});
