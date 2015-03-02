define([
    'angular'
  , './textEditor-controller'
  , './textEditor-directive'
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

    return angular.module('mtk.textEditor', ['ui.codemirror'])
           .controller('TextEditorController', Controller)
           .directive('mtkTextEditor', directive)
           .controller('CodeMirrorController', CodeMirrorController)
           ;
});
