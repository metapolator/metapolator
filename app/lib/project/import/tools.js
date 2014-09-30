define([
    './SegmentPoint'
], function(
    Point
) {
    "use strict";
    
    function line2curve(p0, p3) {
        var p1, p2
          , distance = (p3.vector['-'](p0.vector))['*'](.33333)
          , newCurve = ['curveTo']
          ;
        // at a third between p0 and p3
        p1 = new Point(p0.vector['+'](distance));
        // at 2 thirds between p3 and p0
        p2 = new Point(p3.vector['-'](distance));
        
        newCurve.push(p1, p2, p3);
        return newCurve;
    }
    
    /**
     * Return the control points for both terminal lines.
     * the direction for the stroke beginning terminal line left to right
     * the direction for the stroke ending terminal line is right to left.
     * 
     * returns: [ beginning_segment, ending_segment ]
     */
    function getStrokeTerminals(contour) {
        return [
                 contour[contour.length-1]
               , contour[(contour.length-1) * 0.5]
               ];
    }
    
    function getCenter(l, r) {
        return l['+'](r)['*'](0.5);
    }
    
    function makeNameDict(str) {
        var result = {};
        ((str || '').match(/\S+/g) || [])
            .forEach(function(piece){ this[piece] = null;}, result);
        return result;
    }
    
    /**
     * if a name/class/key "example" is only in left it becomes: "left-example"
     * if a name/class/key "example" is only in right it becomes: "right-example"
     * if a name/class/key "example" is in both it stays: "example"
     *
     * so if left is "hello world" and right is "hello univers" the result
     * will be: "hello left-world right-univers"
     */
    function mergeNames(LeftName, RightName) {
        var left = makeNameDict(LeftName)
          , right =  makeNameDict(RightName)
          , merged = {}
          , k
          ;

        for(k in left)
            if(k in right) {
                merged[k] = null;
                // it's in both, no need to see it again
                delete right[k];
            }
            else
                merged['left-' + k] = null;
        for(k in right)
            merged['right-' + k] = null;
        return Object.keys(merged).join(' ') || null;
    }
    
    function getCenterPoint(l, r) {
        return new Point(getCenter(l.vector, r.vector), undefined
                       , mergeNames(l.name, r.name));
    }
    
    function getCenterSegment(left, right) {
        var result = [left[0]], i=1;
        for(;i<left.length;i++)
            result.push(getCenterPoint(left[i], right[i]));
        return result;
    }
    
    return {
        line2curve: line2curve
      , getStrokeTerminals: getStrokeTerminals
      , getCenter: getCenter
      , getCenterPoint: getCenterPoint
      , getCenterSegment: getCenterSegment
    }
})
