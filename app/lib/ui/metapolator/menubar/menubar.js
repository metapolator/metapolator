define([
    'angular'
  , './menubar-controller'
  , './menubar-directive'
  , '../rename/rename'
], function(
    angular
  , Controller
  , directive
  , renameModule
) {
    "use strict";
    return angular.module('mtk.menubar', [renameModule.name])
           .controller('MenubarController', Controller)
           .directive('mtkMenubar', directive)
           ;
});
