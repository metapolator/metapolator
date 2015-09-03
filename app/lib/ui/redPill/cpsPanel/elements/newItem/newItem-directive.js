define([
    'angular'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , 'metapolator/ui/domStuff'
  , 'require/text!./newItem.tpl'
    ], function(
    angular
  , helpers
  , domStuff
  , template
) {
    "use strict";

    function NewItemDirective($compile) {
        function link(scope, element, attrs, ctrl) {
            var placeholder = element[0].getElementsByClassName('new-item-placeholder')[0]
              , input = element[0].getElementsByClassName('input')[0]
              , timer
              ;
            function getChild() {
                return placeholder.firstElementChild;
            }

            function getChildScope() {
                var child = getChild();
                if(!child) return;
                return angular.element(child).isolateScope();
            }

            function destroyChild() {
                var  child, childScope;
                // remove the old one, if any
                childScope = getChildScope();
                if(childScope)
                    childScope.$destroy();
                // $destroy the old scope, if any
                child = getChild();
                if(child)
                    child.parentElement.removeChild(child);
            }

            function destroy() {
                scope.$destroy();
                element[0].parentElement.removeChild(element[0]);
            }
            scope.destroy = destroy;

            function checkFocusRemove() {
                var childScope;
                if(helpers.hasFocus(input))
                    return;
                childScope = getChildScope();
                if(childScope && childScope.hasFocus())
                    return;
                destroy();
            }

            // If this and the child lost focus end this
            timer = new helpers.Timer(checkFocusRemove);

            input.focus(); // important! we start with having focus
            angular.element(input)
                // when an element gets focuss
                .on('focus', timer.cancel)
                // when an element loses focus
                .on('blur', timer.start)
                ;

            scope.$on('finalize', function(event) {
                event.stopPropagation();
                // The user decided to load another form
                // so we don't allow to finish this edit and just throw
                // away the old form. No matter what was entered before.
                if(helpers.hasFocus(input))
                    event.preventDefault();
            });
            scope.$on('destroy', function(event) {
                event.stopPropagation();
                destroy();
            });

            function changeElement() {
                var tag, form;

                destroyChild();

                if(!scope.element)
                    // close this?
                    return;
                tag = ctrl.elements[scope.element];
                form = element[0].ownerDocument.createElement(tag);
                form.setAttribute('index', ctrl.index);
                form.textContent = 'to be a: <' + tag + '>';
                domStuff.insert(placeholder, 'append', form);
                $compile(angular.element(form))(scope);
            }

            scope.changeElement = changeElement;
            changeElement();
        }
        return {
            restrict: 'E' // only matches element names
          , controller: 'NewItemController'
          , replace: false
          , template: template
          , scope: {index: '='}
          , controllerAs: 'controller'
          , bindToController: true
          , link: link
        };
    }
    NewItemDirective.$inject = ['$compile'];
    return NewItemDirective;
});
