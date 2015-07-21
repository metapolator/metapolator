define([
    'jquery'
  , 'metapolator/ui/metapolator/services/selection'
], function(
    $
  , selection
) {
    "use strict";
    function SpecimenFieldController($scope, metapolatorModel) {
        this.$scope = $scope;
        this.$scope.name = 'specimenField'; 
        
        $scope.glyphClick = function(event, glyph) {
            if ($scope.model.settings.selecting && glyph.level) { // the second condition excludes fake glyphs like paragraph break, which hasnt a real model
                if (event.metaKey || event.shiftKey || event.altKey) {
                   toggleGlyph(glyph);
                } else {
                    selectGlyph(glyph);
                }
                selection.updateSelection('glyph');
                //metapolatorModel.masterPanel.updateSelections("glyph");
            }
        };

        function toggleGlyph(glyph) {
            if (glyph.edit) {
                glyph.edit = false;
                selection.removeFromSelection('glyph', glyph);
            } else {
                glyph.edit = false;
                selection.addToSelection('glyph', glyph);
            }
        }

        function selectGlyph(glyph) {
            glyph.edit = true;
            selection.addToSelection('glyph', glyph);
        }
        
        // in the specimen1 injecting sequences (with masters)
        // in the specimen2 injecting instances
        if ($scope.model.settings.inject === "masters") {
            $scope.injections = metapolatorModel.masterSequences;
        } else if ($scope.model.settings.inject === "instances") {
            $scope.injections = metapolatorModel.instanceSequences;
        }
        // inital triggering of filter
        $scope.model.updateSelectedMasters($scope.injections);
        $scope.model.updateGlyphsIn();
        
        // spaces manager
        var manageSpacesTimer;
        
        $scope.$watch("model.sizes.fontSize", function() {
            startTimer();
        }, true);
        
        function startTimer () {
            clearTimeout(manageSpacesTimer);
            manageSpacesTimer = setTimeout(function() {
                manageSpaces();
            }, 50); 
        }
        
        var startPosition = null;
        
        function manageSpaces() {
            if (!startPosition) {
                startPosition = parseInt($("mtk-specimen-field > .specimen-content").css("padding-left"));
            }
            var spaces = $(".space-character"),
                prevSpace = false;
    
            $(spaces).css({
                "width" : "auto",
                "clear" : "none"
            });
            var brokenEnd = false;
            $("mtk-specimen-field li").each(function() {
                if ($(this).position().left === startPosition) {
                    // prevent space at line start
                    if ($(this).hasClass("space-character")) {
                        $(this).css({
                            "width" : "0",
                            "clear" : "both"
                        });
                    }
                    if (brokenEnd && !$(this).hasClass("space-character") && !$(this).hasClass("line-break") && !$(this).hasClass("paragraph-break") && !$(this).hasClass("specimen-break")) {
                        $(prevSpace).css({
                            "width" : "0",
                            "clear" : "both"
                        });
                    }
                }
                if ($(this).hasClass("space-character")) {
                    prevSpace = this;
                    brokenEnd = false;
                } else if ($(this).hasClass("line-break") || $(this).hasClass("paragraph-break") || $(this).hasClass("specimen-break")) {
                    brokenEnd = false;
                } else {
                    brokenEnd = true;
                }
            });
        }
    }


    SpecimenFieldController.$inject = ['$scope', 'metapolatorModel'];
    var _p = SpecimenFieldController.prototype;

    return SpecimenFieldController;
});
