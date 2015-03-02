define([
    'codemirror/lib/codemirror'
  , 'metapolator/io/readDirRecursive'
], function(
    CodeMirror
  , readDirRecursive
) {
    "use strict";
    function TextEditorController($scope, io) {
        this.$scope = $scope;
        this.$scope.name = 'textEditor';
        this.io = io;

        this.$scope.buffers = Object.create(null);
        this.$scope.files = [];

        // FIXME: go async when this is used somewhere else than the demo
        // the demo io is InMemory, and as such sync is OK.
        this.path = 'project/data/com.metapolator/cps';
        $scope.allFiles = readDirRecursive(false, io, this.path)
        .map(function(len, name){ return name.slice(len);}.bind(null, this.path.length+1));

        $scope.$on("codeMirrorDestroy", this._codemirrorDestroyHandler.bind(this));
        $scope.getEditorOptions = this.getEditorOptions.bind(this);
    }
    TextEditorController.$inject = ['$scope', 'io'];
    var _p = TextEditorController.prototype;

    _p.getEditorOptions = function(source) {
        // From the CodeMirror docs:
        // Note that the options object passed to the constructor will
        // be mutated when the instance's options are changed, so you
        // shouldn't share such objects between instances.
        return {
            lineWrapping : false
          , lineNumbers: true
          //,  readOnly: 'nocursor'
          // firstLineNumber: 10 // interesting for rules mode
          , mode: 'css'
          , onLoad: this._codemirrorLoadedHandler.bind(this, source)
        };
    };

    _p._getCodeMirrorDoc = function(file) {
        var text, doc
          , path = this.path + '/' + file
          , timeout
          ;

        var update = function () {
            this.io.writeFile(false, path, doc.getValue());

        }.bind(this);
        function onChange() {
            // reset the timeout
            window.cancelAnimationFrame(timeout);
            timeout = window.requestAnimationFrame(update);
        }

        if(!(file in this.$scope.buffers)) {
            // FIXME: do this async eventually.
            text = this.io.readFile(false, path);
            this.$scope.buffers[file] = doc = new CodeMirror.Doc(text, 'css');
            // TODO: throttle this
            doc.on('change', onChange);

        }
        return this.$scope.buffers[file].linkedDoc({sharedHist: true});
    };

    _p._codemirrorLoadedHandler = function(source, cm) {
        var doc = this._getCodeMirrorDoc(source);
        cm.swapDoc(doc);
    };

    _p._codemirrorDestroyHandler = function(event, cm) {
        var linked = cm.getDoc();
        linked.iterLinkedDocs(function(doc){ doc.unlinkDoc(linked);});
    };

    return TextEditorController;
});
