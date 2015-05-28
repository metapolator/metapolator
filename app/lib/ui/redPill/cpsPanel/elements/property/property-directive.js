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
            element.on('click', function(event) {
               if(event.target.classList.contains('display-name')
                        || event.target.classList.contains('display-value'))
                    startEditHandler(event);
            });

            function dragstartHandler(event) {
                if(!event.target.tagName
                        || event.target.tagName.toLowerCase() !== 'mtk-drag-handle')
                    return;

                dragDataService.set('cps/property', [scope.cpsPropertyDict, scope.index]);
                // event.dataTransfer.setData is so broken in chrome that it is unusable
                // however, firefox seems to insist that we set something (it would be
                // useable and useful in firefox btw.)
                event.dataTransfer.setData('cps/property', 'nil');

                element.addClass('dragging');
                event.dataTransfer.setDragImage(element[0], 0, 0);

                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.dropEffect = 'move';
            }

            function dragendHandler(event) {
                element.removeClass('dragging');
                dragDataService.remove('cps/property');
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
