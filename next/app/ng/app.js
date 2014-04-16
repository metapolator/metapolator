define([
    'angular'
  , 'DOM/document'
  , './app-controller'
  , './app-directive'
], function(
    angular
  , document
  , appController
  , appDirective
) {
    angular.module('app', [])
      .controller('AppController', appController.di)
      .directive('metapolator', appDirective.di)
      ;
    
    return {
        bootstrap: function(document) {
            angular.bootstrap(document, ['app']);
        }
    }
})
