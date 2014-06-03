define([
	'bower_components/zip/zip'
], function() {
	"use strict";
	function FileUploaderController($scope) {
		this.$scope = $scope;
		this.$scope.name = 'fileUploader';
		this.requiredFeaturesAvailable();

		this.$scope.file;
		this.$scope.$watch('file', this.onFileReady.bind(this));
		console.log(zip);
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
		if (newFile){
			zip.workerScriptsPath = '/lib/bower_components/zip/';
			// use a BlobReader to read the zip from a Blob object
			zip.createReader(new zip.Data64URIReader(newFile), function(reader) {

			  // get all entries from the zip
			  reader.getEntries(function(entries) {
				if (entries.length) {
					console.log(entries);
				  // get first entry content as text
				 entries[120].getData(new zip.TextWriter(), function(text) {
					// text contains the entry data as a String
					console.log(text);

					// close the zip reader
					reader.close(function() {
					  // onclose callback
					});

				  }, function(current, total) {
					// onprogress callback
				  });
				}
			  });
			}, function(error) {
			  // onerror callback
			});
		}
	}
	
	return FileUploaderController;
})
