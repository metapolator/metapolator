define([
    'angular'
  , '../../glyph/glyph'
  , '../../rename/rename'
  , './master-controller'
  , './master-directive'
], function(
    angular
  , renameModule
  , glyphModule
  , Controller
  , directive
) {
    "use strict";
    return angular.module('mtk.master', [glyphModule.name, renameModule.name])
           .controller('MasterController', Controller)
           .directive('mtkMaster', directive)
           ;
});
