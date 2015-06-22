define([
    'require/text!./rename.tpl'
    ], function(
    template
) {
    "use strict";
    function renameDirective() {
        return {
            restrict: 'A',
            controller: 'RenameController',
            scope : {
                model : '=mtkRename'
            },
            replace: false,
            template: template,
            link : function(scope, element, attrs, ctrl) {
                element.bind('dblclick', function(event) {
                    scope.giveRenamingProperties(element[0]);
                });
                
                element.bind('blur', function(event) {
                    scope.finishedRenaming(element[0], element);
                });
                
                element.bind('keypress', function(event) {
                    if (event.which == 13) {
                        scope.finishedRenaming(element[0], element);
                        $(element[0]).blur();
                    }
                });
            }
        };
    }
    renameDirective.$inject = [];
    return renameDirective;
});
