define([
    'angular'
  , './cpsPanel-controller'
  , './cpsPanel-directive'
  , './elements/collection/collection'
  , 'metapolator/ui/redPill/cpsPanel/dragAndDrop/dragAndDrop'
], function(
    angular
  , Controller
  , directive
  , collection
  , dragAndDrop
) {
    "use strict";
    return angular.module('mtk.cpsPanel', [collection.name, dragAndDrop.name])
      .controller('CpsPanelController', Controller)
      .directive('mtkCpsPanel', directive)
      ;
});
