define([
    'errors'
  , 'metapolator/ui/domStuff'
], function(
    errors
  , domStuff
) {
    "use strict";

    var ValueError = errors.Value;

    function insertBefore(newElement, referenceElement) {
        referenceElement.parentElement.insertBefore(newElement, referenceElement);
    }

    function insertAfter(newElement, referenceElement) {
        // there is no element.insertAfter() in the DOM
        if(!referenceElement.nextSibling)
            referenceElement.parent.appendChild(newElement);
        referenceElement.parentElement.insertBefore(newElement, referenceElement.nextSibling);
    }
    function insert(element, position, child){
        switch(position) {
            case 'append':
                element.appendChild(child);
                break;
            case 'prepend':
                insertBefore(child, element.firstChild);
                break;
            case 'before':
                insertBefore(child, element);
                break;
            case 'after':
                insertAfter(child, element);
                break;
            default:
                throw new ValueError('Unknown position keyword "'+position+'".');
        }
    }

    return {
        insertBefore: insertBefore
      , insertAfter: insertAfter
      , insert: insert

    };
});
