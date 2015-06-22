define([
    'angular'
  , '../../../local-menu/local-menu'
  , './font-by-controller'
  , './font-by-directive'
], function(
    angular
  , localMenuModule
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.fontBy', [localMenuModule.name])
           .controller('FontByController', Controller)
           .directive('mtkFontBy', directive)
           ;
});
