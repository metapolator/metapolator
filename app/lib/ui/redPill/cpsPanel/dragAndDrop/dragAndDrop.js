define([
    'angular'
  , './drag-directive'
  , './dropHelperFactory'
], function(
    angular
  , dragDirective
  , dropHelperFactory
) {
    "use strict";
    return angular.module('mtk.dragAndDrop', [])
      .directive('mtkDrag', dragDirective)
      .factory('DropHelper', dropHelperFactory)
      ;
});
