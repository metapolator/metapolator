define([
    'angular'
    ], function(
    angular
) {
    "use strict";

    function findElement(dropElementTags, element, parent) {
        var children = parent.children
          , allowedParents = new Set()
          , i, l, child
          , allowedTags = new Set(dropElementTags.map(function(s){return s.toUpperCase();}))
          , current
          ;
        for(i=0,l=children.length;i<l;i++) {
            child = children[i];
            if(child.tagName.toLowerCase() === 'mtk-cps-collection-li')
                allowedParents.add(child);
        }

        if(allowedParents.has(element))
            current = element.firstChild;
        else
            current = element;

        do {
            if(allowedTags.has(current.tagName) && allowedParents.has(current.parentElement))
                return current;
        } while((current = current.parentElement));
        return undefined;
    }

    function getIndicatorReference(empty, element, container) {
        return element;
    }

    function CollectionDropDirective(DropHelper) {
        function link(_scope, element, attrs) {
                // should be possibly be done with some configuration.
            var scope = element.isolateScope()
              , controller = scope.controller
              , container = element[0]
              , indicatorId = 'cps-drop-indicator'
              , dataTypes = ['cps/rule', 'cps/namespace-collection'
                            , 'cps/comment', 'cps/generic-collection-item'
                            , 'cps/import-collection']
              , dropElementTags = ['mtk-cps-rule', 'mtk-cps-namespace-collection'
                                 /*, 'mtk-cps-import'*/, 'mtk-cps-comment']
              , dropHelper = new DropHelper(
                    findElement.bind(null, dropElementTags)
                  , getIndicatorReference
                  , dataTypes
                  , indicatorId
                  , controller
                  , element[0]
                  , container
                )
              ;

            element.on('dragover', dropHelper.dragoverHandler);
            element.on('drop', dropHelper.dropHandler);
        }

        return {
            restrict: 'A' // only matches element names
          , link:link
        };
    }
    CollectionDropDirective.$inject = ['DropHelper'];
    return CollectionDropDirective;
});
