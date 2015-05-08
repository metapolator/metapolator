define([
    'metapolator/errors'
  , 'ufojs/ufoLib/glifLib/GlyphSet'
  , './import/SegmentPen'
  , './import/ImportOutlinePen'
  , './import/StrokeContour'
  , './import/contourFromContour'

  , 'metapolator/models/CPS/elements/ParameterCollection'
  , 'metapolator/models/CPS/elements/AtNamespaceCollection'
  , 'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/elements/ParameterDict'
  , 'metapolator/models/CPS/elements/Parameter'
  , 'metapolator/models/CPS/elements/ParameterName'
  , 'metapolator/models/CPS/elements/ParameterValue'
  , 'metapolator/math/Vector'

  , 'metapolator/models/CPS/parsing/parseSelectorList'
  , 'ufojs/errors'

], function(
    errors
  , GlyphSet
  , SegmentPen
  , ImportOutlinePen
  , StrokeContour
  , contourFromContour

  , ParameterCollection
  , AtNamespaceCollection
  , Rule
  , ParameterDict
  , Parameter
  , ParameterName
  , ParameterValue
  , Vector

  , parseSelectorList
  , ufojsErrors
) {
    "use strict";
    /*global console:true*/
    /*jshint  sub:true*/

    var GlifLibError = ufojsErrors.GlifLib;

    function ImportController(io, log, project, masterName, sourceUFODir) {
        this._io = io;
        this._project = project;
        this._log = log;
        this._masterName = masterName;

        if(this._project.hasMaster(masterName))
            this._master = this._project.getMaster(masterName);
        else
            this._master = this._project.createMaster(masterName,
                                                      masterName + '.cps',
                                                      'skeleton.' + masterName);
        this._sourceUFODir = sourceUFODir;
        this._sourceGlyphSet = undefined;
    }
    var _p = ImportController.prototype;

    /**
     * NOTE: This performs synchronous IO via this._project.getGlyphSet
     */
    _p._getSourceGlyphSet = function() {
        var options;
        if(!this._sourceGlyphSet) {
            // tell us about errors instead of throwing it away
            options = {
                readErrorCallback: function( projectMaster, metadata ) {
                    this._log.warning("ImportController: Got an error loading glyph '"
                                    + metadata.glyphName + "' reason:" + metadata.message );
                    // try to continue
                    return true;
                }.bind( null, this._master )
            };

            console.log("maybe here?")
            this._sourceGlyphSet = GlyphSet.factory(
                    false, this._io, this._sourceUFODir + "/glyphs", undefined, /*UFOVersion*/ 2 /*FIXME: this is a hardcoded value!*/, options);
            console.log("yes, perhaps...")
        }
        return this._sourceGlyphSet;
    };

    _p['import'] = function(glyphs) {
        var missing, i=0
          , rules = []
          , cps
          , sourceGlyphSet = this._getSourceGlyphSet(false)
          ;

        if(!glyphs)
            glyphs = sourceGlyphSet.keys();
        else {
            missing = glyphs.filter(function(name) {
                        return !sourceGlyphSet.has_key(name);}, this);
            if(missing.length)
                throw new errors.Key('Some glyphs requested for import '
                                    +'are missing in the source GlyphSet: '
                                    +missing.join(', '));
        }
        console.warn('importing ...');
        for(;i<glyphs.length;i++) {
            var glyphName = glyphs[i];
            try {
                var g = this.importGlyph(glyphName);
                Array.prototype.push.apply(rules, g);
            }
            catch(error) {
                if(error instanceof GlifLibError) {
                    // we have already recorded this in the error
                    // callback function
                } else {
                    throw error;
                }
            }
        }

        this._master.glyphSet.writeContents(false);

        cps = new ParameterCollection(rules);

        // This just overrides the local CPS file
        // We might come up with some smart merging in the future, so that
        // it is possible to import changed glyphs into an existing CPS
        // files, changing only the new glyphs and keeping the old ones. But
        // that ain't gonna be easy.
        this._master.saveCPS(this._masterName + '.cps', '@import "' + this._project.cpsOutputConverterFile + '";\n@import "' + this._project.cpsGlobalFile + '";\n\n' + cps);
    };

    _p._readGlyphFromSource = function(glyphName) {
        var sourceGlyphSet = this._getSourceGlyphSet(false)
          , glyph = sourceGlyphSet.get(glyphName)
          , segmentPen = new SegmentPen()
          , pen = new ImportOutlinePen(segmentPen, true)
          ;

        glyph.drawPoints(false, pen);
        return {data:glyph, contours:segmentPen.flush()};
    };

    _p.importGlyph = function(glyphName) {
        console.warn('> importing glyph:', glyphName);
        var sourceGlyph = this._readGlyphFromSource(glyphName)
          , targetGlyph
          , contours = []
          , item
          , i=0
            // the index at which the contour will be addressable in CPS
          , parentIndex = 0
          , rules = []
          , id
          // If the identifier starts with C: (for *C*ontour)
          , contourIndicator = 'C:'
          ;
        for(;i<sourceGlyph.contours.length;i++) {
            item = sourceGlyph.contours[i];

            // component
            if(item.type == 'component' ) {
                contours.push(item);
                parentIndex += 1;
                continue;
            }

            if(!item.closed) {
                console.warn('    skipping contour '+ i +' because it is open.');
                continue;
            }

            // import as contour
            id = undefined;
            try {
                id = item.kwargs.identifier;
            }
            catch(error) {
                //TypeError: Cannot read property 'identifier' of undefined
                if(!(error instanceof TypeError))
                    throw error;
            }
            if(id && id.slice(0, contourIndicator.length) === contourIndicator) {
                Vector.prototype._cps_whitelist.inspect = 'inspect';
                console.warn('importing contour '+ i + ' as contour');
                var contourData = contourFromContour(item.commands);
                contours.push({
                      type:'contour'
                    , data: contourData
                    , kwargs: item.kwargs
                });
                rules.push(makeCPSContourRule(contourData, parentIndex));
                parentIndex += 1;
                continue;
            }

            // import as penstroke if possible
            if(item.commands.length < 5) {
                console.warn('    skipping contour '+ i +' because it has less '
                                            +'than 4 on-curve points.');
                continue;
            }
            if(item.commands.length % 2 === 0) {
                 console.warn('    skipping contour '+ i +' because count of '
                                            +'on-curve points is uneven');
                continue;
            }
            console.warn('importing contour '+ i + ' as penstroke');
             // the z points of this stroke can go directly to the skeleton glyph
            var penStrokeData = new StrokeContour(item.commands).getPenStroke();
            // this goes into the glyph/skeleton
            contours.push({
                  type:'penstroke'
                , data:penStrokeData
                , kwargs: item.kwargs
            });

            // this goes into the glyph
            // returns an atNamespaceRule(penstroke:i({parentIndex})){ points ... }
            rules.push(makeCPSPenStrokeRule(penStrokeData, parentIndex));
            parentIndex += 1;
        }

        this._master.glyphSet.writeGlyph(false, glyphName, sourceGlyph.data,
            // draw the outline to the new glif
            draw.bind(null, contours)
        );

        return [new AtNamespaceCollection(
                    'namespace'
                  , parseSelectorList.fromString('glyph#'+(glyphName.replace('.', '\\.')))
                  , rules)
                ];
    };

    function draw(contours, pen) {
        var i=0, j, segmentType, point, item, command;

        for(;i<contours.length;i++) {
            item = contours[i];
            if( item.type == 'component' ) {
                pen.addComponent( item.glyphName, item.transformation, item.kwargs );
            }
            else if(item.type == 'contour') {
                // everything is a curve, so this is easy
                pen.beginPath(item.kwargs);
                for(j=0;j<item.data.length;j++) {
                    point = item.data[j]['in'];
                    pen.addPoint(point.valueOf(), undefined, undefined, point.name);
                    point = item.data[j]['on'];
                    pen.addPoint(point.valueOf(), 'curve', undefined, point.name);
                    point = item.data[j]['out'];
                    pen.addPoint(point.valueOf(), undefined, undefined, point.name);
                }
                pen.endPath();
            }
            else { // item.type === 'penstroke'
                pen.beginPath(item.kwargs);
                // draw just the centerline
                for(j=0;j<item.data.length;j++) {
                    if(j===0)
                        // this is a non closed path
                        segmentType = 'move';
                    else {
                        segmentType = 'curve';

                        point = item.data[j-1].z.out;
                        pen.addPoint(point.valueOf(), undefined
                                     , undefined, point.name);

                        point = item.data[j].z['in'];
                        pen.addPoint(point.valueOf(), undefined
                                     , undefined, point.name);
                    }
                    // we don't have line segments on skeletons
                    //    segmentType = 'line';
                    point = item.data[j].z.on;
                    pen.addPoint(point.valueOf(), segmentType
                                 , undefined, point.name);
                }
                pen.endPath();
            }
        }
    }

    function parameterDictFromObject(obj) {
        var items = []
          , k
          , name
          , value
          ;

        for(k in obj) {
            if(obj[k] === undefined)
                continue;
            name = new ParameterName(k, []);
            value = new ParameterValue([
                ( obj[k] instanceof Vector
                    ? 'Vector ' + [obj[k].real, obj[k].imag].join(' ')
                    : obj[k] )], []);
            items.push(new Parameter(name, value));
        }

        return new ParameterDict(items);
    }
    /**
     * returns a Rule point:i({index}){ ... data ... }
     *
     * This is VERY special knowledge about the structure of CPS CompoundValues
     * It knows for example how the CompoundValues are configured, etc.
     * This should be in a package together with the configuration
     * keyword: import plugins
     *
     * For terminals inDir and outDir are imported instead of inDirIntrinsic
     * and outDirIntrinsic, because they cannot be relative to the skeleton.
     *
     * If we can't extract useful values for controls, we create a rule
     * that places the control in question directly on the on-curve point
     * "in: on;" OR "out: on;" thus overriding the general rule here,
     * because we are very specific.
     */
    function makeCPSPointRules(point, index, length) {
        var rules = []
          , left={}, center={}, right={}
          , selectorList
          , rightOnIntrinsic
          ;

        // center
        // there's not much to import for center
        selectorList = parseSelectorList.fromString('point:i('+index+') > center');
        // In cases where the general rules:
        //     inDir: (on - in):angle;
        //     outDir: (out - on):angle;
        // produce worse results
        if(point.z.inLenght === 0) {
            center.inDir = point.z.inDir;
            center['in'] = 'on';
        }
        if(point.z.outLenght === 0){
            center.outDir = point.z.outDir;
            center.out = 'on';
        }
        if(Object.keys(center).length)
            rules.push(
                new Rule(selectorList, parameterDictFromObject(center)));


        rightOnIntrinsic = point.r.on['-'](point.z.on);
        // TODO: we could import onLength and onDir in ./tools/StrokeContour?
        // TODO: in rare cases this may be 0, we could still try to create
        //       a meaningful direction. StrokeContour does alredy something
        //        similar in its _findNextDirection function.
        // Don't import these values for left because they are dependent
        // on their right side counterpart in the defaults.cps setup.
        // left.onDir is defined as the inverse of right.onDir (+ deg 180)
        // left.onLength is defined being equal to right.onLength
        right.onLength = rightOnIntrinsic.magnitude();
        right.onDir = rightOnIntrinsic.angle();

        if(index === 0) {
            // opening terminal is not relative to skeleton
            left.inDir = point.l.inDir;
            right.inDir = point.r.inDir;
        }
        else {
            left.inDirIntrinsic = point.l.inDir - point.z.inDir;
            right.inDirIntrinsic = point.r.inDir - point.z.inDir;
        }
        if(index === length-1) {
            // ending terminal is not relative to skeleton
            left.outDir = point.l.outDir;
            right.outDir = point.r.outDir;
        }
        else {
            left.outDirIntrinsic = point.l.outDir - point.z.outDir;
            right.outDirIntrinsic = point.r.outDir - point.z.outDir;
        }

        left.inTension = point.l.inTension;
        right.inTension = point.r.inTension;

        left.inLength = point.l.inLength;
        right.inLength = point.r.inLength;

        if(point.l.inLength === 0)
            left['in'] = 'on';
        if(point.r.inLength === 0)
            right['in'] = 'on';

        left.outTension = point.l.outTension;
        right.outTension = point.r.outTension;

        left.outLength = point.l.outLength;
        right.outLength = point.r.outLength;

        if(point.l.outLength === 0)
            left.out = 'on';
        if(point.r.outLength === 0)
            right.out = 'on';

        selectorList = parseSelectorList.fromString('point:i('+index+')>left');
        rules.push(
            new Rule(selectorList, parameterDictFromObject(left)));
        selectorList = parseSelectorList.fromString('point:i('+index+')>right');
        rules.push(
            new Rule(selectorList, parameterDictFromObject(right)));

        return rules;
    }

    /**
     * returns an atNamespaceRule(penstroke:i({penStrokeIndex}))
     */
    function makeCPSPenStrokeRule(penStrokeData, index) {
        var name = 'namespace'
          , selectorList = parseSelectorList.fromString('penstroke:i('+index+')')
          , i = 0
          , items = []
          ;
        for(;i<penStrokeData.length;i++)
            Array.prototype.push.apply(
                items, makeCPSPointRules(penStrokeData[i], i, penStrokeData.length));

        return new AtNamespaceCollection(name, selectorList, items);
    }

    function makeCPSContourPointRules(point, index, length) {
        var rules = []
          , dict={}
          , selectorList
          , rightOnIntrinsic
          ;
        // there's not much to import for `p` (for *p*oint)
        selectorList = parseSelectorList.fromString('p:i('+index+')');
        // In cases where the general rules:
        //     inDir: (on - in):angle;
        //     outDir: (out - on):angle;
        // produce worse results
        if(point.inLenght === 0) {
            dict.inDir = point.inDir;
            dict['in'] = 'on';
        }
        if(point.outLenght === 0) {
            dict.outDir = point.outDir;
            dict.out = 'on';
        }
        if(Object.keys(dict).length)
            rules.push(
                new Rule(selectorList, parameterDictFromObject(dict)));
        return rules;
    }

    function makeCPSContourRule(contourData, index) {
        var name = 'namespace'
          , selectorList = parseSelectorList.fromString('contour:i('+index+')')
          , i = 0
          , items = []
          ;
        for(;i<contourData.length;i++)
            Array.prototype.push.apply(
                items, makeCPSContourPointRules(contourData[i], i));


        return new AtNamespaceCollection(name, selectorList, items);
    }

    return ImportController;
});

