define([
    'angular'
  , './drag-directive'
], function(
    angular
  , dragDirective
) {
    "use strict";
    return angular.module('mtk.dragAndDrop', [])
      .directive('mtkDrag', dragDirective)
      ;
});
