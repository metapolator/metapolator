define([], function() {
    "use strict";

    function redPillGlyphDirective(glyphRendererAPI) {
        function link(scope, element, attrs) {
            var glyph = scope.mtkGlyphElement
              , svg = glyphRendererAPI.get(glyph.master.id, glyph.id)
              ;
            element.append(svg);

            element.on('$destroy', function() {
                glyphRendererAPI.revoke(glyph.master.id, glyph.id);
            });
        }
        return {
            restrict: 'E'
          , link: link
          , scope: { mtkGlyphElement: '=' }
        };
    }

    redPillGlyphDirective.$inject = ['glyphRendererAPI'];
    return redPillGlyphDirective;
});
