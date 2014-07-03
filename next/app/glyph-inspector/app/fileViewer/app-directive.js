define([
    'require/text!./fileViewer.tpl'
    ], function(
    template
) {
    "use strict";
    function FileViewerDirective($compile) {
        return {
            restrict: 'E' // only matches element names
          , controller: 'FileViewerController'
          , replace: false
          , template: template
          , scope: {
                model: '=FileModel',
                drop: '&'
            }
          , link: function(scope, element, attrs) {
              scope.$on('filesReady', function(event) {
                  scope.filenames = [];
                  for (var key in localStorage){
                       scope.filenames.push(key);
                    }
                  document.getElementById('fileViwer').style.display = 'block';
              });
            return false
          }
        };
    }
    FileViewerDirective.$inject = ['$compile'];
    return FileViewerDirective;
})
