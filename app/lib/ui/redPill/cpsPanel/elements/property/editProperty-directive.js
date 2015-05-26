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

            var input = element[0].getElementsByTagName('input')[0]
              , textarea = element[0].getElementsByTagName('textarea')[0]
              , timer
              ;

            if(scope.edit.focus === 'name')
                // focus the first input element on init
                input.focus();
            else
                textarea.focus();

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
          , replace: false
          , template: template
          , link: link
        };
    }
    EditPropertyDirective.$inject = [];
    return EditPropertyDirective;
});
