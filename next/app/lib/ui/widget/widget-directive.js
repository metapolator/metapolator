"use strict";
define([
    'require/text!./widget.tpl'
    ], function(
    template
) {
    function widgetDirective(mainCtrl) {
        return {
            restrict: 'E' // only matches element names
          , controller: 'WidgetController'
          , replace: false
          , template: template
          , scope: {
                model: '=mtkModel'
          }
        };
    }
    widgetDirective.$inject = [];
    return widgetDirective;
})
