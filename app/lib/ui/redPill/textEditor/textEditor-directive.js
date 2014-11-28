define([
    'require/text!./textEditor.tpl'
    ], function(
    template
) {
    "use strict";
    function textEditorDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'TextEditorController'
          , replace: false
          , template: template
          , scope: {}
        };
    }
    textEditorDirective.$inject = [];
    return textEditorDirective;
})
