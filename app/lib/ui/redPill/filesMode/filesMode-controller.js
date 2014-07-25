define([

], function(

) {
    "use strict";
    function FilesModeController($scope, getMasterSources, getCodeMirrorDoc
                                                , returnCodeMirrorDoc) {
        this.$scope = $scope;
        this.$scope.name = 'filesMode'
        if($scope.$parent.data.modeData[$scope.$parent.data.mode] === undefined)
            $scope.$parent.data.modeData[$scope.$parent.data.mode] = {
                files: []
                
            }
        $scope.data = $scope.$parent.data.modeData[$scope.$parent.data.mode];
        
        this._getCodeMirrorDoc = getCodeMirrorDoc;
        this._returnCodeMirrorDoc = returnCodeMirrorDoc;
        
        $scope.sources = getMasterSources($scope.$parent.master);
        
        $scope.$on("codeMirrorDestroy", this._codemirrorDestroyHandler.bind(this));
        $scope.getEditorOptions = this.getEditorOptions.bind(this)
    }
    FilesModeController.$inject = ['$scope', 'getMasterSources', 'getCodeMirrorDoc', 'returnCodeMirrorDoc'];
    var _p = FilesModeController.prototype;
    
    
    _p.getEditorOptions = function(source) {
        // From the CodeMirror docs:
        // Note that the options object passed to the constructor will
        // be mutated when the instance's options are changed, so you
        // shouldn't share such objects between instances.
        return {
            lineWrapping : true
          , lineNumbers: true
          //,  readOnly: 'nocursor'
          // firstLineNumber: 10 // interesting for rules mode
          , mode: 'css'
          , onLoad: this._codemirrorLoadedHandler.bind(this, source)
        };
    }
    
    _p._codemirrorLoadedHandler = function(source, cm) {
        var doc = this._getCodeMirrorDoc(source);
        cm.swapDoc(doc);
    }
    
    _p._codemirrorDestroyHandler = function(event, cm) {
        this._returnCodeMirrorDoc(cm.getDoc());
    }
    
    return FilesModeController;
})
