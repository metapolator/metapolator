define([
    'angular'
  , 'errors'
  , 'require/text!./propertyDict.tpl'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
    ], function(
    angular
  , errors
  , template
  , helpers
) {
    "use strict";

    function findParentElement(element, tagNames, includeInitialElement, parentLimit) {
        var current = includeInitialElement
            ? element
            : element.parentElement
          // _tagNames is a Set of the `tagNames` argument, cast to upper case
          , _tagNames = new Set(// a typed Set::string would be cool here to detect bogus input
                (tagNames instanceof Array
                        ? tagNames
                        // if it was just one name, make it an array
                        : [tagNames]
                ).map(function(s){return s.toUpperCase();})
            )
          ;
        do {
            // don't search above this element
            if(parentLimit && current === parentLimit)
                return undefined;
            if(_tagNames.has(current.tagName))
                return current;
            current = current.parentElement;
        } while(current);
        return undefined;
    }

    /**
     * Find the highest distinct/unambigous parent of element then get the
     * actual child which has one of the tags in dropElementTags.
     * This has the advantage, that also the unambigous parent element
     * counts as a drag over the actual element, not only the children.
     * This is very specific for the structure of the directive. You change
     * the template, this breaks. This breaks, drag and drop behaves wrong.
     */
    function findElement(dropElementTags, element, parentLimit) {
        // This assumes that the structure is an <li>
        // of which the direct child is one of dropElementTags
        // everything above li is has many possible drop targets.
        var li = findParentElement(element, 'li', true, parentLimit)
          , i, l, child
          , needles = new Set(dropElementTags.map(function(s){return s.toUpperCase();}))
          ;
        if(!li)
            return undefined;

        // The li may contain many children, but I expect it to have just one.
        for(i=0,l=li.children.length;i<l;i++) {
            child = li.children[i];
            if(needles.has(child.tagName))
                return child;
        }
        return undefined;
    }

    function getPositionReference(empty, element, container) {
        return empty
            ? container
            : findParentElement(element, 'li', false, container)
            ;
    }

    function PropertyDictDirective(DropHelper) {

        function link(scope, element, attrs, controller) {
            // there is also a dragenter and dragleave event, but they
            // are not necessary for the most simple usage
            var container = element[0].getElementsByClassName('container')[0]
              , indicatorId = 'cps-drop-indicator'
              , dataTypes = ['cps/property', 'cps/comment', 'cps/generic-rule-item']
              , dropElementTags = ['mtk-cps-property', 'mtk-cps-comment']
              , dropHelper = new DropHelper(
                    findElement.bind(null, dropElementTags)
                  , getPositionReference
                  , dataTypes
                  , indicatorId
                  , controller
                  , element[0]
                  , container
                )
              ;

            element.on('dragover', dropHelper.dragoverHandler);
            element.on('drop', dropHelper.dropHandler);

            angular.element(container).on('dblclick', helpers.handlerDecorator(scope,
                            scope.$emit.bind(scope, 'newPropertyRequest'), true, false));
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'PropertyDictController'
          , replace: false
          , template: template
          , scope: { cpsPropertyDict: '=' }
          , bindToController: true
          , controllerAs: 'controller'
          , link: link
        };
    }
    PropertyDictDirective.$inject = ['DropHelper'];
    return PropertyDictDirective;
});
