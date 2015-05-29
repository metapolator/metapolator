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
                                        scope,scope.startEdit, true, true)
                , dragDataType = 'cps/property'
                ;
            element.on('click', function(event) {
               if(event.target.classList.contains('property-name')
                        || event.target.classList.contains('property-value'))
                    startEditHandler(event);
            });

            function dragstartHandler(event) {
                if(!event.target.tagName
                        || event.target.tagName.toLowerCase() !== 'mtk-drag-handle')
                    return;

                dragDataService.set(dragDataType, [scope.cpsPropertyDict, scope.index]);
                // event.dataTransfer.setData is so broken in chrome that it is unusable
                // however, firefox seems to insist that we set something (it would be
                // useable and useful in firefox btw.)
                event.dataTransfer.setData(dragDataType, 'nil');

                element.addClass('dragging');
                event.dataTransfer.setDragImage(element[0], 0, 0);

                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.dropEffect = 'move';
            }

            // Because on a succesful drop the element is removed from the
            // DOM, when performing a move at least. Then we never
            // receive a dragend event. Thus cleaning up must happen here
            // and in the drop handler.
            // Making the execution of the move async would also help.
            function dragendHandler(event) {
                element.removeClass('dragging');
                dragDataService.remove(dragDataType);
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
