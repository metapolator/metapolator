define([
    'metapolator/errors'
  , './_MOMDataTransformationCache'
  , 'metapolator/rendering/glyphBasics'
], function(
    errors
  , Parent
  , glyphBasics
) {
    "use strict";

    var ValueError = errors.Value
      , KeyError = errors.Key
      , svgns = 'http://www.w3.org/2000/svg'
      , xlinkns = 'http://www.w3.org/1999/xlink'
      , applyGlyph = glyphBasics.applyGlyph
      ;

    /**
     * The methods of renderer will be called like this:
     * drawFunction(momNode, domElement)
     * and they are expected to append child elements to `domElement`
     * `domElement` is an SVG <g>-element.
     */
    function SVGUseCustomProvider(svg, idPrefix, renderer) {
        Parent.call(this);
        this._doc = svg.ownerDocument;
        this._renderer = renderer;
        // A small number in ms, to allow pending changes to come in.
        // However, we don't want to wait `long`, because this will be
        // perceived as pure waiting time and new events will reset the
        // timer.
        this._schedulingTimeout = 0;

        this._glyphIDPrefix = idPrefix;
        this._glyphContainer = this._doc.createElementNS(svgns, 'defs');
        svg.appendChild(this._glyphContainer);
    }

    var _p = SVGUseCustomProvider.prototype = Object.create(Parent.prototype);
    _p.constructor = SVGUseCustomProvider;

    _p.supports = function(type) {
        return type === 'glyph' || type in this._renderer;
    };

    _p._itemUpdate = function(item, eventData) {
        var glyph;
        while(item.element.lastChild)
            item.element.removeChild(item.element.lastChild);
        try {
            // duck typing a "glyph" for the standard drawing function
            // NOTE: if item.mom.type is not registered there,
            // nothing will be drawn!
            // drawPoints ...
            glyph = item.mom.type === 'glyph'
                        ? item.mom
                        : {children: [item.mom]}
                        ;
            applyGlyph(this._renderer, glyph, item.element);
        }
        catch(e) {
            console.warn('Drawing MOM Node', item.mom.particulars, 'failed with ' + e, e.stack);
            if(e instanceof KeyError)
                console.info('KeyError means usually that a property definition in the CPS is missing');
            console.info('The user should get informed by the UI!');
        }
    };

    _p._itemFactory = function(momNode) {
        var id, element, item;
        if(!this.supports(momNode.type))
            throw new ValueError('Node type not supported :' + momNode);



        id = this._glyphIDPrefix + momNode.nodeID;
        element = this._doc.createElementNS(svgns, 'g');

        element.setAttribute('id', id);
        this._glyphContainer.appendChild(element);

        item = {
            element: element
          , mom: momNode
          , update: null
        };
        item.update = this._itemUpdate.bind(this, item);

        return item;
    };

    _p._destroyItem = function (item) {
        // delete the <g> item
        item.element.parentElement.removeChild(item.element);
    };

    _p._getUserItem = function(item) {
        var use = this._doc.createElementNS(svgns, 'use');
        use.setAttributeNS(xlinkns, 'href', '#' + item.element.id);
        return use;
    };

    return SVGUseCustomProvider;
});
