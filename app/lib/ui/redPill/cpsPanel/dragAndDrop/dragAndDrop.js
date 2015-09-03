define([
    'angular'
  , './drag-directive'
  , './dragover-autoscroll-directive'
  , './dropHelperFactory'
], function(
    angular
  , dragDirective
  , dragoverAutoscrollDirective
  , dropHelperFactory
) {
    "use strict";
    return angular.module('mtk.dragAndDrop', [])
      .directive('mtkDrag', dragDirective)
      .directive('mtkDragoverAutoscroll', dragoverAutoscrollDirective)
      .factory('DropHelper', dropHelperFactory)
      ;
});
