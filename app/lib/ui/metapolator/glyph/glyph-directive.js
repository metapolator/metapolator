define([
], function() {
    "use strict";
    function glyphDirective() {
        return {
            restrict: 'E',
            controller: 'GlyphController',
            replace: false,
            scope : {
                model : '=mtkModel'
            },
            link : function(scope, element, attrs, ctrl) {
                var masterName = scope.model.masterName;
                var glyphName = scope.model.name;
                
                // add css classes for breaks and spaces
                var parentElement = element.parent();
                if (glyphName == "space") {
                    parentElement.addClass("space-character");
                } else if (glyphName == "*n") {
                    // no-glyph is used by the specimenRubberband, to ignore these when making a selection
                    element.addClass("no-glyph");
                    parentElement.addClass("line-break");
                } else if (glyphName == "*p") {
                    element.addClass("no-glyph");
                    parentElement.addClass("paragraph-break");
                } else if (glyphName == "*specimenbreak") {
                    element.addClass("no-glyph");
                    parentElement.addClass("specimen-break");
                } 
                
                // this is to ignore the fake glyphs, like specimenbreak etc. Their object
                // doesn't have a level (only a name)
                if (scope.model.level) {
                    // measure the glyph upon first rendering
                    if (scope.model.type == "master") {
                        if (!scope.model.measured) {
                            scope.model.measureGlyph();
                        }
                    } else if (scope.model.type == "instance") {
                        scope.checkBaseMasters(scope.model);
                    }       
                    element.bind('$destroy', function(event) {
                        //stateful.glyphRendererAPI.revoke(masterName, glyphName);
                    });
                }
            }
        };
    }
    
    glyphDirective.$inject = [];
    return glyphDirective;
});
