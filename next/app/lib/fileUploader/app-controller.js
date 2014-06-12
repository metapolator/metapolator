define([
	'bower_components/zip/zip'
    , 'models/FS'
    , '../glyphInspector/file-service'
], function(Zip
    , FS) {
	"use strict";
	function FileUploaderController($scope) {
		this.$scope = $scope;
		this.$scope.name = 'fileUploader';
		this.requiredFeaturesAvailable();
        this.$scope.uploaderText = "Drop down .ufo zip here";

		this.$scope.file;
		this.$scope.$watch('file', this.onFileReady.bind(this));

	}
	
	FileUploaderController.$inject = ['$scope'];
	var _p = FileUploaderController.prototype;

	_p.requiredFeaturesAvailable = function() {
		this.$scope.requiredFeaturesAvailable = (
			!!window.File &&
			!!window.FileReader &&
			!!window.FileList &&
			!!window.Blob &&
			!!window.localStorage);
	}

	_p.onFileReady = function(newFile, oldFile) {
		var recursiveUnzip = function(reader, entries) {
			var current = entries.pop();
			var currentName = current.filename;
	 		if (!current.directory) {
				current.getData(new zip.TextWriter(), function(text) {
						localStorage.setItem(currentName, text);
						reader.close(function() {
							if (entries.length > 0)
								recursiveUnzip(reader, entries);
						});

				  	}, function(current, total) {
						console.log(current, total);
				});
			}
		};

		if (newFile){
            this.$scope.uploaderText = "loading...";
			zip.workerScriptsPath = '/lib/bower_components/zip/';
			// use a DataURI to read the zip from a Blob object
			zip.createReader(new zip.Data64URIReader(newFile), function(reader) {
				  // get all entries from the zip
				  reader.getEntries(function(entries) {
				  	console.log(reader);
					if (entries.length) {
					 	recursiveUnzip(reader, entries);
					}
				  });
				}, function(error) {
                    
			});
            this.$scope.uploaderText = "Uploaded " + localStorage.length + " files"; 
            console.log(this.$scope);

		}
	}
	
	return FileUploaderController;
})
