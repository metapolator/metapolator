define([], function() {
    "use strict";
    function GlyphController($scope, glyphRendererAPI) {
        this.$scope = $scope;
        this.$scope.name = 'glyph';
        
        // if a glyph of an instance is rendered, we need to check if the corresponding glyph
        // of iths baseMaster(s) are measured already
        $scope.checkBaseMasters = function(glyph) {
            var instance = glyph.parent;
            for (var i = instance.axes.length - 1; i >= 0; i--) {
                var axis =  instance.axes[i]
                  , master = axis.master
                  , masterGlyph = master.findGlyphByName(glyph.name);
                if (!masterGlyph.measured) {
                    masterGlyph.measureGlyph();
                } 
            }
        };

        $scope.renderGlyph = function(masterName, glyphName) {
            return glyphRendererAPI.get(masterName, glyphName);
        };

        $scope.revokeGlyph = function(masterName, glyphName) {
            glyphRendererAPI.revoke(masterName, glyphName);
        };
    }

    GlyphController.$inject = ['$scope', 'glyphRendererAPI'];
    var _p = GlyphController.prototype;

    return GlyphController;
}); 