define([
    'angular'
  , './redPillMaster-controller'
  , './redPillMaster-directive'
  , '../filesMode/filesMode'
], function(
    angular
  , Controller
  , directive
  , filesMode
) {
    "use strict";
    return angular.module('mtk.redPillMaster', [filesMode.name])
           .controller('RedPillMasterController', Controller)
           .directive('mtkRedPillMaster', directive)
           ;
})
