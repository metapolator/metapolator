define([], function() {
    "use strict";
    function RedPillGlyphsController($scope, selectGlyphs, updateCPS) {
        this.$scope = $scope;
        this.$scope.name = 'redPillGlyphs';
        this.$scope.selectGlyphs = selectGlyphs;
        this.$scope.updateCPS = updateCPS;

        // a default value
        this.$scope.selector = 'glyph#a';
        this.$scope.glyphControlsVisible = true;
        this.$scope.glypsize = this.$scope.initialGlypsize = 512;
    }
    RedPillGlyphsController.$inject = ['$scope', 'selectGlyphs'];
    var _p = RedPillGlyphsController.prototype;

    _p.toggleGlyphControls = function() {
        this.$scope.glyphControlsVisible = !this.$scope.glyphControlsVisible;
        this.$scope.$broadcast('show-glyph-controls', this.$scope.glyphControlsVisible);
    }

    return RedPillGlyphsController;
});
