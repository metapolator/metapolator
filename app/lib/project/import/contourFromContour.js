define([
    'metapolator/errors'
  , './tools'
], function(
    errors
  , tools
) {
    "use strict";
    var AssertionError = errors.Assertion
      , ImportContourError = errors.ImportContour
      , line2curve = tools.line2curve
      , getDirection = tools.getDirection
      ;

    /* Convert all lineTo to curveTo */
    function _all2CurveTo(contour) {
        var i, result = [], previousSegment, segment;

        previousSegment = contour.length - 1;
        for(i=0;i<contour.length;i++) {

            if(contour[i].length === 4)
                // [command, point, point, point]
                segment = contour[i];
            else if(contour[i].length === 2) {
                // [command, point]
                segment = line2curve (
                      // previous on-curve point
                      contour[previousSegment].slice(-1).pop()
                    , contour[i][1]
                );
            }
            else
                // This means that probably  the code that created
                // the contour argument for is faulty and must be repaired.
                throw new AssertionError('A segment is expected to '
                        + ' have 3 items at this stage, but this has '
                        + contour[i].length + ' items. '
                        + 'Segment: ' + contour[i].join(', '));
            segment.shift(); // remove the segmentType
            result.push(segment);
            previousSegment = i;
        }
        return result;
    }

    function _getMetapolatorPoint(item, i, contour) {
        var outIndex = i === contour.length-1
            ? 0
            : i+1
            ;
        return {
            'in': item[1]
          , on: item[2]
          , out: contour[outIndex][0]
          , wasLine: !!item.wasLine
        };
    }

    /**
     * This is a trimmed copy of the equivalent function in StrokeContour.
     * The purpose is to fined a fallback direction, if the contour did
     * not come with something useful
     * See the other docstring for more info.
     *
     */
    function _findNextDirection(contour, pointIndex, point, control) {
        var normalIncrement = control === 'out' ? 1 : -1
          , increment = normalIncrement
          , i = pointIndex
          , firstRound = true
          , lastRound
          , result
          ;

        while(true) {
            lastRound = i === pointIndex && !firstRound;
            result = getDirection(point, firstRound, lastRound,
                            increment, contour[i], control);
            firstRound = false;
            if(result !== false || lastRound)
                return result;

            // iterate
            if(increment === 1 && i === contour.length-1)
                i = 0;
            else if (increment === -1 && i === 0)
                i = contour.length-1;
            else
                i += increment;
        }
    }

    function _setPolarControls(point, index, contour) {
        var outVector, inVector, dir;
        outVector = point.out['-'](point.on);
        point.outLength = outVector.magnitude();
        dir = _findNextDirection(contour, index, point, 'out');
        if(dir === false)
            throw new ImportContourError('Can\'t find an outgoing direction '
                                        + 'for point at contour['+index+'].');
        point.outDir = dir;
        inVector = point.on['-'](point['in']);
        point.inLenght = inVector.magnitude();
        dir = _findNextDirection(contour, index, point, 'in');
        if(dir === false)
            throw new ImportContourError('can\'t find an incoming direction '
                                        +'for point at contour['+index+'].');
        point.inDir = dir;
        return point;
    }

    function contourFromContour(contour) {
        return _all2CurveTo(contour)
               .map(_getMetapolatorPoint)
               .map(_setPolarControls)
               ;
    }

    return contourFromContour;
});
