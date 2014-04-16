define([
    'angular'
  , 'DOM/document'
  , './mainCtrl'
  , './mainDir'
], function(
    angular
  , document
  , mainCtrl
  , mainDir
) {
    angular.module('main', [])
      .controller('mainCtrl', mainCtrl.di)
      .directive('metapolator', mainDir.di)
      ;
    
    return {
        bootstrap: function(document) {
            angular.bootstrap(document, ['main']);
        }
    }
})
