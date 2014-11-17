define([
    'metapolator/errors'
  , 'ufojs/main'
  , 'ufojs/tools/pens/AbstractPointPen'
  , 'metapolator/models/MOM/PenStroke'
  , 'metapolator/models/MOM/PenStrokePoint'
  , 'metapolator/math/Vector'
  , 'metapolator/models/MOM/Component'
], function(
    errors
  , ufoJSUtils
  , Parent
  , PenStroke
  , PenStrokePoint
  , Vector
  , Component
) {
    "use strict";

    var PointPenError = errors.PointPen
      , isNumber = ufoJSUtils.isNumber
      ;


    /**
     * Point Pen to draw a Skeleton outline into a MOM glyph, thus creating
     * the MOM Tree beyond glyph level
     *
     * This copies a lot of the validation logic of
     * ufojs/ufoLib/glifLib/GLIFPointPen
     *
     */
    function MOMPointPen(glyph) {
        Parent.call(this);
        this._glyph = glyph;
        this._contour = null;
        this._lastPointData = undefined;
        this._prevOffCurveCount = 0;
        this._prevPointTypes = [];
    }

    var _p = MOMPointPen.prototype = Object.create(Parent.prototype);
    _p.constructor = MOMPointPen;

    /**
     * Start a new sub path.
     */
    _p.beginPath =  function(kwargs/*optional, dict*/) {
        kwargs = kwargs || {}
        if(this._contour)
            throw new PointPenError('Called beginPath but there is an open. '
                    +' path. Call endPath first.')
        this._contour = new PenStroke();
        if(kwargs.identifier !== undefined)
            // MOM will have to check validity and uniqueness
            this._contour.id = kwargs.identifier;
        this._prevOffCurveCount = 0;
        this._prevPointTypes = []
        this._lastVector = undefined;
        this._lastPointData = undefined;
    }

    /**
     * End the current sub path.
     */
    _p.endPath = function() {
        if(!this._contour)
            throw new PointPenError('Called endPath but no path was open. '
                    +' Call beginPath first.');
        if(this._prevPointTypes.length
                        && this._prevPointTypes[0] === 'move'
                        && this._prevPointTypes.slice(-1)[0] == 'offcurve')
            throw new PointPenError('open contour has loose offcurve point');
        // seal the last point data element, it is complete
        this._sealLastPoint();
        this._glyph.add(this._contour);
        this._contour = null;
    }

    _p._sealLastPoint = function() {
        if(this._lastPointData)
            Object.seal(this._lastPointData);
    }

    /**
     * Add a point to the current sub path.
     */
    _p.addPoint = function(
        pt,
        segmentType /* default null */,
        smooth /* default false */,
        name /* default null */,
        kwargs /* default an object, javascript has no **kwargs syntax */
    ) {
        segmentType = (segmentType === undefined) ? null : segmentType;
        smooth = !!smooth;
        name = (name === undefined) ? null : name;
        kwargs = (kwargs || {});//an "options" object
        var vector, point, lastVector;

        if(!this._contour)
            throw new PointPenError('Called addPoint but there is no open. '
                    +' path. Call beginPath first.')
            // coordinates
        if(pt === undefined)
            throw new PointPenError('Missing point argument');
        if(pt.filter(isNumber).length < 2)
            throw new PointPenError('coordinates must be int or float')

        vector = Vector.fromArray(pt.map(parseFloat));
        lastVector = this._lastVector;
        this._lastVector = vector;

        // segment type
        if(segmentType !== 'move' && this._prevPointTypes.length === 0)
            throw new PointPenError('MOMPointPen expects only open contours. '
                        + 'This are contours that begin with a "move" point. '
                        + 'This contour begins with "'+segmentType+'"');
        else if (segmentType === 'offcurve')
            segmentType = null;
        else if(segmentType === 'move' && this._prevPointTypes.length)
            throw new PointPenError('move occurs after a point has '
                                    +'already been added to the contour.');
        else if(segmentType === 'line'
                    && this._prevPointTypes.length
                    && this._prevPointTypes.slice(-1)[0] === 'offcurve')
            throw new PointPenError('offcurve occurs before line point.');
        else if (segmentType === 'curve' && this._prevOffCurveCount > 2)
            throw new PointPenError('too many offcurve points before '
                                                        + 'curve point.');
        this._prevPointTypes.push(segmentType || 'offcurve');

        if (segmentType === null) {
            // off curve
            this._prevOffCurveCount += 1;
            if(this._prevOffCurveCount === 1)
                this._lastPointData.out = vector
            return;
        }
        // If we get here, this is an on-curve point.
        // Metapolator points are all on-curve points.
        // Seal the last point data element, it is complete.
        this._sealLastPoint();

        this._lastPointData = new PenStrokePoint.SkeletonDataConstructor({
            in: this._prevOffCurveCount === 2
                ? lastVector
                : undefined
          , on: vector
          , out: undefined
        });
        this._prevOffCurveCount = 0;
        point = new PenStrokePoint(this._lastPointData)

        // we translate names into classes, because they dont have to be
        // unique
        if (name !== null)
            (name.match(/\S+/g) || [])
                    .filter(function(item){ return !!item.length;})
                    .forEach(point.setClass, point)

        if(kwargs.identifier !== undefined)
            // MOM will have to check validity and uniqueness
            point.id = kwargs.identifier;
        this._contour.add(point);
    }

    /**
     * Add a sub glyph.
     */
    _p.addComponent = function(baseGlyphName, transformation) {
        var component = new Component( baseGlyphName, transformation );
        this._glyph.add(component);
    }

    return MOMPointPen;
});
