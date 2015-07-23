define([
    'angular'
  , 'metapolator/ui/domStuff'
  , 'require/text!./newItem.tpl'
    ], function(
    angular
  , domStuff
  , template
) {
    "use strict";

    function NewItemDirective() {
        function link(scope, element, attrs, ctrl) {
            var placeholder = element[0].getElementsByClassName('new-item-placeholder')[0];
            function changeElement() {
                var tag, form;

                // remove the old one, if any
                // $destroy the old scope, if not happening automatically

                if(!scope.element)
                    // close this?
                    return;

                tag = ctrl.elements[scope.element];
                form = element[0].ownerDocument.createElement(tag);
                form.textContent = 'to be a: ' + tag;
                domStuff.insert(placeholder, 'append', form);
                $compile(angular.element(uiElement))(form);
            }

            scope.changeElement = changeElement;
        }
        return {
            restrict: 'E' // only matches element names
          , controller: 'NewItemController'
          , replace: false
          , template: template
          , scope: {}
          , controllerAs: 'controller'
          , bindToController: true
          , link: link
        };
    }
    NewItemDirective.$inject = [];
    return NewItemDirective;
});
