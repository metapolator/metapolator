define([
    'angular'
  , 'require/text!./importCollection.tpl'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
    ], function(
    angular
  , template
  , helpers
) {
    "use strict";

    function NewImportCollectionDirective() {
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

                // if the element lost focus run scope.finalize
                timer = new helpers.Timer(function() {
                    var event = scope.$emit('finalize')
                      , promise
                      ;
                    // if the parent "new-item-directive" has focus, because
                    // the user clicked the select element, the new-item
                    // directive would execute event.preventDefault() and
                    // thus stop this code to finalize the transaction.
                    if(event.defaultPrevented)
                        return;
                    // returns a promise if still in waiting mode
                    promise = ctrl.finalize();
                    if(promise)
                        promise.then(scope.$emit.bind(scope, 'destroy'));
                    else
                        scope.$emit('destroy');
                });

                angular.element(input)
                   // when an element gets focuss
                   .on('focus', timer.cancel)
                   // when an element loses focus
                   .on('blur', timer.start)
                   ;
            };
            ctrl.startEdit();
        }
        return {
            restrict: 'E' // only matches element names
          , controller: 'NewImportCollectionController'
          , replace: false
          , template: template
          , scope: {index: '='}
          , controllerAs: 'ctrl'
          , bindToController: true
          , link: link
        };
    }
    NewImportCollectionDirective.$inject = [];
    return NewImportCollectionDirective;
});
