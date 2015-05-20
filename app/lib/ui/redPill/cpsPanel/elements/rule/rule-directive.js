define([
    'require/text!./rule.tpl'
    ], function(
    template
) {
    "use strict";
    function RuleDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'RuleController'
          , replace: false
          , template: template
          , scope: {cpsRule: '='}
        };
    }
    RuleDirective.$inject = [];
    return RuleDirective;
});
