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
    console.log('fileViewer loading');
    //return Module
    return angular.module('fileViewer', [])
      .controller('fileViewerController', Controller)
      .directive('fileViewer', Directive)
});