define([
    'angular'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , 'require/text!./editProperty.tpl'
    ], function(
    angular
  , helpers
  , template
) {
    "use strict";

    function EditPropertyDirective() {
        function link(scope, element, attrs) {
            element.on('click', helpers.stopPropagation);
            element.on('dblclick', helpers.stopPropagation);

            var name = element[0].getElementsByClassName('property-name')[0]
              , value = element[0].getElementsByClassName('property-value')[0]
              , timer
              ;

            if(scope.edit.focus === 'name')
                // focus the first input element on init
                name.focus();
            else
                value.focus();

            // if both elements lost focus run scope.finalize
            timer = new helpers.Timer(function(){
                scope.finalize();
                scope.$apply();
            });

            angular.element([name, value])
                   // when an element gets focuss
                   .on('focus', timer.cancel)
                   // when an element loses focus
                   .on('blur', timer.start)
                   ;
        }

        return {
            restrict: 'E' // only matches element names
          , replace: false
          , template: template
          , link: link
        };
    }
    EditPropertyDirective.$inject = [];
    return EditPropertyDirective;
});
