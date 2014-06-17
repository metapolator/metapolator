define([
    'metapolator/errors'
  , 'metapolator/cli/ArgumentParser'
  , 'ufojs/tools/io/staticNodeJS'
  , 'ufojs/ufoLib/glifLib/GlyphSet'
  , './ImportOutlinePen'
  , './SkeletonSegmentPen'
  , './SegmentPoint'
  , './CompoundPoint'
  , './Vector'
], function (
    errors
  , ArgumentParser
  , io
  , GlyphSet
  , ImportOutlinePen
  , SkeletonSegmentPen
  , Point
  , CompoundPoint
  , Vector
) {
    "use strict";
    var CommandLineError = errors.CommandLine
      , argumentParser = new ArgumentParser('import')
      , module
      ;
    argumentParser.addArgument(
        'SourceUFO'
      , 'The path to the source UFO directory'
      , function(args) {
            var ufoDir = args.pop();
            if(ufoDir === undefined)
                throw new CommandLineError('No SourceUFO argument found');
            return ufoDir;
        }
      );
    
    argumentParser.addOption(
        'glyphs'
      , ['-g', '--glyphs']
      , ['Set a subset of the glyphs that should be imported into '
        , 'the metapolator project. Use a comma separated list of '
        , 'glyph names to specify the subset. Without this option '
        , 'all glyphs of the UFO are attempted to be imported.'].join('')
      , function(args) {
            var value = args.shift()
              , glyphNames
              ;
            if(value === undefined)
                throw new CommandLineError('The option "glyphs" needs '
                    + 'a value of comma separated glyph names.')
                
            glyphNames = value.split(',')
                .map(function(item){ return item.trim(); })
                .filter(function(item){ return !!item.length; })
            
            if(!glyphNames.length)
                throw new CommandLineError('The value of option "glyphs" '
                    + 'did not produce a list of names, value was: "'
                    + value + '" expected was a comma separated list '
                    + 'of glyph names');
            return glyphNames;
        }
    );
    
    function main(commandName, argv) {
            // arguments are mandatory and at the end of the argv array
            // readArguments MUST run before readOptions
        var args = argumentParser.readArguments(argv)
            // options are after the command name and berfore the arguments
            // readOptions MUST run after readArguments
          , options = argumentParser.readOptions(argv)
          , sourceGlyphSet
          // the current workin directory + glyphs_imported
          , targetGlyphSetDir = './glyphs_imported'
          , targetGlyphSet
          ;
        
        console.log('processed arguments', args)
        console.log('processed options', options)
        
        // open the source ufo glyphs layer as UFOv2
        sourceGlyphSet = GlyphSet.factory(
            false, io,
            [args.SourceUFO, 'glyphs'].join('/'),
            undefined, 2
        )
        
        console.log('sourceGlyphSet', sourceGlyphSet.contents)
        
        // open the target ufo glyphs layer (as UFOv3 by default)
        targetGlyphSet = GlyphSet.factory(
            false, io,
            targetGlyphSetDir
        )
        
        // for every glyph:
        
        //      import glyph like this:
        // open glyph a from source, save to target …
        var a = sourceGlyphSet.get('a_play')
          , segmentPen = new SkeletonSegmentPen()
          , pen = new ImportOutlinePen(segmentPen, true)
          ;
        
        a.drawPoints(false, pen);
        
        var util = require('util')
          , contours = segmentPen.flush()
          , i=0
          , contour
          , skeleton = []
          , penStroke = []
          ;
        
        /**
         * This methods expects a input-contour like a Segement pen produces it.
         * 
         * The 'implied' closing line must be included
         * which is *not* the default when using a ufoJS like PointToSegmentPen!
         * see the outputImpliedClosingLine of the PointToSegmentPen constructor.
         * 
         * The input-contour must be a closed contour.
         * 
         * The minimal length of the input-contour is 3 which yields in a one item
         * result.
         * 
         * The input-contour is expected to have an uneven number of segments:
         * An initial 'moveTo' segment and an even number of either 'lineTo'
         * or 'curveTo' segments.
         * 
         * The result of this method is an array of arrays of left and right segment
         * pairs:
         * 
         * var result = [
         *      [left, right],
         *      [left, right],
         *      [left, right],
         *      [left, right],
         * ]
         * 
         * The result length is (input.length -1) /2
         * 
         * 
         * This method treats the first on curve point as first point on
         * the right side and the on curve point before the last on curve
         * point as the first point on the left side. Each segement has one
         * on curve point and 0 or 3 off curve points.
         * 
         * The last segment is skipped as well as the segment with the index
         * (contour.length-1)/2. Both segments are the 'width' of the stroke
         * and not part of the outline.
         * ## Note: it would be cool to preserve these segments as line
         *    endings of the stroke
         * 
         * The results left segments are a direction reversed representation
         * of the input-contours left-side segments. So the results left
         * and right side contours share the same direction.
         * 
         * EXMAPLE:
         * A contour of length 11: 1 moveto  + 10 segments:
         *  [moveto, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
         * 
         * left    4    right
         *         _
         *      5 | | 3
         *      6 | | 2
         *      7 | | 1
         *      8 |_| 0
         *           * 
         *         9   
         * 
         * (*) moveTo is the point in the lower right corner.
         * 
         *     result = [
         *        [moveTo, moveTo]
         *        [8, 0]
         *        [7, 1]
         *        [6, 2]
         *        [5, 3]
         *     ]
         */
        function getStrokeContour(contour) {
            var result = []
              // skip the first moveto
              , right = 1
              // -1 for length to index translation,
              // -1 because the very last segment is the vector of the 
              // pen, not part of the stroke
              , left = contour.length-2
              , zLength = (contour.length-1)*0.5
              , leftSegment, points
              ;
            
            // add the initial moveTo to the results
            result.push([
                ['moveTo', contour[left].slice(-1).pop()]
              , contour[0]
            ])
            for(;right<zLength; right++, left--) {
                // the problem is, that the left contour is in the wrong
                // direction. so we have to reverse its direction:
                leftSegment = []
                
                // start with the command
                leftSegment.push(contour[left][0])
                // add the control points (if any) in reverse order
                leftSegment.push.apply(leftSegment,
                                    contour[left].slice(1,-1).reverse())
                // oncurve point of the previous segment
                leftSegment.push(contour[left-1].slice(-1).pop())
                
                result.push([leftSegment, contour[right]]);
            }
            return result;
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
        
        function line2curve(p0, p3) {
            var p1, p2
              , distance = (p3.vector['-'](p0.vector))['*'](.33333)
              ;
            // at a quarter between p0 and p3
            p1 = new Point(p0.vector['+'](distance));
            // at a quarter between p3 and p0
            p2 = new Point(p3.vector['-'](distance));
            return ['curveTo', p1, p2, p3];
        }
        
        function hobby(theta, phi) {
            var st = Math.sin(theta)
            , ct = Math.cos(theta)
            , sp = Math.sin(phi)
            , cp = Math.cos(phi)
            ;
            return (
            (2 + Math.sqrt(2) * (st-1/16*sp) * (sp-1/16*st) * (ct-cp)) /
            (3 * (1 + 0.5*(Math.sqrt(5)-1)* ct + 0.5*(3-Math.sqrt(5))*cp))
            )
        }
    
        // hobby2cubic
        /**
        * There is freedom to allow tangent directions and “tension”
        * parameters to be specified at knots, and special “curl” parameters
        * may be given for additional control near the endpoints
        * of open curves.
        * 
        * w0 and w1 are the tangent directions.
        * alpha and beta are the tension parameters, AKA the length of the
        * control point vector.
        */
        function hobby2cubic(z0, w0, alpha, beta, w1, z1) {
            var theta, phi, e, u, v;
            theta = w0['/'](z1['-'](z0)).arg();
            phi = z1['-'](z0)['/'](w1).arg();
            
            e = new Vector(Math.E);
            u = z0['+'](
                    e['**'](new Vector(0, 1)['*'](theta))
                ['*'] (z1['-'](z0))
                ['*'] (hobby(theta, phi))
                ['/'] (alpha)
            );
            v = z1['-'](
                    e['**'](new Vector(0, -1)['*'](phi))
                ['*'] (z1['-'](z0))
                ['*'] (hobby(phi, theta))
                ['/'] (beta)
            );
            return [u, v]
        }
        
        /**
         * returns the tension for the first on-curve point.
         */
        function posttension(p0, p1, p2, p3) {
           var u = hobby2cubic(
                            p0,
                            p1['-'](p0) /*direction 1*/,
                            1, 1, // std. tension is 1
                            p3['-'](p2) /*direction 2*/,
                            p3)[0];
            return u['-'](p0).magnitude()/p1['-'](p0).magnitude();
        }
        /**
         * returns the tension for the seccond on-curve point
         */
        function pretension(p0, p1, p2, p3) {
            var v = hobby2cubic(
                             p0,
                             p1['-'](p0) /*direction 1*/,
                             1, 1, // std. tension is 1
                             p3['-'](p2) /*direction 2*/,
                             p3)[1];
            return v['-'](p3).magnitude()/p2['-'](p3).magnitude();
        }
        /**
         * If you need both tension values, this version is more efficient
         * Than calling posttension and pretension.
         */
        function tensions(p0, p1, p2, p3) {
            var dir1 =  p1['-'](p0) /*direction 1*/
              , dir2 = p3['-'](p2) /*direction 2*/
              , uv = hobby2cubic( p0, dir1, 1, 1, // std. tension is 1
                               dir2, p3)
              , u = uv[0]
              , v= uv[1]
              ;
            return[
                u['-'](p0).magnitude()/dir1.magnitude()
              , v['-'](p3).magnitude()/dir2.magnitude()
            ]
        }
        /**
         * Try to make the segments left (0) and right (1) of 'current' compatible.
         * 
         * If left and right have the same type they are returned as it;
         * 
         * If left and right have a different kind, one must be 'lineTo'
         * and the other one must be 'curveTo'. Then the 'lineTo' segment
         * will be converted into a 'curveTo' segment. for this operation
         * the previous segment is needed, because the previous on curve
         * point is needed to corectly place the new control points.
         * 
         * A segment is an array where the first element is the command
         * name string and the other elements are the instances of Points
         * to draw that command. There must be at least one point. The last
         * point is the on curve point of the segment:
         *      [command, ... points]
         * 
         * Known commands are:
         *    ['moveTo', point] // there's no way to make this compatible to something else
         *    ['lineTo', point]
         *    ['curveTo', point, point, point]
         * 
         * @current: array of a left and a right segment:
         *     current = [left, right]
         * 
         * @previous: array of a left and a right segment:
         *     previous = [left, right]
         * previous may be undefined, but this raises an error if left
         * and right of current are of a different type (which shouldn't
         * happen if your outline is in a propper shape anyways)
         * 
         * returns: array of a left and a right segment:
         *     return [left, right]
         */
        function getCompatibleSegments(current, previous) {
            var left = 0
            , right = 1
            , promoted
            ;
            if(current[left][0] === current[right][0])
                return [current[left], current[right]];
            
            // previous is usually undefined for the first segment of a 
            // path and for the first segemnet of a path both commands
            // must be the same: moveTo
            // in taht case this method already returned
            if(!previous)
                throw new Error('previous is needed but not defined');
            
            if (current[left][0] === 'lineTo'
                                && current[right][0] === 'curveTo') {
                promoted = line2curve(
                    previous[left].slice(-1).pop()
                  , current[left].slice(-1).pop()
                );
                return [promoted, current[right]];
            }
            
            if (current[right][0] === 'lineTo'
                                && current[left][0] === 'curveTo') {
                promoted = line2curve(
                    previous[right].slice(-1).pop()
                  , current[right].slice(-1).pop()
                );
                return [current[left], promoted];
            }
            
            throw new Error(['Illegal combination of segemnet types:',
                        current[left][0], current[right][0]].join(' '));
        }
        
        function getCenterPoint(l, r) {
            return new Point( l.vector['+'](r.vector)['*'](0.5) );
        }
        
        function getCenterSegment(left, right) {
            var result = [left[0]], i=1;
            for(;i<left.length;i++)
                result.push(getCenterPoint(left[i], right[i]));
            return result;
        }
        
        function getCenterLine(strokeContour) {
            var result = []
              , i=0
              , z
              , pair
              ;
            for(; i<strokeContour.length; i++) {
                // strokeContour[i-1] will be undefined for the first round
                pair = getCompatibleSegments(strokeContour[i], strokeContour[i-1]);
                z = getCenterSegment.apply(null, pair)
                result.push(z);
            }
            return result;
        }
        
        for(;i<contours.length;i++) {
            contour = contours[i];
            // console.log('contour', i, 'closed', contour.closed)
            // console.log('length', contour.commands.length);
            // console.log(contour.commands.join('\n'))
            // console.log('\n')
            // must be closed AND
            // must be uneven, because the initial moveto is no segment
            // that leaves a trace.
            if(contour.closed && contour.commands.length
                                        && contour.commands.length >= 5
                                        && contour.commands.length % 2) {
                
                var strokeContour = getStrokeContour(contour.commands)
                  , centerLine = getCenterLine(strokeContour)
                  , terminals = getStrokeTerminals(contour.commands)
                  , penStrokeContour = getPenStroke(centerLine, strokeContour, terminals);
                  ;
                
                
                
                skeleton.push(centerLine);
                // var leftRight = separateStrokeContour(strokeContour);
                // skeleton.push(leftRight[0], leftRight[1]);
                
                penStroke.push(penStrokeContour)
            }
            else if(!contour.closed)
                console.log('skipping contour because it is open.');
            else if(contour.commands.length < 5)
                console.log('skipping contour because it has less than 4 on-curve points.');
            else
                console.log('skipping contour because count of on-curve points is uneven');
        }
        
        function separateStrokeContour(strokeContour, left, right) {
            var separated = [left || [], right || []]
              , i=0
              ;
            for(;i<strokeContour.length;i++){
                separated[0].push(strokeContour[i][0]);
                separated[1].push(strokeContour[i][1]);
            }
            return separated;
        }
        
        
        /**
         * From a semantic point of view we have only on-curve points, which:
         *     may have an incoming control( point || tension + direction)
         *     may have an outgoing control( point || tension + direction)
         * 
         * This is also the representation font-editors present their users
         * they are not concerned with a segment based presentation. So
         * this is the way most people think about vector graphics.
         */
        function getSemanticPoint(i, segments) {
            return {
                on: segments[i][segments[i].length-1]
                // last control point of the current segment
                , in: i === 0 || segments[i][0] !== 'curveTo'
                    ? undefined
                    : segments[i][2]
                // first control point of the next segment
                , ou: i === segments.length-1 || segments[i+1][0] !== 'curveTo'
                    ? undefined
                    : segments[i+1][1]
            };
        }
        
        /**
         * Create a list of semantic points which coordinates are relative
         * to the centerline
         * 
         * Note the actual type of curve may become switchable
         * with CPS (curve-type or so)
         * 
         * 
         * Thoughts about a framework to build a reference system for
         * both Absolute and Relative Coordinates.
         * 
         * CompoundPoints are composed of different vectors OR
         * other CompoundPoints. A CompoundPoint has one vector, it's
         * "own/intrinsic" value A vector will never change it's value.
         * A vector is like a number, the number 42 doesn't change it's
         * value, it's always 42. A CompundPoint may change it's value
         * either because it changed its "own/intrinsic" vector (to another
         * vector) or because a referenced CompundPoint changed.
         * 
         * The absolute value of a CompoundPoint is calculated from the
         * sum of its "own/intrinsic" vector plus the other vectors and
         * CompoundPoints. Thus, if there are no other vectors,
         * the CompoundPoint is "absolute" because it's only relative
         * to (0, 0).
         * 
         * This might become a CPS notation:
         * here control via control points, hobbys tension and
         * dir will have a notation, too
         *  z* is the center point
         *  l* is the left point
         *  r* is the right point
         *  (s* is the skeleton point)
         *
         *  *on is on-courve
         *  *in is the incomming control point
         *  *ou is the outgoing control pint
         *
         * point:no(3) {
         *    zon: (123, 234);
         *    zin: (12, 23), zon;
         *    zou: (-12, 89), zon;
         *    lon: (52, 35),  zon;
         *    lin: (14, 12), zin.vector, lon;
         *    lou: (-15, -82), zin.vector, lon;
         *    ron: (52, 35),  zon;
         *    rin: (14, 12), zin.vector, ron;
         *    /* this must be possible, so we can inherit the normal
         *       stack of references: * /
         *    rou: vector(zin), ron;
         *    rou.vector: (-123, 234);
         *
         *    rou.dir: 23deg
         *    rou.len: 123
         *    rou.x: 123
         *    rou.y: 951
         *    /* set up smooth and symmetrical controls 
         *     we need a way to detect recursion, of course! * /
         *
         *    rin-dir: rou-dir
         *    rin-len: rou-len
         * }
         *
         * NOTE! In the end it's planned at the moment to store
         * the skeleton as non-closed outlines. To create a
         * more "physical" representation of the data. This would
         * make it necessary to have a further reference to the
         * skeleton coordinates. Like "son", "sin", "sou" where "sin" and
         * "sou" would be relative to "son", I suppose.
         *
         * The construction of the following CompoundPoint instances
         * should eventually happen via CPS. All we need to do
         * is to specify the intrinsic value and the reference
         * bases. The reference bases would be in the global.css
         * or even the default setting and inherited by every point
         * in the best case.
         */
        function getPenStroke(center, strokeContour, terminals) {
              var left = []
                , right = []
                ;
            // writes to left and right
            separateStrokeContour(strokeContour, left, right);
            var source, result, results = [];
            for(var i=0; i<center.length; i++) {
                source = {
                    z: getSemanticPoint(i, center)
                  , l: getSemanticPoint(i, left)
                  , r: getSemanticPoint(i, right)
                }

                result = {};
                results.push(result);
                
                // center line
                result.zon = new CompoundPoint(source.z.on.vector)
                result.zin = source.z.in === undefined
                    ? undefined
                    : new CompoundPoint(
                        source.z.in.vector['-'](source.z.on.vector)
                      , result.zon)
                result.zou = source.z.ou === undefined
                    ? undefined
                    : new CompoundPoint(
                        source.z.ou.vector['-'](source.z.on.vector)
                      , result.zon)
                
                // left stroke
                result.lon = new CompoundPoint(
                    source.l.on.vector['-'](source.z.on.vector)
                    , result.zon)
                
                
                result.lin = source.l.in === undefined
                     ? undefined
                     : new CompoundPoint(
                         source.l.in.vector['-'](source.l.on.vector)
                                           ['-'](result.zin.intrinsic.vector)
                       , result.zin.intrinsic, result.lon.intrinsic, result.zon)
                       
                       
                result.lou = source.l.ou === undefined
                    ? undefined
                    : new CompoundPoint(
                        source.l.ou.vector['-'](source.l.on.vector)
                                          ['-'](result.zou.intrinsic.vector)
                      , result.zou.intrinsic, result.lon)
                
                // right stroke
                result.ron = new CompoundPoint(
                    source.r.on.vector['-'](source.z.on.vector)
                    , result.zon)
                
                result.rin = source.r.in === undefined
                    ? undefined
                    : new CompoundPoint(
                         source.r.in.vector['-'](source.r.on.vector)
                                           ['-'](result.zin.intrinsic.vector)
                       , result.zin.intrinsic, result.ron)
                
                result.rou = source.r.ou === undefined
                    ? undefined
                    : new CompoundPoint(
                        source.r.ou.vector['-'](source.r.on.vector)
                                          ['-'](result.zou.intrinsic.vector)
                      , result.zou.intrinsic, result.ron)
            }
            
            
            // add the terminal segments
            // terminal of the beginning of the stroke
            if(terminals[0][0] === 'curveTo') {
                result = results[0];
                // note that the control points are from left to right
                result.lin = new CompoundPoint(
                    terminals[0][1].vector['-'](result.lon.vector)
                  , result.lon)
                
                result.rin = new CompoundPoint(
                    terminals[0][2].vector['-'](result.ron.vector)
                  , result.ron)
            }
            //terminal of the ending of the stroke
            if(terminals[1][0] === 'curveTo') {
                result = results[results.length-1];
                // note that the control points are from right to left
                result.rou = new CompoundPoint(
                    terminals[1][1].vector['-'](result.ron.vector)
                  , result.ron)
                
                result.lou = new CompoundPoint(
                    terminals[1][2].vector['-'](result.lon.vector)
                  , result.lon)
            }
            
            for (var i=0; i<results.length;i++) {
                console.log(new Array(15).join(i + '_'));
                    for(var k in results[i])
                        console.log(k, results[i][k]+'');
            }
            
            return results;
        }
        
        function drawPenStroke(contours, pen) {
            var i=0, j, segmentType;
            
            for(;i<contours.length;i++) {
                pen.beginPath()
                // first draw the right side
                for(j=0;j<contours[i].length;j++) {
                    if(contours[i][j].rin !== undefined) {
                        segmentType = 'curve';
                        pen.addPoint(contours[i][j].rin.vector.valueOf())
                    }
                    else
                        segmentType =  'line';
                    console.log(segmentType)
                    
                    
                    pen.addPoint(contours[i][j].ron.vector.valueOf(), segmentType)
                    if(contours[i][j].rou !== undefined)
                        pen.addPoint(contours[i][j].rou.vector.valueOf())
                }
                // then draw the left side
                for(j=contours[i].length-1;j>=0 ;j--) {
                    console.log('!>>', j, contours[i].length, contours[i]);
                    if(contours[i][j].lou !== undefined) {
                        segmentType = 'curve';
                        pen.addPoint(contours[i][j].lou.vector.valueOf())
                    }
                    else
                        segmentType = 'line';
                    console.log(segmentType)
                    console.log(new Array(15).join(i + '_'));
                    for(var k in contours[i][j])
                        console.log(k,contours[i][j][k]+'');
                    
                    pen.addPoint(contours[i][j].lon.vector.valueOf(), segmentType)
                    if(contours[i][j].lin !== undefined)
                        pen.addPoint(contours[i][j].lin.vector.valueOf())
                }
                pen.endPath();
                
                pen.beginPath();
                // AND draw the skeleton
                for(j=0;j<contours[i].length;j++) {
                    if(j===0)
                        segmentType = 'move';
                    else if(contours[i][j].zin !== undefined) {
                        segmentType = 'curve';
                        pen.addPoint(contours[i][j].zin.vector.valueOf())
                    }
                    else
                        segmentType =  'line';
                    console.log(segmentType)
                    
                    pen.addPoint(contours[i][j].zon.vector.valueOf(), segmentType)
                    if(contours[i][j].zou !== undefined)
                        pen.addPoint(contours[i][j].zou.vector.valueOf())
                }
                pen.endPath();
                
            }
        }
        
        function draw(skeleton, pen) {
            var i=0, j, k
              , contour
              , segment
              , types = {
                    'moveTo': 'move'
                  , 'lineTo': 'line'
                  , 'curveTo': 'curve'
                }
              , type
              , point
              ;
            for(;i<skeleton.length;i++) {
                pen.beginPath();
                contour = skeleton[i];
                for(j=0;j<contour.length;j++) {
                    segment = contour[j];
                    for(k=1; k<segment.length;k++) {
                        type = (k === segment.length-1)
                            ? types[segment[0]]
                            : undefined;
                        point = segment[k]
                        pen.addPoint(point.vector.valueOf(), type, point.smooth,
                                     point.name, point.kwargs)
                    }
                }
                pen.endPath();
            }
        }
        
        targetGlyphSet.writeGlyph(false, a.glyphName, a,
            // draw the outline command by command to the new glif
            //draw.bind(null, skeleton)
            drawPenStroke.bind(null, penStroke)
            
        )
        targetGlyphSet.writeContents(false);
        
    //    // if pen = new testPens.AbstractPointTestPen()
    //    targetGlyphSet.writeGlyph(false, a.glyphName, a,
    //    // draw the outline command by command to the new glif
    //    function(pen) {
    //        a.outline.forEach(function(command) {
    //            this[command[0]].apply(this, command.slice(1))
    //        }, pen)
    //    })
    //    targetGlyphSet.writeContents(false)
    
    
    
        // trying to get posttenstion:
        
        function pretension(p0, p1, p2, p3) {
            console.log('direction t of p' + p0['-'](p1));
            
            
        }
        
        
        var p0 = new Vector(100,220)
          , p1 = new Vector(230,280)
          , p2 = new Vector(400,250)
          , p3 = new Vector(500,150)
          ;
        
    
        pretension(p0, p1, p2, p3)
    
    
    
    }
    
    module = {main: main};
    Object.defineProperty(module, 'help', {
        get: argumentParser.toString.bind(argumentParser)
    });
    return module;
})
