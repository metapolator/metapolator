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
    console.log('FileViewer loading');
    //return Module
    return angular.module('FileViewer', [])
      .controller('FileViewerController', Controller)
      .directive('fileViewer', Directive)
});