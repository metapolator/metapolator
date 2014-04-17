"use strict";
define([
    'require/text!./container.tpl'
    ], function(
    template
) {
    function containerDirective(mainCtrl) {
        return {
            restrict: 'E' // only matches element names
          , controller: 'ContainerController'
          , replace: true
          , template: template
        };
    }
    containerDirective.$inject = [];
    return containerDirective;
})
