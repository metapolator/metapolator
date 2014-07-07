define([
    'require/text!./fileUploader.tpl'
    ], function(
    template
) {
    "use strict";
    function FileUploaderDirective(mainCtrl) {
                
       var processDragOverOrEnter = function(event) {
            if (event != null) {
              event.preventDefault();
            }
            event.dataTransfer.effectAllowed = 'copy';
            return false;
          };
          
        var checkSize = function(size, attrs) {
            var _ref;
            if (((_ref = attrs.maxFileSize) === (void 0) || _ref === '') || (size / 1024) / 1024 < attrs.maxFileSize) {
              return true;
            } else {
              alert("File must be smaller than " + attrs.maxFileSize + " MB");
              return false;
            }
          };
        
        var isTypeValid = function(validMimeTypes, type) {
            if ((validMimeTypes === (void 0) || validMimeTypes === '') || validMimeTypes.indexOf(type) > -1) {
              return true;
            } else {
              alert("Invalid file type.  File must be one of following types " + validMimeTypes);
              return false;
            }
          };
        
        return {
            restrict: 'E' // only matches element names
          , controller: 'FileUploaderController'
          , replace: false
          , template: template
          , scope: {
                model: '=FileModel',
                drop: '&'
            }
          , link: function(scope, element, attrs) {
              var validMimeTypes = attrs.type;
              element.bind('dragover', processDragOverOrEnter);
              element.bind('dragenter', processDragOverOrEnter);
              return element.bind('drop', function(event) {
                var file, name, reader, size, type;
                if (event != null) {
                  event.preventDefault();
                }
                reader = new FileReader();
                reader.onload = function(evt) {
                  if (checkSize(size, attrs) && isTypeValid(validMimeTypes, type)) {
                    return scope.$apply(function() {
                      localStorage.clear();
                      scope.file = evt.target.result;
                      scope.fileName = name;
                    });
                  }
                };
                file = event.dataTransfer.files[0];
                name = file.name;
                type = file.type;
                size = file.size;
                reader.readAsDataURL(file);
                return false;
            });
          }
        };
    }

    FileUploaderDirective.$inject = [];

    return FileUploaderDirective;
})
