define([
    'angular'
  , './instance-controller'
  , './instance-directive'
  , '../../glyph/glyph'
], function(
    angular
  , Controller
  , directive
  , glyphModule
) {
    "use strict";
    return angular.module('mtk.instance', [glyphModule.name])
           .controller('InstanceController', Controller)
           .directive('mtkInstance', directive)
           ;
});
