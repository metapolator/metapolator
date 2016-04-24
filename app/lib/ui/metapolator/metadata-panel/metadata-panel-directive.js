define([
    'require/text!./metadata-panel.tpl'
    ], function(
    template
) {
    "use strict";
    function metadataPanelDirective(mainCtrl) {
        return {
            restrict: 'E'
          , controller: 'MetadataPanelController'
          , replace: false
          , template: template
          , scope: {
                model: '=mtkModel'
            }
        };
    }
    metadataPanelDirective.$inject = [];
    return metadataPanelDirective;
});
