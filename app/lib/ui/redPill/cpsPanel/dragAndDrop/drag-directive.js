define([
    'metapolator/errors'
  , 'angular'
    ], function(
    errors
  , angular
) {
    "use strict";

    var UISetupError = errors.UISetup;

    /**
     * used like this
     * <a-tag
     *      mtk-drag="cps/property"
     *      mtk-drag-data="[controller.cpsPropertyDict, index]"
     * ></a-tag>
     *
     */
    function DragDirective(dragDataService) {
        function link(scope, element, attrs) {
            var dragDataType = attrs.mtkDrag// like: 'cps/property'
              , dragData = scope.$eval(attrs.mtkDragData)
              ;
            if(!dragDataType)
                throw new UISetupError('Drag data-type is missing please use '
                            +'the mtk-drag="{type: \'my/datatype\', data: [my, data]" attribute.');

            if(!dragData)
                throw new UISetupError('Drag data is missing please use '
                            +'the mtk-drag="{type: \'my/datatype\', data: [my, data]" attribute.');

            function dragstartHandler(event) {
                // TODO: what if we don't want to use a 'mtk-drag-handle' but instead the
                // element itself?
                if(!event.target.tagName
                        || event.target.tagName.toLowerCase() !== 'mtk-drag-handle')
                    return;

                event.stopPropagation();
                dragDataService.set(dragDataType, dragData);
                // event.dataTransfer.setData is so broken in chrome that it is unusable
                // however, firefox seems to insist that we set something (it would be
                // useable and useful in firefox btw.)
                event.dataTransfer.setData(dragDataType, 'nil');

                element.addClass('dragging');
                event.dataTransfer.setDragImage(element[0], 0, 0);

                // TODO: if anything else is desired this needs a configuration
                // via directives.
                event.dataTransfer.effectAllowed = 'move';
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
            restrict: 'A' // only matches attribute names
          , link: link
        };
    }
    DragDirective.$inject = ['dragDataService'];
    return DragDirective;
});
