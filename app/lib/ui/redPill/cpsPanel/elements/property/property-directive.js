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
            element.on('click', helpers.stopPropagation);
            element.on('dblclick', helpers.stopPropagation);

            function dragstartHandler(event) {
                console.log(event.type, event);
                var dragDataKey = dragDataService.set([scope.cpsPropertyDict, scope.index]);
                event.dataTransfer.setData('cps/property', dragDataKey);
                event.dataTransfer.addElement(element[0]);

                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.dropEffect = 'move';
                element.addClass('dragging');
            }
            function dragendHandler(event) {
                console.log(event.type, event);
                element.removeClass('dragging');
                dragDataService.remove(event.dataTransfer.getData('cps/property'));
            }
            element.on('dragstart', dragstartHandler);
            element.on('dragend', dragendHandler);

            var input = element[0].getElementsByTagName('input')[0]
              , textarea = element[0].getElementsByTagName('textarea')[0]
              , timer
              ;

            // if both elements lost focus run scope.finalize
            timer = new helpers.Timer(function(){
                scope.finalize();
                scope.$apply();
            });

            angular.element([input, textarea])
                   // when an element gets focuss
                   .on('focus', timer.cancel)
                   // when an element loses focus
                   .on('blur', timer.start)
                   ;
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'PropertyController'
          , replace: false
          , template: template
          , scope: {cpsPropertyDict: '=', property: '=', index: '='}
          , link: link
        };
    }
    PropertyDirective.$inject = ['dragDataService'];
    return PropertyDirective;
});
