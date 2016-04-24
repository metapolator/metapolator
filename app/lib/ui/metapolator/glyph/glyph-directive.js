define([
], function() {
    'use strict';
    function glyphDirective(momModelController) {
        return {
            restrict: 'E'
          , controller: 'GlyphController'
          , replace: false
          , scope : {
                model : '=mtkModel'
            }
          , link : function(scope, element, attrs, ctrl) {
                var glyphName = scope.model.name
                // add css classes for breaks and spaces
                  , parentElement = element.parent()
                  , momGlyph, glyphRenderer;
                if (glyphName === 'space') {
                    parentElement.addClass('space-character');
                } else if (glyphName === '*n') {
                    // no-glyph is used by the specimenRubberband, to ignore these when making a selection
                    element.addClass('no-glyph');
                    parentElement.addClass('line-break');
                } else if (glyphName === '*p') {
                    element.addClass('no-glyph');
                    parentElement.addClass('paragraph-break');
                } else if (glyphName === '*specimenbreak') {
                    element.addClass('no-glyph');
                    parentElement.addClass('specimen-break');
                }

                // this is to ignore the fake glyphs, like specimenbreak etc. Their object
                // doesn't have a level (only a name)
                if (scope.model.level) {
                    // measure the glyph upon first rendering
                    if (scope.model.type === 'master') {
                        scope.model.checkIfIsDisplayed();
                    } else if (scope.model.type === 'instance') {
                        // for instances we have to check its master(s) and check the corresponding glyph(s)
                        var masterGlyphs = scope.model.getMasterGlyphs(scope.model.name);
                        for (var i = masterGlyphs.length - 1; i >= 0; i--) {
                            masterGlyphs[i].checkIfIsDisplayed();
                        }
                    }


                    momGlyph = momModelController.query('#' + scope.model.getMasterName() + ' #' + glyphName);
                    glyphRenderer = scope.renderGlyph(momGlyph);
                    glyphRenderer.on('viewBox-change', viewBoxChangeHandler, element[0]);
                    element.append(glyphRenderer.element);
                    element.bind('$destroy', function(event) {
                        glyphRenderer.destroy();
                    });
                }
            }
        };
    }

    function viewBoxChangeHandler(dom, _channel, viewBox) {
        var calculatedWidth = viewBox[2]/viewBox[3] * dom.clientHeight;
        dom.style.width = calculatedWidth + 'px';
    }

    glyphDirective.$inject = ['modelController'];
    return glyphDirective;
});
