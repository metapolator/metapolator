define([
    'require/text!./menubar.tpl'
], function(template) {
    "use strict";
    function menubarDirective() {
        return {
            restrict: 'E'
          , controller: 'MenubarController'
          , replace: false
          , template: template
          , scope : {
                model : '=mtkModel'
            }
        };
    }
    
    menubarDirective.$inject = [];
    return menubarDirective;
});
