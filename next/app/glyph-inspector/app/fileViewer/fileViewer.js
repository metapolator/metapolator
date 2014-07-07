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
    return angular.module('fileViewer', [])
      .controller('fileViewerController', Controller)
      .directive('fileViewer', Directive)
});