define([
    'angular'
    ], function(
    angular
) {
    "use strict";

    var allowedTags = ['mtk-cps-rule', 'mtk-cps-namespace-collection'
                            , 'mtk-cps-import-collection', 'mtk-cps-comment'
                            , 'mtk-cps-generic'
                        ];

    function findElement(allowedTags, element, parent) {
        var children = parent.children
          , allowedParents = new Set()
          , i, l, child
          , _allowedTags = new Set(allowedTags.map(function(s){return s.toUpperCase();}))
          , current
          ;
        for(i=0,l=children.length;i<l;i++) {
            child = children[i];
            if(child.tagName.toLowerCase() === 'mtk-cps-collection-li')
                allowedParents.add(child);
        }

        if(allowedParents.has(element))
            current = element.firstElementChild;
        else
            current = element;

        do {
            if(_allowedTags.has(current.tagName) && allowedParents.has(current.parentElement))
                return current;
        } while((current = current.parentElement));
        return undefined;
    }

    function getPositionReference(empty, element, container) {
        return empty
            ? container
            : element.parentElement
            ;
    }


    return {
        allowedTags: allowedTags
      , findElement: findElement.bind(null, allowedTags)
      , getPositionReference: getPositionReference
    };
});
