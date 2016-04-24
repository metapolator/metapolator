define([
    'angular'
  , 'd3'
  , './mixer-controller'
  , './mixer-directive'
  , './strict/strict'
], function(
    angular
  , d3
  , Controller
  , directive
  , strictModule
) {
    "use strict";
    return angular.module('mtk.mixer', [strictModule.name])
           .controller('MixerController', Controller)
           .directive('mtkMixer', directive)
           ;
});
