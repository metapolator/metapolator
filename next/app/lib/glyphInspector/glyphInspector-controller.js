define([], function() {
    "use strict";
    function GlyphInspectorController($scope) {
        var x = new fileService(this.$scope, localStorage, [1,2,3]);
    }

    GlyphInspectorController.$inject = ['$scope', 'FileService'];
    var _p = GlyphInspectorController.prototype;
    
    return GlyphInspectorController;
})
