define([
    'angular'
  , 'require/text!./comment.tpl'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , './comment-directive'
    ], function(
    angular
  , template
  , helpers
  , CommentDirective
) {
    "use strict";

    var getFormatClass = CommentDirective.getFormatClass;

    function NewCommentDirective() {
        function link(scope, element, attrs, ctrl) {
            element.on('dblclick', helpers.stopPropagation);

            scope.getFormatClass = getFormatClass;

            scope.hasFocus = function() {
                var input = element[0].getElementsByClassName('input')[0]
                return helpers.hasFocus(input);
            }

            scope.initEdit = function() {
                var input = element[0].getElementsByClassName('input')[0]
                  , timer
                  ;
                input.focus();

                // if the element lost focus run ctrl.finalize
                timer = new helpers.Timer(function() {
                    var event = scope.$emit('finalize');
                    // if the parent "new-item-directive" has focus, because
                    // the user clicked the select element, the new-item
                    // directive would execute event.preventDefault() and
                    // thus stop this code to finalize the transaction.
                    if(event.defaultPrevented)
                        return;
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
          , controller: 'NewCommentController'
          , replace: false
          , template: template
          , scope: {index: '='}
          , controllerAs: 'ctrl'
          , bindToController: true
          , link: link
        };
    }
    NewCommentDirective.$inject = [];
    return NewCommentDirective;
});
