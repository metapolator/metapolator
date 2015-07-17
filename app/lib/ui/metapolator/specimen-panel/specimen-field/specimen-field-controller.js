define([
    'jquery'
], function(
    $
) {
    "use strict";
    function SpecimenFieldController($scope, metapolatorModel) {
        this.$scope = $scope;
        this.$scope.name = 'specimenField'; 
        
        $scope.glyphClick = function(event, glyph) {
            if ($scope.model.settings.selecting && glyph.level) { // the second condition excludes fake glyphs like paragraph break, which hasnt a real model
                if (event.metaKey || event.shiftKey || event.altKey) {
                   $scope.toggleGlyph(glyph); 
                } else {
                    $scope.selectGlyph(glyph);
                }
                metapolatorModel.masterPanel.updateSelections("glyph");
            }
        };
        
        $scope.toggleGlyph = function (glyph) {
            window.logCall("toggleGlyph");
            glyph.edit = !glyph.edit;
        };
        
        $scope.selectGlyph = function (glyph) {
            window.logCall("selectGlyph");
            glyph.edit = true;
        };
        
        // in the specimen1 injecting sequences (with masters)
        // in the specimen2 injecting instances
        if ($scope.model.settings.inject === "masters") {
            $scope.injections = metapolatorModel.masterPanel.sequences;
        } else if ($scope.model.settings.inject === "instances") {
            $scope.injections = metapolatorModel.instancePanel.sequences;
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
