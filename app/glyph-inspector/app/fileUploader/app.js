define([
    'webAPI/document'
  , 'angular'
  , './app-controller'
  , './app-directive'
], function (
    document
  , angular
  , Controller
  , Directive
) {
    "use strict";
    //return Module
    return angular.module('fileUploader', [])
      .controller('FileUploaderController', Controller)
      .directive('fileUploader', Directive)
});