define([
    'metapolator/errors'
  , './_MOMDataTransformationCache'
  , 'ufojs/tools/pens/PointToSegmentPen'
  , './pens/SVGPathsPen'
], function(
    errors
  , Parent
  , PointToSegmentPen
  , SVGPen
) {
    "use strict";
    var svgns = 'http://www.w3.org/2000/svg'
      , xlinkns = 'http://www.w3.org/1999/xlink'
      ;

    /**
     * Renders SVG <path> elements to a defs item and then utilizes
     * SVG <use> elements to distribute the contents. When the path changes
     * the content of the <use> element is auto updated. No interaction
     * required.
     *
     * var item = mySVGUsePathsProvider.get(momNode [, callback, firstArgOfCallback])
     *
     * var useDomElement = item.value;
     *
     * // When the path changes callback will be called:
     * callback(firstArgOfCallback, _channel, eventData);
     * // you can ignore _channel, eventData is probably always: {type: 'updated'};
     * // But usually you shouldn't have to do anything on update, so you
     * // better don't listen
     *
     *
     * // when with using the <use> element do this:
     * item.destroy()
     *
     *
     * `drawService` should return items like this:
     * var item = drawService.get(momNode, callback, userData);
     * item.value.drawPoints(pointPen);
     *
     * renderComponentsOfGlyphs: don't render components, seven if drawService
     * supports this. (FIXME: this is kind of ugly, maybe we can find a better
     * way to do so.)
     *
     */
    function SVGUsePathsProvider(svg, svgIdNamespace, drawService, renderComponentsOfGlyphs) {
        Parent.call(this);
        this._subscribeToMOM = false;
        this._drawService = drawService;
        this._renderComponentsOfGlyphs = renderComponentsOfGlyphs;
        this._doc = svg.ownerDocument;
        this._requestUpdateExport = this._requestUpdate.bind(this);
        // A small number in ms, to allow pending changes to come in.
        // However, we don't want to wait `long`, because this will be
        // perceived as pure waiting time and new events will reset the
        // timer.
        this._schedulingTimeout = 0;

        this._svgIdNamespace = svgIdNamespace;
        this._glyphContainer = this._doc.createElementNS(svgns, 'defs');
        svg.appendChild(this._glyphContainer);
    }

    var _p = SVGUsePathsProvider.prototype = Object.create(Parent.prototype);
    _p.constructor = SVGUsePathsProvider;


    _p._revokeItems = function(items) {
        var i,l;
        for(i=0,l=items.length;i<l;i++)
            items[i].destroy();
    };

    /**
     * Returns "eventData" if users needs to be informed of something.
     * {type: '{event-name}'}
     */
    _p._glyphItemUpdate = function(item) {
        /*global console*/
        var path = item.element.ownerDocument.createElementNS(svgns, 'g')
          , svgPen = new SVGPen(path, {})
          , pen = new PointToSegmentPen(svgPen)
          , oldSubscriptions, subscription
          , i,l,children,child
          , glyphName,transformation
          ;

        while(item.element.lastChild)
            item.element.removeChild(item.element.lastChild);

        oldSubscriptions = item.subscriptions;
        item.subscriptions = [];

        // This is a catch all situation. Whatever calls update: the glyph
        // gets re-rendered. However, we don't have mom-change events yet.
        children = item.mom.children;
        for(i=0,l=children.length;i<l;i++) {
            child = children[i];
            if(!this._renderComponentsOfGlyphs && child.type === 'component')
                continue;
            if(!this._drawService.supports(child.type))
                continue;
            // update.
            subscription = this._drawService.get(child, [this, '_requestUpdate'], item.mom);
            item.subscriptions.push(subscription);
            subscription.value.drawPoints(pen);
        }

        // rewoke after getting the new subscriptions, so that we don't
        // prune caches that still do apply
        this._revokeItems(oldSubscriptions);
        item.element.appendChild(path);
        return {type: 'updated'};
    };

    _p._itemUpdate = function(item) {
        var path = item.element.ownerDocument.createElementNS(svgns, 'g')
          , svgPen = new SVGPen(path, {})
          , pen = new PointToSegmentPen(svgPen)
          ;

        item.subscription.value.drawPoints(pen);
        while(item.element.lastChild)
            item.element.removeChild(item.element.lastChild);
        item.element.appendChild(path);
        return {type: 'updated'};
    };

    _p._itemFactory = function(momNode) {
        var id = this._svgIdNamespace + momNode.nodeID
          , element = this._doc.createElementNS(svgns, 'g')
          , item = {
                mom: momNode
              , element: element
                // need this still ?
              , subscriptions: null
              , subscription: null
              , update: null
            }
          ;

        element.setAttribute('id', id);
        this._glyphContainer.appendChild(element);

        if(item.mom.type === 'glyph') {
            item.subscriptions = [];
            item.update = this._glyphItemUpdate.bind(this, item);
            // only for glyphs
            item.subscriptionId = item.mom.on('CPS-change', [this, '_requestUpdate'], item.mom);
        }
        else {
            item.subscription = this._drawService.get(item.mom, [this, '_requestUpdate'], item.mom);
            item.update = this._itemUpdate.bind(this, item);
        }
        return item;
    };

    _p._destroyItem = function (item) {
        if(item.subscriptions)
            this._revokeItems(item.subscriptions);
        if(item.subscription)
            item.subscription.destroy();
        if(item.subscriptionId)
            item.mom.off(item.subscriptionId);
        // delete the <g> item
        item.element.parentElement.removeChild(item.element);
    };

    _p._getUserItem = function(item) {
        var use = this._doc.createElementNS(svgns, 'use');
        use.setAttributeNS(xlinkns, 'href', '#' + item.element.id);
        return use;
    };

    return SVGUsePathsProvider;
});
