define([
    'metapolator/errors'
  , 'ufojs/main'
  , 'ufojs/tools/pens/AbstractPointPen'
  , 'metapolator/models/MOM/PenStroke'
  , 'metapolator/models/MOM/PenStrokePoint'
  , 'metapolator/models/MOM/Contour'
  , 'metapolator/models/MOM/ContourPoint'
  , 'metapolator/math/Vector'
  , 'metapolator/models/MOM/Component'
  , 'metapolator/models/MOM/PointData'
  , 'ufojs/tools/misc/transform'
], function(
    errors
  , ufoJSUtils
  , Parent
  , PenStroke
  , PenStrokePoint
  , Contour
  , ContourPoint
  , Vector
  , Component
  , PointData
  , transform
) {
    "use strict";

    var PointPenError = errors.PointPen
      , isNumber = ufoJSUtils.isNumber
      , Transformation = transform.Transform
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
        this._prevOffCurveCount = 0;
        this._prevPointTypes = [];
    }

    var _p = MOMPointPen.prototype = Object.create(Parent.prototype);
    _p.constructor = MOMPointPen;

    _p.beginPath = function(kwargs/*optional, dict*/) {
        kwargs = kwargs || {};
        if(this._contour)
            throw new PointPenError('Called beginPath but there is an open '
                    + 'path. Call endPath first.');
        this._contour = [];
        this._contour.element = this._makeContour(kwargs);

        this._prevOffCurveCount = 0;
        this._prevPointTypes = [];
    };

    var contourIndicator = 'C:';
    _p._isContourPath = function(identifier) {
        if(!identifier) return false;
        return identifier
            ? (identifier.slice(0, contourIndicator.length) === contourIndicator)
            : false// no identifier => penstroke
            ;
    };

    _p._makeContour =  function(kwargs) {
        var isContour = this._isContourPath(kwargs.identifier)
          , element = isContour ? new Contour() : new PenStroke()
          ;
        if(kwargs.identifier !== undefined)
            // MOM will have to check validity and uniqueness
            element.id = (isContour)
                 ? kwargs.identifier.slice(contourIndicator.length)
                 : kwargs.identifier
                 ;
        return element;
    };

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


        if(this._contour.element instanceof Contour) {
            // rotate, so that the list is like so: [in, on, out, in, on, out, ...]
            // the first on point must stay the first on point:
            // [in, on, ...] nothing to do
            // [on, ..., out, in] pop in and unshift it to the start
            // [out, in, on, ...] shift out and push it to the end
            // it's enough to find the first on point:
            if(this._contour[0][0] instanceof ContourPoint)
                this._contour.unshift(this._contour.pop());
            else if((this._contour[2][0] instanceof ContourPoint))
                this._contour.push(this._contour.shift());
        }

        var i, pointData;
        for(i=0;i<this._contour.length;i++) {
            if(this._contour[i][0] === undefined)
                // the first item of off-curve points is undefined
                continue;
            pointData =  this._contour[i][1];
            if(i>0)
                // the moveTo at the beginning of a penstroke has no
                // incoming control-point
                pointData['in'] = this._contour[i-1][1];
            if(this._contour[i+1])
                pointData.out = this._contour[i+1][1];
            Object.seal(pointData);
            this._contour.element.add(this._contour[i][0]);
        }

        this._glyph.add(this._contour.element);
        this._contour = null;
    };

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
        var vector, point, pointData, lastVector;

        if(!this._contour)
            throw new PointPenError('Called addPoint but there is no open. '
                    +' path. Call beginPath first.');
            // coordinates
        if(pt === undefined)
            throw new PointPenError('Missing point argument');
        if(pt.filter(isNumber).length < 2)
            throw new PointPenError('coordinates must be int or float');

        vector = Vector.fromArray(pt.map(parseFloat));

        // segment type
        if(this._contour.element instanceof PenStroke
                    && segmentType !== 'move'
                    && this._prevPointTypes.length === 0)
            throw new PointPenError('MOMPointPen expects only open contours '
                        + 'for PenStroke elements. '
                        + 'This are contours that begin with a "move" point. '
                        + 'This contour begins with "'+segmentType+'"');
        else if (segmentType === 'offcurve')
            segmentType = null;
        else if(this._contour.element instanceof Contour
                    && segmentType !== 'curve'
                    && segmentType !== null)
            throw new PointPenError('MOMPointPen expects only the segment '
                        + 'type "curve" for on-curve points of Contour elements. '
                        + 'This point is a "'+segmentType+'"');
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
            this._contour.push([undefined, vector]);
            return;
        }
        // If we get here, this is an on-curve point.
        this._prevOffCurveCount = 0;
        pointData = new PointData({
            'in': undefined
          , on: vector
          , out: undefined
        });
        point = this._contour.element instanceof Contour
                    ? new ContourPoint(pointData)
                    : new PenStrokePoint(pointData)
                    ;
        // we translate names into classes, because they don't have to be
        // unique
        if (name !== null)
            (name.match(/\S+/g) || [])
                    .filter(function(item){ return !!item.length;})
                    .forEach(point.setClass, point);
        if(kwargs.identifier !== undefined)
            // MOM will have to check validity and uniqueness
            point.id = kwargs.identifier;
        this._contour.push([point, pointData]);
    };

    /**
     * Add a sub glyph.
     */
    _p.addComponent = function(baseGlyphName, transformation) {
        var transMatrix, component;

        transMatrix = new Transformation( transformation );
        component = new Component( baseGlyphName, transMatrix );
        this._glyph.add(component);
    };

    return MOMPointPen;
});
