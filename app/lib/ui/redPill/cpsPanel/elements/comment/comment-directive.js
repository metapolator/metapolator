define([
    'angular'
  , 'require/text!./comment.tpl'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , 'bower_components/marked/lib/marked'
    ], function(
    angular
  , template
  , helpers
  , marked
) {
    "use strict";

    function isMarkdown(text) {
        return text.indexOf('#md') === 0;
    }

    function getFormatClass(text) {
        return (isMarkdown(text)
            ? 'format-markdown'
            : 'format-standard'
            );
    }

    function CommentDirective() {
        function link(scope, element, attrs, ctrl) {
            element.on('dblclick', helpers.stopPropagation);

            scope.getFormatClass = getFormatClass;

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
                var display = element[0].getElementsByClassName('display')[0]
                  , text = ctrl.comment.value
                  ;
                angular.element(display).on('click', helpers.handlerDecorator(
                          scope, ctrl.startEdit.bind(ctrl), true, true));

                console.log(display, text, isMarkdown(text))
                if(isMarkdown(text))
                    display.innerHTML = marked(text.slice('#md'.length));
                else
                    display.textContent = text;
            };
        }
        return {
            restrict: 'E' // only matches element names
          , controller: 'CommentController'
          , replace: false
          , template: template
          , scope: {comment: '=item', index: '=', mtkElementTools: '='}
          , controllerAs: 'ctrl'
          , bindToController: true
          , link: link
        };
    }
    CommentDirective.$inject = [];
    return CommentDirective;
});
