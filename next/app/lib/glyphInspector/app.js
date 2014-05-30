define([
    'webAPI/document'
  , 'angular'
  , './glyphInspector-controller'
  , './glyphInspector-directive'
  , '../fileUploader/app'
], function (
    document
  , angular
  , Controller
  , Directive
  , fileUploader
) {
    "use strict";
    console.log('glyphInspector loading');
    //return Module
    return angular.module('glyphInspector', [fileUploader.name])

    .controller('GlyphInspectorController', Controller)
    .directive('glyphInspector', Directive);
});