define([
    'metapolator/ui/metapolator/services/selection'
], function(
    selection
) {
    "use strict";
    function SpecimenRubberbandController($scope) {
        this.$scope = $scope;

        $scope.toggleSet = function(set) {
            for (var i = $scope.model.length - 1; i >= 0; i--) {
                var sequence = $scope.model[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var master = sequence.children[j];
                    if (master.edit) {
                        for (var k = master.children.length - 1; k >= 0; k--) {
                            var glyph = master.children[k];
                            if (isInSet(glyph)) {
                                if (glyph.edit) {
                                    glyph.edit = false;
                                    selection.removeFromSelection('glyph', glyph);
                                } else {
                                    glyph.edit = false;
                                    selection.addToSelection('glyph', glyph);
                                }
                            }
                        }
                    }
                }
            }
            
            function isInSet(glyph) {
                for (var i = set.length - 1; i >= 0; i--) {
                    var setGlyph = set[i];
                    if (setGlyph == glyph) {
                        return true;
                    }
                }
                return false;
            }
            selection.updateSelection('glyph');
            $scope.$apply();
        };
        
        $scope.selectSet = function(set) {
            for (var i = set.length - 1; i >= 0; i--) {
                var glyph = set[i];
                glyph.edit = true;
                selection.addToSelection('glyph', glyph);
            }
            selection.updateSelection('glyph');
            $scope.$apply();
        };
        
        $scope.deselectAllGlyphs = function() {
            for (var i = $scope.model.length - 1; i >= 0; i--) {
                var sequence = $scope.model[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var master = sequence.children[j];
                    if (master.edit) {
                        for (var k = master.children.length - 1; k >= 0; k--) {
                            var glyph = master.children[k];
                            glyph.edit = false;
                            selection.removeFromSelection('glyph', glyph);
                        }
                    }
                }
            }
            selection.updateSelection('glyph');
            $scope.$apply();
        };
    }


    SpecimenRubberbandController.$inject = ['$scope'];
    var _p = SpecimenRubberbandController.prototype;

    return SpecimenRubberbandController;
});
