define([
    'angular'
  , './filesMode-controller'
  , './filesMode-directive'
  , 'ui-codemirror'
], function(
    angular
  , Controller
  , directive
  , ___no_amd_module// ui.codemirror
) {
    "use strict";
    return angular.module('mtk.filesMode', ['ui.codemirror'])
           .controller('FilesModeController', Controller)
           .directive('mtkFilesMode', directive)
           ;
})
