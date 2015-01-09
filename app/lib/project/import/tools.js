define([
    './SegmentPoint'
], function(
    Point
) {
    "use strict";
    
    function line2curve(p0, p3) {
        var p1, p2
          , distance = (p3['-'](p0))['*'](.33333)
          , newCurve = ['curveTo']
          ;
        // at a third between p0 and p3
        p1 = new Point(p0['+'](distance));
        // at 2 thirds between p3 and p0
        p2 = new Point(p3['-'](distance));
        
        newCurve.push(p1, p2, p3);
        newCurve.wasLine = true;
        return newCurve;
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
        return new Point(getCenter(l, r), undefined
                       , mergeNames(l.name, r.name));
    }
    
    function getCenterSegment(left, right) {
        var result = [left[0]], i=1;
        for(;i<left.length;i++)
            result.push(getCenterPoint(left[i], right[i]));
        return result;
    }
    
    /**
     * see the docstring of StrokeContoue._findNextDirection
     */
    function getDirection(point, firstRound, lastRound, testDirection,
                                                        test, control) {
        var testPointKeys, testPointKey, testPoint, offset;

        if(!firstRound || !lastRound)
            testPointKeys = testDirection === 1
                ? {out:true, on:true, 'in':true}
                : {'in':true, on:true, out:true}
                ;
        else if(firstRound)
            testPointKeys = testDirection === 1
                ? {out: true}
                : {'in': true}
                ;
        else // lastRound == true
            testPointKeys = testDirection === 1
                ? {'in': true}
                : {out: true}
                ;
        for(testPointKey in testPointKeys) {
            testPoint = test[testPointKey];
            offset = control === 'out'
                ? testPoint['-'](point.on)// point.out['-'](point.on)
                : point.on['-'](testPoint)// point.on['-'](point['in']);
                ;
            if(offset.magnitude())
                return offset.angle();
        }
        return false;
    }

    return {
        line2curve: line2curve
      , getCenter: getCenter
      , getCenterPoint: getCenterPoint
      , getCenterSegment: getCenterSegment
      , getDirection: getDirection
    }
})
