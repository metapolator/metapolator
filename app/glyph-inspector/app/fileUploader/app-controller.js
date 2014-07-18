define([
	'../../../lib/bower_components/zip/zip'
    , '../glyphInspector/file-service'
], function(Zip) {
	"use strict";
	function FileUploaderController($scope, fileService) {
		this.$scope = $scope;
		this.$scope.name = 'fileUploader';
		this.requiredFeaturesAvailable();
        this.$scope.uploaderText = "Drop down .ufo zip here";
		this.$scope.file;
		this.$scope.$watch('file', this.onFileReady.bind(this));
        this.fileService = fileService;

	}
	
	FileUploaderController.$inject = ['$scope', 'fileService'];
	var _p = FileUploaderController.prototype;

	_p.requiredFeaturesAvailable = function() {
		this.$scope.requiredFeaturesAvailable = (
			!!window.File &&
			!!window.FileReader &&
			!!window.FileList &&
			!!window.Blob &&
			!!window.localStorage);
	}
    
    _p.filesReady = function() {
        this.fileService.setFilename(this.$scope.fileName);
        this.fileService.ready();
        this.$scope.uploaderText = "Uploaded " + localStorage.length + " files";
        this.$scope.$apply();
    }
    
	_p.onFileReady = function(newFile, oldFile) {
        var self = this;
		var recursiveUnzip = function(reader, entries) {
            if (entries.length == 0) {
                self.filesReady();
            } else {
                var current = entries.pop();
                var currentName = current.filename;

                if (!current.directory) {
                    current.getData(new zip.TextWriter(), function(text) {
                            localStorage.setItem(currentName, text);
                            reader.close(function() {
                                if (entries.length >= 0) 
                                    recursiveUnzip(reader, entries);
                            });

                        }, function(current, total) {
                    });
                } else if (entries.length >= 0){
                    recursiveUnzip(reader, entries);
                }
            }
		};

		if (newFile){
           this.$scope.uploaderText = "loading...";
			zip.createReader(new zip.Data64URIReader(newFile), function(reader) {
				  reader.getEntries(function(entries) {
					if (entries.length) {
					 	recursiveUnzip(reader, entries);
					}
				  });
				}, function(error) {
                    
			});
		}
	}
	
	return FileUploaderController;
})
