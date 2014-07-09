define([
    'require/text!./glyphInspector.tpl'
    ], function(
    template
) {
    "use strict";
    function GlyphInspectorDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'GlyphInspectorController'
          , replace: false
          , template: template
        };
    }
    GlyphInspectorDirective.$inject = [];
    return GlyphInspectorDirective;
})
