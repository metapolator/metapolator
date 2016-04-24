define([
    'angular'
  , './rename-controller'
  , './rename-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.rename', [])
           .controller('RenameController', Controller)
           .directive('mtkRename', directive)
           ;
});
