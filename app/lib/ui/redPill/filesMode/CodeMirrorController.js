define([
], function(
) {
    "use strict";
    /**
     * This controller is needed to organize the destruction of the
     * doc or the codemirror instance itself if either of these is
     * cached somewhere else.
     * If the doc of this editor or the editor is not cahched somewhere
     * else it is probably unnecessary to use this controller.
     */
    function CodeMirrorController($scope) {
        this.$scope = $scope;
        $scope.$on('$destroy', this._destroy.bind(this));
    }
    CodeMirrorController.$inject = ['$scope'];
    
    var _p = CodeMirrorController.prototype;
    
    /**
     * informs the parent that there might be some cleanup needed
     */
    _p._emitCodeMirrorDestroy = function(cm) {
        this.$scope.$emit('codeMirrorDestroy', cm);
    }
    
    _p._destroy = function() {
        // the ui-codemirror directive listens to CodeMirror and calls
        // _emitCodeMirrorDestroy. We need this to propagate the cm object
        // which we wouldn't have a refernce to, otherwise.
        this.$scope.$broadcast('CodeMirror', this._emitCodeMirrorDestroy.bind(this))
    }
    
    return CodeMirrorController;
})
