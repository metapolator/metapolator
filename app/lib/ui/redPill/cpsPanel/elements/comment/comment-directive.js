define([
    'angular'
  , 'require/text!./comment.tpl'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
    ], function(
    angular
  , template
  , helpers
) {
    "use strict";

    function CommentDirective() {
        function link(scope, element, attrs, ctrl) {
            element.on('dblclick', helpers.stopPropagation);

            scope.initEdit = function() {
                var input = element[0].getElementsByClassName('input')[0]
                  , timer
                  ;
                input.focus();

                // if the element lost focus run scope.finalize
                timer = new helpers.Timer(function() {
                    ctrl.finalize();
                    scope.$apply();
                });

                angular.element(input)
                   // when an element gets focuss
                   .on('focus', timer.cancel)
                   // when an element loses focus
                   .on('blur', timer.start)
                   ;
            };
            scope.initDisplay = function() {
                var display = element[0].getElementsByClassName('display');
                angular.element(display).on('click', helpers.handlerDecorator(
                          scope, ctrl.startEdit.bind(ctrl), true, true));
            }
        }
        return {
            restrict: 'E' // only matches element names
          , controller: 'CommentController'
          , replace: false
          , template: template
          , scope: {comment: '=', index: '=', mtkElementTools: '='}
          , controllerAs: 'ctrl'
          , bindToController: true
          , link: link
        };
    }
    CommentDirective.$inject = [];
    return CommentDirective;
});
