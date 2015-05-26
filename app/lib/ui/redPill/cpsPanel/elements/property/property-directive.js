define([
    'angular'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , 'require/text!./property.tpl'
    ], function(
    angular
  , helpers
  , template
) {
    "use strict";

    function PropertyDirective(dragDataService) {
        function link(scope, element, attrs) {
            var startEditHandler = helpers.handlerDecorator(
                                        scope,scope.startEdit, true, true);
            element.on('dblclick', function(event) {
               if(event.target.classList.contains('display-name')
                    || event.target.classList.contains('display-value'))
                    startEditHandler(event);
            });

            function dragstartHandler(event) {
                var dragDataKey = dragDataService.set([scope.cpsPropertyDict, scope.index]);
                event.dataTransfer.setData('cps/property', dragDataKey);
                event.dataTransfer.addElement(element[0]);

                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.dropEffect = 'move';
                element.addClass('dragging');
            }
            function dragendHandler(event) {
                element.removeClass('dragging');
                dragDataService.remove(event.dataTransfer.getData('cps/property'));
            }
            element.on('dragstart', dragstartHandler);
            element.on('dragend', dragendHandler);
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'PropertyController'
          , replace: false
          , template: template
          , scope: {cpsPropertyDict: '=', property: '=', index: '=', edit: '='}
          , link: link
        };
    }
    PropertyDirective.$inject = ['dragDataService'];
    return PropertyDirective;
});
