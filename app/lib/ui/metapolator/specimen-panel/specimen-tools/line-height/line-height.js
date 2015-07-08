define([
    'angular'
  , '../../../local-menu/local-menu'
  , './line-height-controller'
  , './line-height-directive'
], function(
    angular
  , localMenuModule
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.lineHeight', [localMenuModule.name])
           .controller('LineHeightController', Controller)
           .directive('mtkLineHeight', directive)
           ;
});
