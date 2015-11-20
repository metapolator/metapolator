define([
    'require/text!./redPillGlyphs.tpl'
    ], function(
    template
) {
    "use strict";
    function redPillGlyphsDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'RedPillGlyphsController'
          , replace: false
          , template: template
          , scope: {}
          , controllerAs: 'ctrl'
          , bindToController: true
        };
    }
    redPillGlyphsDirective.$inject = [];
    return redPillGlyphsDirective;
});
