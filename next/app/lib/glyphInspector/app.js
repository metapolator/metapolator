define([
    'webAPI/document'
  , 'angular'
  , './glyphInspector-controller'
  , './glyphInspector-directive'
  , '../fileUploader/app'
  , './file-service'
  , '../fileViewer/app'
], function (
    document
  , angular
  , Controller
  , Directive
  , fileUploader
  , fileService
  , fileViewer
) {
    "use strict";
    console.log('glyphInspector loading');
    //return Module
    return angular.module('glyphInspector', [fileUploader.name, fileViewer.name])
    .service('fileService',fileService)
    .controller('GlyphInspectorController', Controller)
    .directive('glyphInspector', Directive);
});