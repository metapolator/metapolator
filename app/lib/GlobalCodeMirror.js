// ui code mirror looks for a global CodeMirror object, which is not defined
// by code mirror when loaded via AMD ... m(
// this is the test in the file:
// if (angular.isUndefined(window.CodeMirror))
define('GlobalCodeMirror', [
    'codemirror/lib/codemirror'
  , 'codemirror/mode/css/css'
    ], function(codemirror) {
    window.CodeMirror = codemirror;
    return undefined;
});

