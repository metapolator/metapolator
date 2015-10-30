define([
    'metapolator/errors'
  , 'metapolator/models/emitterMixin'
], function(
    errors
  , emitterMixin
) {
    "use strict";

    var svgns = 'http://www.w3.org/2000/svg'
      , KeyError = errors.Key
      , ValueError = errors.Value
      , emitterMixinSetup = {
            stateProperty: '_channel'
          , onAPI: 'on'
          , offAPI: 'off'
          , triggerAPI: '_trigger'
        }
      ;

    function makeLabelText(momNode) {
        var label = [
                momNode.type
              , ':i('+ momNode.parent.find(momNode) +')'
          ]
          , classes = momNode.classes
          , i, l
          ;

        if(momNode.id)
            label.push('#' + momNode.id);

        for(i=0,l=classes.length;i<l;i++)
            label.push('.' + classes[i]);

        // we currently have no better way to show classes of penstroke point
        // because these are not directly represented in the interface.
        // That will change when <center> will be removed an <point> will
        // take over it's duties. (which name will be kept is not decided yet)
        // https://github.com/metapolator/metapolator/issues/323#issuecomment-72224480
        if(momNode.parent.type === 'point')
            label.unshift(makeLabelText(momNode.parent) + ' ');
        return label.join('');
    }

    function setTitle ( momNode, dom ) {
        var label = makeLabelText(momNode)
          , title = dom.ownerDocument.createElementNS(svgns, 'title')
          ;
        title.appendChild(dom.ownerDocument.createTextNode(label));
        dom.appendChild(title);
    }

    function attachCircle(element, vector, r) {
        var child = element.ownerDocument.createElementNS(svgns, 'circle');
        child.setAttribute('cx', vector[0]);
        child.setAttribute('cy', vector[1]);
        child.setAttribute('r', r);
        element.appendChild(child);
    }

    function attachPoint(pointLikeMomNode, element) {
        var style = pointLikeMomNode.getComputedStyle()
          // these are all Vectors or false
          , onPos = style.get('on', false)
          , inPos = style.get('in', false)
          , outPos = style.get('out', false)
          ;

        if(onPos)
            attachCircle(element, onPos, 4);
        if(inPos)
            attachCircle(element, inPos, 2);
        if(outPos)
            attachCircle(element, outPos, 2);
    }


    /**
     * This will become something like a layer-renderer API ...
     *
     * At the moment the default/normal use case is to just render glyph within
     * an svg element.
     *
     * When calling
     *      this.switchLayers(true);
     * the item changes to switch
     * on mouseenter to a display model where individual mom-nodes can
     * be selected via mouse click.
     * To receive notification of that selection you got to register a callback:
     *      this.on('select-mom', callback[, mydata])
     * where
     *      function callback(mydata or undefined, 'select-mom', selectedMOMNode){}
     *
     *
     * It is very gross in design at the moment. When I know more about
     * our diverse rendering needs there will be a refactoring. Until
     * then maybe you can tell us your wishlist in the issue tracker.
     * I'm thinking something roughly like a MOM GUI Toolkit with modular
     * reusable objects.
     *
     * TODO: make dependencies more explicit.
     */
    function GlyphInterface(document, layerSource, services, glyph, options_) {
        emitterMixin.init(this, emitterMixinSetup);
        this._doc = document;
        this._mom = glyph;
        var options = options_ || {};


        this.element = this._createElement();
        this._container = this._doc.createElementNS(svgns, 'g');
        this._nodeIds2Mom = Object.create(null);
        this._listenTo(this._mom, this.element);
        this.element.appendChild(this._container);


        // Concerned with keeping the box size in sync with the glyph
        this._viewBox = this._getViewBox();
        this._setViewBox();
        this._subscriptionId = this._mom.on('CPS-change', [this, '_cpsChangeHandler']);
        // Needs subscription to fontinfo when we start to change that ...
        this._transformation = null;
        this._setTransformation(glyph);

        // concerned with the display content of the element
        this._layerSource = layerSource;
        this._services = services;
        this._subscriptions = null;
        this._layerElements = null;
        this._currentDisplaySet = null;
        this._displaySets = {
            simple: {'full': true}
          , detailed: {'shapes': true, 'centerline': true, 'meta': true, 'points': true}
        };

        this.__selectNodeHandler = this._selectNodeHandler.bind(this);

        // default;
        if(options.showControls)
            this.showControls();
        else
            this.hideControls();

    }

    var _p = GlyphInterface.prototype;
    _p.constructor = GlyphInterface;
    emitterMixin(_p, emitterMixinSetup);

    _p.showControls = function() {
        this._switchDisplaySet('detailed');
        this.element.addEventListener('click', this.__selectNodeHandler);
    };

    _p.hideControls = function() {
        this._switchDisplaySet('simple');
        this.element.removeEventListener('click', this.__selectNodeHandler);
    };

    _p._makeLayer = function(key) {
        var layerElement, subscription;
        switch(key) {
            case ('shapes'):
                layerElement = this._doc.createElementNS(svgns, 'g');
                layerElement.classList.add('layer', 'layer-shapes');
                subscription = this._drawShapeHandles(this._services.shapes, layerElement, this._mom);
                break;
            case ('points'):
                layerElement = this._doc.createElementNS(svgns, 'g');
                layerElement.classList.add('layer', 'layer-pointlike');
                subscription = this._drawPointHandles(layerElement, this._mom);
                break;
            default:
                subscription = this._layerSource[key].get(this._mom);
                layerElement = subscription.value;
                layerElement.classList.add('layer', 'layer-'+key);
        }
        return [layerElement, subscription];
    };

    _p._switchDisplaySet = function(displaySet) {
        var k, elem, result, oldElements, oldSubscriptions;
        if(this._currentDisplaySet === displaySet)
            return;
        this._currentDisplaySet = displaySet;

        oldElements = this._layerElements;
        oldSubscriptions = this._subscriptions;
        this._layerElements = [];
        this._subscriptions = {layers: []};

        // build new
        for(k in this._displaySets[displaySet]) {
            result = this._makeLayer(k);
            elem = result[0];
            this._layerElements.push(elem);
            this._container.appendChild(elem);
            if(k !== 'points' && k !== 'shapes')
                this._subscriptions.layers.push(result[1]);
            else
                this._subscriptions[k] = result[1];
        }

        // clean up late, so that caches don't get
        // pruned and reloaded just a moment later
        if(oldSubscriptions)
            this._destroySubscriptions(oldSubscriptions);
        // Avoid a flash of no layer content by removing to old elements
        // after adding the new ones.
        while(oldElements && (elem = oldElements.pop()))
            this._container.removeChild(elem);
    };

    _p._drawShapeHandles = function(shapesService, layer, momGlyph) {
        var shapes = []
         , children = momGlyph.children
         , child, i, l, item, dom
         ;

        for(i=0,l=children.length;i<l;i++) {
            child = children[i];
            item = shapesService.get(child);
            dom = item.value;
            setTitle(child, dom);
            dom.classList.add('type-' + child.type);
            this._listenTo(child, dom);
            layer.appendChild(dom);
            shapes.push([child, item]);
        }
        return shapes;
    };

    _p._drawPointHandles = function(layer, momGlyph) {
        var points = []
          , pointLike = new Set(['p', 'left', 'center', 'right'])
          , stack = [momGlyph]
          , point, child, dom
          ;

        // I think there can be a lot of power in categorizing elements
        // into groups, like pointLike or surfaceLike etc..
        // see the incredible power below.
        // (When we introduce MOM-changes this becomes a bit more diversified though)
        while( (child = stack.pop()) ) {
            if(pointLike.has(child.type)) {
                // got to listen to child.on('CPS-change'), reminds of _MOMTransformationCache
                // However, we don't do write once <use> anywhere here.
                point = {
                    mom: child
                  , subscriptionId: null
                  , dom: this._doc.createElementNS(svgns, 'g')
                };
                // so we can track point movement
                point.subscriptionId = child.on('CPS-change', [this, '_pointChanged'], point);
                this._pointChanged(point); //initialization
                dom = point.dom;
                dom.classList.add('point-like', 'type-' + child.type);
                this._listenTo(child, dom);
                layer.appendChild(dom);
                points.push(point);
            }
            else
                // recursion
                Array.prototype.push.apply(stack, child.children.reverse());
        }
        return points;
    };

    // update point position
    _p._pointChanged = function(point) {
        while(point.dom.lastChild)
            point.dom.removeChild(point.dom.lastChild);
        setTitle(point.mom, point.dom);
        attachPoint(point.mom, point.dom);
    };

    _p._registerMomNode = function(momNode) {
        // TODO: A "give me the nodeID I return the node item" facility
        // should probably become part of the Node API.
        var entry = this._nodeIds2Mom[momNode.nodeID];
        if(!entry)
            entry = this._nodeIds2Mom[momNode.nodeID] = [0, momNode];
        entry[0] += 1;
    };

    _p._unregisterMomNode = function(momNode) {
        var entry = this._nodeIds2Mom[momNode.nodeID];
        if(!entry) return;
        entry[0] -= 1;
        if(entry[0] <= 0)
            delete this._nodeIds2Mom[momNode.nodeID];
    };

    _p._getRegisteredMomNode = function(nodeID) {
        var entry = this._nodeIds2Mom[nodeID];
        if(!entry)
            throw new KeyError('MOM-Node with nodeID '+ nodeID + 'not found.');
        return entry[1];
    };

    _p._listenTo = function(momNode, dom) {
        dom.setAttribute('data-node-id', momNode.nodeID);
        this._registerMomNode(momNode);
    };

    _p._selectNodeHandler = function(event) {
        var elem = event.target;
        while(true) {
            if(elem === this.element.parentElement || !elem)
                return;
            if(elem.hasAttribute('data-node-id'))
                // found!
                break;
            elem = elem.parentElement;
        }
        var id = elem.getAttribute('data-node-id')
          , mom = this._getRegisteredMomNode(id)
          ;
        this._trigger('select-mom', mom);
    };

    _p._cpsChangeHandler = function(ownData, channel, eventData) {
        var viewBox = this._getViewBox();
        if(this._viewBox.join(' ') !== viewBox.join(' ')) {
            this._setViewBox();
            this.viewBox = viewBox;
            this._trigger('viewBox-change', viewBox);
        }
    };

    _p._layerChangeHandler = function(ownData, _channel, eventData) {
        this._trigger(ownData.channel, eventData);
    };

    _p._setViewBox = function() {
        this.element.setAttribute('viewBox', this._viewBox.join(' '));
    };

    /**
     * FIXME: MOM.master.fontinfo.unitsPerEm must be subscribed to in
     * the future, when we start changing it!
     *
     * updating "advanceWidth" is already covered by the normal redraw flow.
     *
     * For horizontal written languages:
     *      width is advanceWidth
     *      height is should the font height (fontinfo.unitsPerEm)
     */
    _p._getViewBox = function() {
        var styledict = this._mom.getComputedStyle()
          , width
          , height = this._mom.master.fontinfo.unitsPerEm || 1000
          , viewBox
          ;

        try {
            width = styledict.get('advanceWidth');
        }
        catch(e){
            if(!(e instanceof KeyError))
                throw e;
            // FIXME: we should inform the user of this problem
            width = height;
        }
        // ViewBox min width can't be less than 0.
        width = Math.max(0, width);
        height = Math.max(0, height);

        return [0, 0, width, height];
    };

    _p._getTransformation = function ( fontinfo ) {
        // FIXME: * One day we have to subscribe to unitsPerEm AND
        //          descender for this!
        //        * I guess this is only valid for horizontal writing systems.
        //        * Maybe moveUp is rather === ascender?
        // ascender can be < fontinfo.unitsPerEm - fontinfo.descender, then
        // this solution is better. It seems OK to give the font enough
        // room down and maximal room upwards.
        var moveUp = (fontinfo.unitsPerEm || 1000) + (fontinfo.descender || 0)
          , matrix = [1, 0, 0, -1, 0, moveUp]
          ;
        return matrix.join(',');
    };

    /**
     * Returns true when the transformation actually changed otherwise false
     */
    _p._setTransformation = function(mom) {
        var transformation = this._getTransformation(mom.master.fontinfo);
        if(this._transformation === transformation)
            return false;
        this._transformation = transformation;
        // this transformation is evil! it breaks using transformation for
        // components
        this._container.setAttribute('transform', 'matrix(' +  transformation + ')');
        return true;
    };

    _p._createElement = function() {
        var svg = this._doc.createElementNS(svgns, 'svg');
        // This can be set via css as well, but since it is the only
        // choice that really makes sense, we may be happy for ever when
        // setting it here
        svg.setAttribute('overflow', 'visible');

        // Using inline-block fails for Chromium. Filed a bug:
        // https://code.google.com/p/chromium/issues/detail?id=462107
        // thus, these svgs should be packed inside a container that is
        // display: inline-block
        svg.style.display = 'block';
        return svg;
    };



    _p._destroySubscriptions = function(subscriptions) {
        var k;
        for(k in subscriptions) {
            this['_destroy'+ k[0].toUpperCase()+k.slice(1)](subscriptions[k]);
            delete subscriptions[k];
        }
    };

    _p._destroyPoints = function (points) {
        var i,l,point;
        for(i=0,l=points.length;i<l;i++) {
            point = points[i];
            this._unregisterMomNode(point.mom);
            point.mom.off(point.subscriptionId);
        }
    };

    _p._destroyShapes = _p._destroyLayers = function (items) {
        var i,l;
        for(i=0,l=items.length;i<l;i++) {
            this._unregisterMomNode(items[i][0]);
            items[i][1].destroy();
        }
    };

    _p._destroyLayers = function (items) {
        var i,l;
        for(i=0,l=items.length;i<l;i++)
            items[i].destroy();
    };

    _p.destroy = function() {
        this._destroySubscriptions(this._subscriptions);
        this._mom.off(this._subscriptionId);
    };

    return GlyphInterface;
});
