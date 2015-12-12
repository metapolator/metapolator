define([
    'metapolator/errors'
  , 'ufojs/ufoLib/glifLib/GlyphSet'
  , 'ufojs/tools/misc/transform'
  , './import/SegmentPen'
  , './import/ImportOutlinePen'
  , './import/StrokeContour'
  , './import/contourFromContour'

  , 'metapolator/models/MOM/Master'
  , 'metapolator/models/MOM/Glyph'
  , 'metapolator/models/MOM/PenStroke'
  , 'metapolator/models/MOM/PenStrokePoint'
  , 'metapolator/models/MOM/Contour'
  , 'metapolator/models/MOM/ContourPoint'
  , 'metapolator/models/MOM/Component'
  , 'metapolator/models/MOM/PointData'

  , 'ufojs/errors'
  , 'metapolator/models/CPS/cpsTools'

], function(
    errors
  , GlyphSet
  , transform
  , SegmentPen
  , ImportOutlinePen
  , StrokeContour
  , contourFromContour

  , Master
  , Glyph
  , PenStroke
  , PenStrokePoint
  , Contour
  , ContourPoint
  , Component
  , PointData

  , ufojsErrors
  , cpsTools
) {
    "use strict";
    /*global console:true*/
    /*jshint  sub:true*/

    var GlifLibError = ufojsErrors.GlifLib
      , Transformation = transform.Transform
      , setElementProperties = cpsTools.setElementProperties
      ;

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
        var options
          , UFOversion
          ;
        if(!this._sourceGlyphSet) {
            // tell us about errors instead of throwing it away
            options = {
                readErrorCallback: function( projectMaster, metadata ) {
                    this._log.warning("ImportController: Got an error loading glyph '"
                                    + metadata.glyphName + "' reason:" + metadata.message );
                    // try to continue
                    return true;
                }.bind( this, this._master )
            };

            UFOversion = this._project._readUFOFormatVersion(false, this._sourceUFODir, this._io);
            this._sourceGlyphSet = GlyphSet.factory(false, this._io, this._sourceUFODir + "/glyphs", undefined, UFOversion, options);
        }
        return this._sourceGlyphSet;
    };

    _p['import'] = function(glyphs) {
        var missing, i=0
          , fontinfo, master
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

        fontinfo = this._project.getFontinfo();
        master = new Master(fontinfo);

        for(;i<glyphs.length;i++) {
            var glyphName = glyphs[i], glyph;
            try {
                glyph = this.importGlyph(glyphName);
            }
            catch(error) {
                if(!(error instanceof GlifLibError))
                    throw error;
                // we have already recorded this in the error
                // callback function
                continue;
            }
            master.add(glyph);
        }

        this._master.glyphSet.writeContents(false);

        // TODO: it should be possible to import changed glyphs into an
        // existing master files, changing only the new glyphs and keeping
        // the old ones. But that ain't gonna be easy, especially because
        // changed essences will need to be propagated.
        this._master.saveCPS(this._masterName + '.cps'
                        , '@import "' + this._project.cpsOutputConverterFile
                        + '";\n@import "' + this._project.cpsGlobalFile
                        + '";\n');

        return master;
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
        this._log.debug('> importing glyph:', glyphName);
        var sourceGlyph = this._readGlyphFromSource(glyphName)
          , contours = []
          , item
          , i,l
            // the index at which the contour will be addressable in CPS
          , parentIndex = 0
          , glyph, glyphClasses
          , id
          , outlineItem
          // If the identifier starts with C: (for *C*ontour)
          , contourIndicator = 'C:'
          ;
        // This is pretty much a code duplication of code from
        // ProjectMaster.loadMOM
        // a good indicator that we should merge some code paths
        // when this is done!
        glyph = new Glyph();
        glyph.id = glyphName;
        glyph.setUFOData(sourceGlyph.data);
        glyphClasses = this._project.getGlyphClassesReverseLookup();
        if(glyphName in glyphClasses)
            glyphClasses[glyphName].forEach(glyph.setClass, glyph);

        for(i=0,l=sourceGlyph.contours.length;i<l;i++) {
            item = sourceGlyph.contours[i];

            // component
            if(item.type == 'component' ) {
                contours.push(item);
                parentIndex += 1;
                outlineItem = new Component(item.glyphName, new Transformation( item.transformation ));
                glyph.add(outlineItem);
                continue;
            }

            if(!item.closed) {
                this._log.debug('    skipping contour '+ i +' because it is open.');
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
                this._log.debug('importing contour '+ i + ' as contour');
                var contourData = contourFromContour(item.commands);
                contours.push({
                      type:'contour'
                    , data: contourData
                    , kwargs: item.kwargs
                });

                outlineItem = makeMOMContour(contourData, parentIndex);
                outlineItem.id = id.slice(contourIndicator.length);
                // no classes available yet (due to ufo not offering names here)
                glyph.add(outlineItem);

                parentIndex += 1;
                continue;
            }

            // import as penstroke if possible
            if(item.commands.length < 5) {
                this._log.debug('    skipping contour '+ i +' because it has less '
                                            +'than 4 on-curve points.');
                continue;
            }
            if(item.commands.length % 2 === 0) {
                 this._log.debug('    skipping contour '+ i +' because count of '
                                            +'on-curve points is uneven');
                continue;
            }
            this._log.debug('importing contour '+ i + ' as penstroke');
             // the z points of this stroke can go directly to the skeleton glyph
            var penStrokeData = new StrokeContour(item.commands).getPenStroke();
            // this goes into the glyph/skeleton
            contours.push({
                  type:'penstroke'
                , data:penStrokeData
                , kwargs: item.kwargs
            });

            outlineItem = makeMOMPenStroke(penStrokeData, parentIndex);
            if(id)
                outlineItem.id = id;
            // no classes available yet (due to ufo not offering names here)
            glyph.add(outlineItem);

            parentIndex += 1;
        }

        // save the skeleton
        this._master.glyphSet.writeGlyph(false, glyphName, sourceGlyph.data,
            // draw the outline to the new glif
            draw.bind(null, contours)
        );

        return glyph;
    };

    function draw(contours, pen) {
        var i=0, j, segmentType, point, item, command;
        // NOTE: there are no identifiers kept yet (they are skipped in)
        // StrokeContour _getMetapolatorPoint
        // TODO: it would maybe make sense to somehow merge left + right
        // identifier into the according identifier of in/on/out
        // and to demerge that in MOMPointPen
        // Where we however don't set left/right id's BUT
        // just point id.
        // Maybe, with some syntax for idenifiers we can specify all we
        // need ... (like on a left point identifier="P:mypointid;myownid")
        // same could be done for names, so we would not have create
        // these pesky left- and right- classes anymore.
        // see import/tools.mergeNames
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

    function makeCPSPointData(point, index, length) {
        var left={}, center={}, right={}
          , selectorList
          , rightOnIntrinsic
          ;

        // center
        // there's not much to import for center

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

        return {
            left: left
          , center: center
          , right: right
        };
    }


    /**
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

    function isNotEmptyString (item){ return !!item.length;}

    function makeMOMPenStroke(penStrokeData, index) {
        var penstroke = new PenStroke()
          , pointData
          , i, l, point, data, name, identifier
          ;
        for(i=0,l=penStrokeData.length;i<l;i++) {
            pointData = penStrokeData[i];

            data = makeCPSPointData(pointData, i, penStrokeData.length);
            point = new PenStrokePoint(new PointData(pointData.z));

            // we translate names into classes, because they don't have to be
            // unique
            // not these things are code duplication from MOMPointPen!
            name = pointData.z.on.name;
            if (name)
                (name.match(/\S+/g) || [])
                    .filter(isNotEmptyString)
                    .forEach(point.setClass, point);
            identifier = pointData.z.on.kwargs.identifier;
            if(identifier !== undefined)
                // MOM will have to check validity and uniqueness
                point.id = identifier;


            setElementProperties(point.center, data.center);
            setElementProperties(point.left, data.left);
            setElementProperties(point.right, data.right);
            penstroke.add(point);
        }
        return penstroke;
    }


    function makeCPSContourPoinData(point, index, length) {
        var data={}
          ;
        // there's not much to import for `p` (for *p*oint)
        // In cases where the general rules:
        //     inDir: (on - in):angle;
        //     outDir: (out - on):angle;
        // produce worse results
        if(point.inLenght === 0) {
            data.inDir = point.inDir;
            data['in'] = 'on';
        }
        if(point.outLenght === 0) {
            data.outDir = point.outDir;
            data.out = 'on';
        }
        return data;
    }

    function makeMOMContour(contourData, index) {
        var contour = new Contour()
          , pointData, cpsData
          , i,l,point, name, identifier
          ;
        for(i=0,l=contourData.length;i<l;i++) {
            pointData = contourData[i];
            point = new ContourPoint(new PointData(pointData));

            // Translate names into classes, because they don't have to be
            // unique.
            // NOTE: these things are code duplication from MOMPointPen!
            name = pointData.on.name;
            if (name)
                (name.match(/\S+/g) || [])
                    .filter(isNotEmptyString)
                    .forEach(point.setClass, point);
            identifier = pointData.on.kwargs.identifier;
            if(identifier !== undefined)
                // MOM will have to check validity and uniqueness
                point.id = identifier;


            cpsData = makeCPSContourPoinData(pointData, i);
            setElementProperties(point, cpsData);
            contour.add(point);
        }

        return contour;
    }

    return ImportController;
});

