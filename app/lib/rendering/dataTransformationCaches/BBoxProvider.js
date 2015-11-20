define([
    './_MOMDataTransformationCache'
  , 'ufojs/tools/pens/PointToSegmentPen'
  , 'ufojs/tools/pens/BoundsPen'
], function(
    Parent
  , PointToSegmentPen
  , BoundsPen
) {
    "use strict";

    /**
     * var item = myBBoxProvider.get(momNode [, callback, firstArgOfCallback])
     * var bbox = item.value.getBBox(); // array of 4 numbers: [num, num, num, num]
     *
     * // When the bounding box changes callback will be called:
     * callback(firstArgOfCallback, _channel, eventData);
     * // you can ignore _channel, eventData is probably always: {type: 'bbox-changed'}
     * // so when this event fires it's good when you have `item` around
     *
     * // when done, do this:
     * item.destroy()
     */
    function BBoxProvider(drawPointsProvider) {
        // it is not necessary yet
        var subscribeToMOMItems = false;
        Parent.call(this, subscribeToMOMItems);
        this._drawPointsProvider = drawPointsProvider;
    }

    var _p = BBoxProvider.prototype = Object.create(Parent.prototype);

    _p.supports = function(type) {
        return this._drawPointsProvider.supports(type);
    };

    _p._pointsChanged = function(item) {
        this._requestUpdate(item.mom);
    };

    _p._itemUpdate = function(item) {
        var oldBBox = item.bBox
          , bBoxPen = new PointToSegmentPen( new BoundsPen({}) )
          , i,l
          ;
        item.subscription.value.drawPoints(bBoxPen);

        // not sure about this default viewbox
        item.bBox = bBoxPen.pen.getBounds() || [0,0,0,0];
        if(!oldBBox || item.bBox.join(',') !== oldBBox.join(','))
            return {type: 'bbox-changed'};
    };

    _p._getBBoxExport = function(item) {
        return item.bBox.slice();
    };

    _p._itemFactory = function (momNode) {
        var item
          , i,l, children
          ;

        item = {
            mom: momNode
          , subscription: null
          , bBox: null
          , getBBoxExport: null
          , update: null
        };

        item.subscription = this._drawPointsProvider.get(item.mom, [this, '_pointsChanged'], item);

        item.getBBoxExport = this._getBBoxExport.bind(this, item);
        item.update = this._itemUpdate.bind(this, item);
        item.update();
    };

    _p._destroyItem = function (item) {
        item.subscription.destroy();
    };

    _p._getUserItem = function(item) {
        return {
            getBBox: item.getBBoxExport
        };
    };

    return BBoxProvider;
});
