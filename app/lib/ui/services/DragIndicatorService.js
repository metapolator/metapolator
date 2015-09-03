define([
    'metapolator/ui/domStuff'
], function(
    domStuff
) {
    "use strict";

    /**
     * The DragIndicatorService will take care that not to many drag-indicators
     * are shown, even across documents. This is done by using just one
     * html-element per document, the browser allows this to be used just
     * once used in the dom-tree. For the management of multiple drag indicators
     * and documents, this module employs globally unique identifiers.
     */
    function DragIndicatorService() {
        this._indicators = Object.create(null);
    }

    var _p = DragIndicatorService.prototype;

    _p._createIndicator = function(document) {
        var events = {'drop': null, 'dragend': null, 'dragenter': null}
          , indicator = document.createElement('indicator')
          , k
          ;
        Object.defineProperty(events, 'handler', {
            value: removeIndicator.bind(document, indicator)
          , enumerable: false
        });
        for(k in events)
            document.addEventListener(k, events.handler);
        return [
            document
          , indicator
          , events
        ];
    };

    _p.deleteIndicator = function(identifier) {
        var registry = this._indicators[identifier]
          , document, indicator, events, k
          ;
        if(!registry) return;


        document = registry[0];
        indicator = registry[1];
        events = registry[2];
        removeIndicator(indicator);
        for(k in events)
            document.removeEventListener(k, events.handler);
        delete this._indicators[identifier];
    };

    _p._getIndicator = function(identifier, document) {
        var registry = this._indicators[identifier];
        if(registry && registry[0] !== document) {
            // clean up
            this.deleteIndicator();
            registry = undefined;
        }
        if(!registry)
            // build or rebuild
            this._indicators[identifier] = registry = this._createIndicator(document);
        return registry[1];
    };

    function removeIndicator(indicator, event) {
        if(event && event.type === 'dragenter' && event.defaultPrevented)
            // otherwise remove the indicator, because there is no
            // target if !event.defaultPrevented
            return;

        if(indicator.parentElement)
            indicator.parentElement.removeChild(indicator);
    }

    _p.insertIndicator = function(id, element, position) {
        var document = element.ownerDocument
          , indicator = this._getIndicator(id, document)
          ;
        domStuff.insert(element, position, indicator);

    };

    _p.hideIndicator = function(identifier) {
        var registry = this._indicators[identifier];
        if(registry)
            removeIndicator(registry[1]);
    };

    return DragIndicatorService;
});
