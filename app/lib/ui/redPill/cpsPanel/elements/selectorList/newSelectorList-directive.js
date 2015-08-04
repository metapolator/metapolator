define([
    'angular'
  , 'require/text!./selectorList.tpl'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
    ], function(
    angular
  , template
  , helpers
) {
    "use strict";

    function NewSelectorListDirective() {
        function link(scope, element, attrs, ctrl) {
            element.on('dblclick', helpers.stopPropagation);

            scope.hasFocus = function() {
                var input = element[0].getElementsByClassName('input')[0];
                return helpers.hasFocus(input);
            };

            scope.initEdit = function() {
                var input = element[0].getElementsByClassName('input')[0]
                  , timer
                  ;
                input.focus();

                timer = new helpers.Timer(function() {
                    var event = scope.$emit('finalize');
                    // if the parent "new-item-directive" has focus, because
                    // the user clicked the select element, the new-item
                    // directive would execute event.preventDefault() and
                    // thus stop this code to finalize the transaction.
                    if(event.defaultPrevented)
                        return;
                    // returns a promise if still in waiting mode
                    ctrl.finalize();
                    scope.$emit('destroy');
                });

                angular.element(input)
                   // when an element gets focuss
                   .on('focus', timer.cancel)
                   // when an element loses focus
                   .on('blur', timer.start)
                   ;
            };
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'NewSelectorListController'
          , replace: false
          , template: template
          , scope: {selectorListHost: '='}
          , bindToController: true
          , controllerAs: 'controller'
          , link: link
        };
    }
    NewSelectorListDirective.$inject = [];
    return NewSelectorListDirective;
});
