define([
    'angular'
  , './specimen-tools-controller'
  , './specimen-tools-directive'
  , './specimen-samples/specimen-samples'
  , './size-rope/size-rope'
  , './size-input/size-input'
  , './line-height/line-height'
  , './mixer/mixer'
  , './font-by/font-by'
], function(
    angular
  , Controller
  , directive
  , specimenSamplesModule
  , sizeRopeModule
  , sizeInputModule
  , lineHeightModule
  , mixerModule
  , fontByModule
) {
    "use strict";
    return angular.module('mtk.specimenTools', [sizeRopeModule.name, sizeInputModule.name, lineHeightModule.name, specimenSamplesModule.name, mixerModule.name, fontByModule.name])
           .controller('SpecimenToolsController', Controller)
           .directive('mtkSpecimenTools', directive)
           ;
});
