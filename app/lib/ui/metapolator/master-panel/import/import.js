define([
    'angular'
  , './import-controller'
  , './import-directive'
], function (
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.mastersImport', [])
           .controller('MastersImportController', Controller)
           .directive('mtkMastersImport', directive)
           ;
});
