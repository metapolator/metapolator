define([
    'metapolator/errors'
  , 'metapolator/project/UFOExportController'
  , 'ufojs/tools/pens/PointToSegmentPen'
  , 'ufojs/tools/pens/SVGPen'
], function(
    errors
  , UFOExportController
  , PointToSegmentPen
  , SVGPen
) {
    "use strict";

    var KeyError = errors.Key
      , AssertionError = errors.Assertion
      , ValueError = errors.Value
      , svgns = 'http://www.w3.org/2000/svg'
      , xlinkns = 'http://www.w3.org/1999/xlink'
      , renderer =  {
            penstroke: UFOExportController.renderPenstrokeOutline
          , contour: UFOExportController.renderContour
        }
      , draw = UFOExportController.drawGlyphToPointPen
      ;

    function EnhancedSVGPen(data, glyphRendererAPI, path, glyphSet) {
        SVGPen.call(this, path, glyphSet);
        this._data = data;
        this._glyphRendererAPI = glyphRendererAPI;
    }
    var _pp = EnhancedSVGPen.prototype = Object.create(SVGPen.prototype);
    _pp.constructor = EnhancedSVGPen;

    _pp.addComponent = function(glyphName, transformation, kwargs /*optional, object*/) {
        var data = this._data
          , masterName = data.MOM.master.id
          , use = this._glyphRendererAPI.get(masterName, glyphName, 'use')
          , key = this._glyphRendererAPI.getKey(masterName, glyphName)
          ;
        use.setAttribute('transform', 'matrix(' +  Array.prototype.join.call(transformation, ',') + ')');
        data.components.push(key);
        data.svg.appendChild(use);
    };

    function GlyphRendererAPI(document, controller) {
        this._doc = document;
        this._controller = controller;
        this._glyphs = Object.create(null);
        this.__renderGlyph = this._renderGlyph.bind(this);
        // A small number in ms, to allow pending changes to come in.
        // However, we don't want to wait `long`, because this will be
        // perceived as pure waiting time and new events will reset the
        // timer.
        this._schedulingTimeout = 20;
        this._glyphIDPrefix = 'mp_glyph_';// globally unique

        this._glyphContainer = this._doc.createElementNS(svgns, 'defs');
        var svg = this._doc.createElementNS(svgns, 'svg');
        svg.style.display = 'none';
        svg.appendChild(this._glyphContainer);
        svg.appendChild(this._doc.createElementNS(svgns, 'g'));

        if(this._doc.body.firstChild)
            this._doc.body.insertBefore(svg, this._doc.body.firstChild);
        else
            this._doc.body.appendChild(svg);
    }

    var _p = GlyphRendererAPI.prototype;
    _p.constructor = GlyphRendererAPI;

    _p.getKey = function(masterName, glyphName) {
        return masterName + ' ' + glyphName;
    };

    /**
     * revoke from oldComponents what is not in data.components
     */
    _p._compareAndRevoke = function(oldComponents, newComponents) {
        var i,l,k,x, old = Object.create(null), revoke;
        // count all old references
        for(i=0,l=oldComponents.length;i<l;i++) {
            k = oldComponents[i];
            old[k] = (old[k] || 0) + 1;
        }
        // for each new reference we need to revoke one old reference less
        for(i=0,l=newComponents.length;i<l;i++) {
            k = oldComponents[i];
            x = old[k];
            // no need to revoke k
            if(x === undefined) continue;
            x -= 1;
            if(x === 0) {
                // no need to revoke k anymore
                old[k] = undefined;
                continue;
            }
            old[k] = x;
        }
        // revoke the keys left
        for(k in old)
            // the number of times left
            for(i=0,l=old[k];i<l;i++)
                this._revoke(k);
    };

    _p._renderGlyph = function(data) {
        /*global clearTimeout*/
        var path = this._doc.createElementNS(svgns, 'path')
          , svgPen = new EnhancedSVGPen(data, this, path, {})
          , pen = new PointToSegmentPen(svgPen)
          , oldComponents = data.components
          , matrix
          , moveUp
          , fontinfo
          ;
        if(data.timeoutId) {
            clearTimeout(data.timeoutId);
            data.timeoutId = null;
        }
        while(data.svg.lastChild)
            data.svg.removeChild(data.svg.lastChild);
        data.components = [];
        try {
            draw(renderer, this._controller, data.MOM, pen);
        }
        catch(e) {
            // FIXME:
            console.warn('Drawing glyph', data.MOM.particulars, 'failed with ' + e, e.stack);
            if(e instanceof KeyError)
                console.info('KeyError means usually that a property definition in the CPS is missing');
            console.info('The user should get informed by the UI!');
        }

        this._compareAndRevoke(oldComponents, data.components);

        // FIXME: * One day we have to subscribe to unitsPerEm AND
        //          descender for this!
        //        * I guess this is only valid for horizontal writing systems.
        //        * Maybe moveUp is rather === ascender?
        fontinfo = data.MOM.master.fontinfo;
        // ascender can be < fontinfo.unitsPerEm - fontinfo.descender, then
        // this solution is better. It seems OK to give the font enough
        // room down and maximal room upwards.
        moveUp = (fontinfo.unitsPerEm || 1000) + (fontinfo.descender || 0);
        matrix = [1, 0, 0, -1, 0, moveUp];
        data.transformation = matrix.join(',');

        data.svg.appendChild(path);

        // update all viewboxes
        this._updateSVGViewBoxes(data);
    };

    _p._scheduleRender = function(data) {
        /*global clearTimeout, setTimeout*/
        if(data.timeoutId)
            clearTimeout(data.timeoutId);
        data.timeoutID = setTimeout(this.__renderGlyph, this._schedulingTimeout, data);
    };

    _p._onGlyphChangeHandler = function(key, channelKey, eventData) {
        var data = this._glyphs[key];
        if(!data)
            throw new AssertionError('There\'s no data, so there must be no subscription!');
        this._scheduleRender(data);
    };

    _p._makeGlyphData = function(key) {
        var data
          , names = key.split(' ')
          , masterName = names[0]
          , glyphName = names[1]
          , selector = ['master#', masterName ,' ', 'glyph#',glyphName].join('')
          , glyph = this._controller.query(selector)
          ;
        if(!glyph)
            throw new KeyError('Not found, a glyph for: ' + selector);
        data = {
             referenceCount: 0
           , MOM: glyph
           , id: this._glyphIDPrefix + glyph.nodeID
           , subscriptionId: glyph.on('CPS-change', [this, '_onGlyphChangeHandler'], key)
           , svg: this._doc.createElementNS(svgns, 'g')
           , timeoutId: null
           , components: [] // keys of component glyphs, used with revoke
           , svgInstances: []
           , transformation: '1,0,0,1,0,0'
        };
        data.href = '#' + data.id;
        data.svg.setAttribute('id', data.id);
        this._glyphContainer.appendChild(data.svg);
        return data;
    };

    _p._getGlyphData = function(key) {
        var data = this._glyphs[key];
        if(!data) {
            data = this._glyphs[key] = this._makeGlyphData(key);
            this._scheduleRender(data);
        }
        return data;
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
    _p._getViewBox = function(data) {
        var styledict = data.MOM.getComputedStyle()
          , width
          , height = data.MOM.master.fontinfo.unitsPerEm || 1000
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

        return [0, 0, width, height];
    };

    _p._applySVGViewBox = function(svg, viewBox) {
        svg.setAttribute('viewBox', viewBox.join(' '));
        if(!svg.parentElement)
            return;
        // Set the newly calculated width to parentElement
        // This should be done automatically by the browser, but
        // the viewBox change is ignored by Firefox and Chromium
        // and not propagated to the parent elements.
        // FIXME: This is a pesky workaround. In fact anything that triggers
        // svg.parentElement recalculating its width would work here, setting
        // a explicit height is a bit too much; see also An issue raised by
        // this behavior:
        // https://github.com/metapolator/metapolator/issues/416#issuecomment-95145551
        // The width should automatically adapt when svg.parentElement
        // changes it's height, but it does not when width is set via css
        // of course.

        // Used to be: svg.getBoundingClientRect().width + 'px' but it seems
        // that calculating this by hand is more reliable, Firefox
        // had problems to return reliably an updated width for changes of
        // the 'space' characters (i.e. without any contour content)
        var calculatedWidth = viewBox[2]/viewBox[3] * svg.parentElement.clientHeight;
        svg.parentElement.style.width = calculatedWidth + 'px';
    };

    _p._updateSVGViewBoxes = function (data) {
        var viewBox = this._getViewBox(data)
          , svgs = data.svgInstances
          , i,l
          ;
        for(i=0,l=svgs.length;i<l;i++) {
            if(!svgs[i].parentElement)
                continue;
            this._setSVGTransformation(svgs[i].firstElementChild, data.transformation);
            this._applySVGViewBox(svgs[i], viewBox);
        }
    };

    _p._setSVGTransformation = function(use, transformation) {
        use.setAttribute('transform', 'matrix(' +  transformation + ')');
    }

    _p._setSVGViewBox = function(data, svg) {
        var viewBox = this._getViewBox(data);
        this._applySVGViewBox(svg, viewBox);
    };

    _p._createDisplayElement = function(data, type) {
        var use = this._doc.createElementNS(svgns, 'use')
          , svg
          , viewBox
          , advanceWidth
          , unitsPerEm
          ;
        use.setAttributeNS(xlinkns, 'href', data.href);
        this._setSVGTransformation(use, data.transformation);

        if(type === 'use')
            return use;
        else if(type && type !== 'svg')
            throw new ValueError('Type must be "use" or "svg" or undefinded: ' + type);
        svg = this._doc.createElementNS(svgns, 'svg');
        // This can be set via css as well, but since it is the only
        // choice that really makes sense, we may be happy for ever when
        // setting it here
        svg.setAttribute('overflow', 'visible');

        // Using inline-block fails for Chromium. Filed a bug:
        // https://code.google.com/p/chromium/issues/detail?id=462107
        // thus, these svgs should be packed inside a container that is
        // display: inline-block
        svg.style.display = 'block';

        this._setSVGViewBox(data, svg);
        data.svgInstances.push(svg);
        svg.appendChild(use);
        return svg;
    };

    _p._get = function(key, type) {
        var data = this._getGlyphData(key);
        data.referenceCount += 1;
        return this._createDisplayElement(data, type);
    };

    _p.get = function(masterName, glyphName, type) {
        return this._get(this.getKey(masterName, glyphName), type);
    };

    _p._revoke = function(key) {
        var data = this._glyphs[key]
          , components
          , i, l
          ;
        if(!data)
            return;
        data.referenceCount -= 1;
        if(data.referenceCount > 0)
            return data.referenceCount;
        delete this._glyphs[key];
        if(data.timeoutId)
            clearTimeout(data.timeoutId);
        // unsubscribe
        data.MOM.off(data.subscriptionId);
        // delete the defs item
        data.svg.parentElement.removeChild(data.svg);
        components = data.components;
        for(i=0,l=components.length;i<l;i++)
            this._revoke(components[i]);
    };

    _p.revoke = function(masterName, glyphName) {
        return this._revoke(this.getKey(masterName, glyphName));
    };

    return GlyphRendererAPI;
});
