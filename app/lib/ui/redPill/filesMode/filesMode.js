define([
    'angular'
  , './filesMode-controller'
  , './filesMode-directive'
  , './CodeMirrorController'
  , 'ui-codemirror'
], function(
    angular
  , Controller
  , directive
  , CodeMirrorController
  , ___no_amd_module// ui.codemirror
) {
    "use strict";
    
    return angular.module('mtk.filesMode', ['ui.codemirror'])
           .controller('FilesModeController', Controller)
           .directive('mtkFilesMode', directive)
           .controller('CodeMirrorController', CodeMirrorController)
           ;
})
