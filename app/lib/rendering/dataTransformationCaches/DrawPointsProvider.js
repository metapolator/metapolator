define([
    'metapolator/errors'
  , './_MOMDataTransformationCache'
  , './pens/RecordingAndComparingPointPen'
  , 'ufojs/tools/pens/TransformPointPen'
  , 'ufojs/tools/pens/PointToSegmentPen'
  , 'metapolator/rendering/glyphBasics'
], function(
    errors
  , Parent
  , RecordingAndComparingPointPen
  , TransformPointPen
  , PointToSegmentPen
  , glyphBasics
) {
    "use strict";
    var ValueError = errors.Value
      , KeyError = errors.Key
      , applyGlyph = glyphBasics.applyGlyph
      ;

    /**
     * The methods of renderer should have the signature: (momGlyph, pointPen);
     * The results of rendering are cached in a RecordingAndComparingPointPen
     *
     * Note that `glyph` and `component` are not rendered by renderer
     * even if renderer defines them
     *
     * var item = myDrawPointsProvider.get(momNode [, callback, firstArgOfCallback])
     * var pointPen = MyCoolPointPen()
     *
     * item.value.drawPoints(pointPen);
     *
     * // When the path changes callback will be called:
     * callback(firstArgOfCallback, _channel, eventData);
     * // you can ignore _channel, eventData is probably always: {type: 'points-changed'}
     * // so when this event fires it's good when you have `item` around
     * // the you can draw it again
     * item.value.drawPoints(pointPen);
     *
     * // when done, do this:
     * item.destroy()
     */
    function DrawPointsProvider(renderer) {
        Parent.call(this);
        this._renderer = renderer;
        this._schedulingTimeout = 5;
    }

    var _p = DrawPointsProvider.prototype = Object.create(Parent.prototype);
    _p.constructor = DrawPointsProvider;

    _p.supports = function(type) {
        return type === 'glyph' || type === 'component' || type in this._renderer;
    };

    _p._drawPointsGlyphChild = function (item, pen) {
        item.recorder.drawPoints(pen);
    };

    _p._drawPointsComponent = function (item, pen) {
        var tPen = new TransformPointPen(pen, item.transformation);
        item.subscription.value.drawPoints(tPen);
    };

    _p._drawPointsGlyph = function (item, pen) {
        var subscriptions = item.subscriptions
          , i, l
          ;
        for(i=0,l=subscriptions.length;i<l;i++)
            subscriptions[i].value.drawPoints(pen);
    };

    /**
     * Used for both glyph and component, because they use this service
     * recursiveley.
     */
    _p._childUpdated = function(item, _channel, _eventData) {
        item.childUpdated = true;
        this._requestUpdate(item.mom);
    };

    _p._revokeItems = function(items) {
        var i,l;
        for(i=0,l=items.length;i<l;i++)
            items[i].destroy();
    };

    _p._componentUpdate = function(item) {
        var oldTransformation = item.transformation
          , changed, componentGlyph
          ;
        item.transformation = item.mom.getComputedStyle().get( 'transformation' );
                  // If child updated this changed in any case
        changed = item.childUpdated
                    || !oldTransformation // only initially
                    || !item.transformation.cmp(oldTransformation);

        // reset the flag
        item.childUpdated = false;

        // Currently we won't get noticed when baseGlyphName changed.
        // Another case woll be when componentGlyph ccan cease to
        // exist, which is leagal for a component, to reference a
        // non existant glyph.
        if(item.glyphName !== item.mom.baseGlyphName) {
            // so this happens yet only initially once
            item.glyphName = item.mom.baseGlyphName;
            changed = true;
            if(item.subscription)
                item.subscription.destroy();
            item.subscription = null;
            // may not exist (that's legal in UFO)
            componentGlyph = item.mom.master.query('glyph#' + item.glyphName);
            if(componentGlyph) {
                item.subscription = this.get(componentGlyph, [this, '_childUpdated'], item);
            }
        }
        if(changed)
            return {type: 'points-changed'};
    };

    _p._glyphUpdate = function(item) {
        // If a child updated this changed in any case
        var changed = item.childUpdated;
        item.childUpdated = false;
        // No need to update on glyph "CPS-change", because
        // all the influences that change outlines are covered by the
        // child element listeners. The glyph itself does not draw
        // anything to the canvas.
        if(changed)
            return {type: 'points-changed'};
    };

    _p._glyphChildUpdate = function(item) {
        var oldCommands = item.recorder ? item.recorder.getCommands() : false
          , rollbackRecorder = item.recorder
          , event
          ;
        item.recorder = new RecordingAndComparingPointPen(oldCommands || []);

        try {
            // duck typing a "glyph" for the standard drawing function
            // NOTE: if item.mom.type is not registered there,
            // nothing will be drawn!
            // drawPoints ...
            applyGlyph(this._renderer, {children: [item.mom]}, item.recorder);
        }
        catch(e) {
            // FIXME:
            console.warn('Drawing MOM Node', item.mom.particulars, 'failed with ' + e, e.stack);
            if(e instanceof KeyError)
                console.info('KeyError means usually that a property definition in the CPS is missing');
            console.info('The user should get informed by the UI!');

            // attempt to fail gracefully
            item.recorder = rollbackRecorder || new RecordingAndComparingPointPen([]);;
            rollbackRecorder.changed = false;
        }

        if(item.recorder.changed || !oldCommands)
            // if not this.recorder.changed we still want to create
            // the event if this was the first run of update. This means
            // the item is 'empty' To enable proper initialization.
            return {type: 'points-changed'};
    };

    _p._initComponent = function(item) {
        item.glyphName = null;
        item.subscription = null;
        item.transformation = null;
        item.childUpdated = false;
        item.drawPointsExport = this._drawPointsComponent.bind(this, item);
        item.update = this._componentUpdate.bind(this, item);
    };

    _p._initGlyph = function(item) {
        var children = item.mom.children
          , child, i, l
          , subscription, subscriptions
          ;
        item.subscriptions = subscriptions = [];
        item.childUpdated = false;

        // TODO: (when we do MOM manipulation)
        // ComponentGlyph.on('mom-change') ... is not yet available.
        // Things that don't happen yet but will happen in the future:
        // Need to update if glyph ceases to exist.
        // Need to update if glyph changes it's contents,
        // i.e. more or less penstrokes etc.
        for(i=0,l=children.length;i<l;i++) {
            child = children[i];
            if(!this.supports(child.type))
                continue;
            subscription = this.get(child, [this, '_childUpdated'], item);
            item.subscriptions.push(subscription);
        }
        item.drawPointsExport = this._drawPointsGlyph.bind(this, item);
        item.update = this._glyphUpdate.bind(this, item);
    };

    _p._initGlyphChild = function(item) {
        item.recorder = null;
        item.drawPointsExport = this._drawPointsGlyphChild.bind(this, item);
        item.update = this._glyphChildUpdate.bind(this, item);
    };

    /**
     * Return an object with one public method `update` which is called
     * when the momNode triggers its "CPS-change" event.
     */
    _p._itemFactory = function (momNode) {
        if(!this.supports(momNode.type))
            throw new ValueError('Node type not supported :' + momNode);


        var item = {
            mom: momNode
          , drawPointsExport: null
          , update: null
        };

        if(momNode.type === 'glyph')
            this._initGlyph(item);
        else if(momNode.type === 'component')
            this._initComponent(item);
        else
            this._initGlyphChild(item);

        // initialize
        item.update();
        return item;
    };

    /**
     * Clean up all the state that _itemFactory or the operation of the item created.
     * The item will be deleted and not be called again;
     */
    _p._destroyItem = function (item) {
        if(item.subscription)
            item.subscription.destroy();
        if(item.subscriptions)
             this._revokeItems(item.subscriptions);
        // nothing else to do: the MOM Node subscription will be
        // destroyed by the super class
    };

    /**
     * Return an object upon which a user of this service will base it's operation;
     * see _p.get
     */
    _p._getUserItem = function(item) {
        // we really need only this method to be exported
        return {
            drawPoints: item.drawPointsExport
        };
    };

    return DrawPointsProvider;
});
