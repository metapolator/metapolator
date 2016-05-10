define([
    'Atem-MOM/errors'
  , 'ufojs/errors'
  , 'obtain/obtain'
  , 'Atem-MOM/cpsTools'
  , 'Atem-Math-Tools/Vector'
  , './ufo/SegmentPen'
  , './ufo/ImportOutlinePen'
  , './ufo/StrokeContour'
  , './ufo/contourFromContour'

  , 'Atem-MOM/MOM/Master'
  , 'Atem-MOM/MOM/Glyph'
  , 'Atem-MOM/MOM/PenStroke'
  , 'Atem-MOM/MOM/PenStrokeCenter'
  , 'Atem-MOM/MOM/Contour'
  , 'Atem-MOM/MOM/ContourPoint'
  , 'Atem-MOM/MOM/Component'

], function(
    errors
  , ufojsErrors
  , obtain
  , cpsTools
  , Vector
  , SegmentPen
  , ImportOutlinePen
  , StrokeContour
  , contourFromContour

  , Master
  , Glyph
  , PenStroke
  , PenStrokeCenter
  , Contour
  , ContourPoint
  , Component
) {
    "use strict";
    // jshint esnext:true

    var GlifLibError = ufojsErrors.GlifLib
      , setElementProperties = cpsTools.setElementProperties
      , NotImplementedError = errors.NotImplemented
      , ImportError = errors.Import
      ;

    /**
     * options:
     * {
     *    // String: Set the UFO Layer to import.
     *    // default: undefined (imports the default layer)
     *    layerName: 'aLayerName'
     *
     *    // String: Set the name (id) of the mom master. Usually you want
     *    // this to be present, but in some cases it can be useful not
     *    // setting an id.
     *    // default: undefined
     *    masterName: 'base'
     *
     *    // Dict: glyphs groups as returned by ufoReader.readGroups
     *    // will be used as a source for class names of the glyphs
     *    // if present
     *    // default: undefined
     *    classes: {groupName: ['glyph', 'names' ...] },
     *
     *    // Boolean: use the groups of the source UFO as a source for
     *    // class names of the glyphs
     *    // default:
     *    addSourceGlyphClasses: true,
     *
     *    // Dict: map prefixes of UFO contour identifiers to contour
     *    // import types.
     *    // default:
     *    contourImportTypeIndicators: {
     *         'C:': 'Contour'
     *       , 'P:': 'PenStroke'
     *    },
     *
     *    // String: set the default contour import type in case no
     *    // contourImportTypeIndicator matches.
     *    defaultContourContourImportType: 'PenStroke'
     *
     *    // Dict: Map ImportType to ImportType.
     *    // If a type can't be created from the contour, this maps to
     *    // a fallback type. E.g. if a "PenStroke" type can't be imported
     *    // the default setup tries to import a "Contour"
     *    // default:
     *    contourImportTypeFallbacks: { 'PenStroke': 'Contour' },
     *
     *    // Boolean: import open contours if false.
     *    // This is untested and at the moment probably incompatible with
     *    // the rest of the MOM Tools and maybe even failing in here.
     *    // default:
     *    skipOpenContours: true
     * }
     *
     * Available contour import types: PenStroke, Contour
     */
    function UFOImporter(log, ufoReader, options) {
        var options_ = options || {};
        this._log = log;
        this._ufoReader = ufoReader;
        this._glyphClasses = null;
        this._sourceGlyphClasses = null;

        // falsy means: take the default layer
        this._layerName = options_.layerName || undefined;

        this._masterName = options_.masterName || null;

        if(options_.classes)
            this._glyphClasses = this._reverseGlyphGroups(options_.classes);

        this._addSourceGlyphClasses = 'addSourceGlyphClasses' in options_
                ? !!options_.addSourceGlyphClasses
                : true
                ;

        this._indicatorToContourImportType = options_.contourImportTypeIndicators
                 || {
                          'C': 'Contour'
                        , 'P': 'PenStroke'
                    };

        this._defaultContourImportType = options_.defaultContourContourImportType
                || 'PenStroke';

        this._contourImportTypeFallbacks = options_.contourImportTypeFallbacks
                || { 'PenStroke': 'Contour' };

        this._skipOpenContours = 'skipOpenContours' in options_
                ? !!options_.skipOpenContours
                : true
                ;
    }
    var _p = UFOImporter.prototype;

    _p._reverseGlyphGroups = function(groups) {
        var result = Object.create(null)
          , group, i, l, glyphName
          ;
        for(group in groups) {
            for(i=0,l=groups[group].length;i<l;i++) {
                glyphName = groups[group][i];
                if(!(glyphName in result))
                    result[glyphName] = [];
                result[glyphName].push(group);
            }
        }
        return result;
    };

    _p._getSourceGlyphClasses = function(async) {
        var sourceGroups = this._ufoReader.readGroups(true)
          , onData = (function(sourceGroups) {
                return this._reverseGlyphGroups(sourceGroups);
            }).bind(this)
          ;
        if(async)
            return sourceGroups.then(onData);
        return sourceGroups;
    };

    /**
     * NOTE: This performs IO via ufoReader.getGlyphSet
     */
    _p._getSourceGlyphSet = function(async) {
        var options;
        // tell us about errors
        options = {
            readErrorCallback: function( masterName, metadata ) {
                this._log.warning('ImportController: Got an error loading glyph "'
                                + metadata.glyphName + ' for master '
                                + (masterName ?  '"'+ masterName +'"' : '(unnamed)')
                                + ' reason:' + metadata.message );
                // try to continue
                return true;
            }.bind( this, this._masterName )
        };

        return this._ufoReader.getGlyphSet(
                            async, this._layerName, undefined, options);
    };

    _p.init = obtain.factory(
        {
            init: [function() {
                this._sourceGlyphSet = this._getSourceGlyphSet(false);
                if(this._addSourceGlyphClasses)
                    this._sourceGlyphClasses = this._getSourceGlyphClasses(false);
                return this;
            }]
        }
      , {
            classes: [true, _p._getSourceGlyphClasses]
          , glyphSet: [true, _p._getSourceGlyphSet]

          , init: ['glyphSet', 'classes', function(glyphSet, classes) {
                this._sourceGlyphSet = glyphSet;
                this._sourceGlyphClasses = classes;
                return this;
            }]
        }
      , []
      , function(obtain){ return obtain('init'); }
    );

    UFOImporter.factory = function(async /* , UFOImporter arguments .... */ ) {
        var instance = Object.create(UFOImporter.prototype)
          , args = Array.prototype.slice.call(arguments, 1)
          ;
        UFOImporter.apply(instance, args);
        return instance.init(async);
    };

    /**
     * processCallback is optional.
     * If processCallback is given  and returns `false` we abort.
     * processCallback can be used to display progress it is called like:
     *          processCallback(glyphName, index, numberOfGlyphs);
     *
     * TODO: This should probably become a generator, so that we can
     *       update the display between iterations...
     */


    _p.doImport = function(async, glyphs) {
        var gen = this.importGenerator(async, glyphs), result;
        while(!(result = gen.next()).done);
        return result.value;
    };

    _p.importGenerator = function* (async, glyphs) {
        if(async)
            throw new NotImplementedError('doImport currently only supports '
                                                +'synchronous execution.');
        var missing, i, l
          , fontinfo, master
          ;

        if(!glyphs)
            glyphs = this._sourceGlyphSet.keys();
        else {
            missing = glyphs.filter(function(name) {
                        return !this._sourceGlyphSet.has_key(name);}, this);
            if(missing.length)
                throw new errors.Key('Some glyphs requested for import '
                                    +'are missing in the source GlyphSet: '
                                    + missing.join(', '));
        }

        fontinfo = this._ufoReader.readInfo(false);
        master = this._makeMaster(this._masterName, fontinfo);

        for(i=0,l=glyphs.length;i<l;i++) {
            var glyphName = glyphs[i], glyph, carryOn;
            carryOn = yield {i:i, total:l, 'glyphName':glyphName};
            if(carryOn === false) {
                this._log.info('Canceling UFO import of "'
                                            + this._ufoReader.path + '".');
                return false;
            }


            try {
                // in the end, getting a glyph from a glyphset can make
                // io, but because of the involved recursion in reading
                // components, there's no async path yet!
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

        return master;
    };

    _p._readGlyphFromSource = function(glyphName) {
            // this does io!
        var glyph = this._sourceGlyphSet.get(glyphName)
          , segmentPen = new SegmentPen()
          , pen = new ImportOutlinePen(segmentPen, true)
          ;

        glyph.drawPoints(false, pen);
        return {data:glyph, contours:segmentPen.flush()};
    };

    _p._makeMaster = function (masterName, fontinfo) {
        var master = new Master();
        if(masterName)
            master.id = masterName;
        if(fontinfo)
            master.attachData('fontinfo', fontinfo);
        return master;
    };

    _p._makeGlyph = function(glyphName, data) {
        var glyph = new Glyph()
          , key
          , properties = {}
          ;
        glyph.id = glyphName;

        // used in CPS:
        //  'width'      the advance with of the glyph
        //  'height'     the advance height of the glyph
        //
        // as data / not used:
        //  'unicodes'   a list of unicode values for this glyph
        //  'note'       a string
        //  'lib'        a dictionary containing custom data
        //  'image'      a dictionary containing image data
        //  'guidelines' a list of guideline data dictionaries
        //  'anchors'    a list of anchor data dictionaries
        //
        // TODO: Maybe we need another layer of MOM elements, analogous
        // to the structure in GLIF: outline, anchors, guidelines ...
        // what to do with lib? there's not much use to have it in cps.
        // The only thing is that it's there.

        if(data.width)
            properties.width = data.width;
        if(data.height)
            properties.height = data.height;
        setElementProperties(glyph, properties);

        for(key in data)
            if(!(key in {width:1, height:1}))
                glyph.attachData(key, data[key]);

        if(this._glyphClasses && glyphName in this._glyphClasses)
            glyph.setClasses(this._glyphClasses[glyphName]);
        if(this._sourceGlyphClasses && glyphName in this._sourceGlyphClasses)
            glyph.setClasses(this._sourceGlyphClasses[glyphName]);
        return glyph;
    };

    _p._makeComponent = function(item) {
        var component = new Component();
        setElementProperties(component, {
            baseGlyphName: '"' + item.glyphName + '"'
          , transformation:  'Transformation ' + item.transformation.join(' ')
        });
        return component;
    };

    _p._makeCPSPointData = function (point, index, length) {
        var left={}, center={}, right={}
          , rightOnIntrinsic
          ;

        // center
        center.on = point.z.on;
        center.in = point.z.in;
        center.out = point.z.out;

        // In cases where the general rules:
        //     inDir: (on - in):angle;
        //     outDir: (out - on):angle;
        // produce worse results
        if(point.z.inLength === 0) {
            center.inDir = point.z.inDir;
        }
        if(point.z.outLength === 0){
            center.outDir = point.z.outDir;
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
    };


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

    function toPropertyLanguage(data) {
        var k, value, result = {};
        for(k in data) {
            value = data[k];
            if(value instanceof Vector)
                value = 'Vector ' + value.x + ' ' + value.y;
            result[k] = value;
        }

        return result;
    }

    _p._makePenStroke = function (penStrokeData) {
        //jshint unused:vars
        var penstroke = new PenStroke()
          , pointData
          , i, l, point, data, name, identifier
          ;
        for(i=0,l=penStrokeData.length;i<l;i++) {
            pointData = penStrokeData[i];

            data = this._makeCPSPointData(pointData, i, penStrokeData.length);
            point = new PenStrokeCenter();

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


            setElementProperties(point, toPropertyLanguage(data.center));
            setElementProperties(point.left, toPropertyLanguage(data.left));
            setElementProperties(point.right, toPropertyLanguage(data.right));
            penstroke.add(point);
        }
        return penstroke;
    };


    _p._makeCPSContourPoinData = function (point, index, list) {
        //jshint unused:vars
        var data={};
        data.on = point.on;
        data.inDir = point.inDir;
        data.inLength = point.inLength;
        data.outDir = point.outDir;
        data.outLength = point.outLength;

        // In cases where we have no magnitude
        if(point.inLength === 0)
            data['in'] = 'on';
        if(point.outLength === 0)
            data.out = 'on';


        return data;
    };

    _p._makeContour = function (contourData, isOpen) {
        var contour = new Contour()
          , pointData, cpsData
          , i,l,point, name, identifier
          ;
        for(i=0,l=contourData.length;i<l;i++) {
            pointData = contourData[i];
            point = new ContourPoint();

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


            cpsData = this._makeCPSContourPoinData(pointData, i);
            setElementProperties(point, toPropertyLanguage(cpsData));
            contour.add(point);
        }
        if(isOpen)
            setElementProperties(contour, {open: 1});

        return contour;
    };

    _p._getContourImportType = function(id) {
        var indicatorIndex = id ? id.indexOf(':') : -1
          , indicator
          , type
          ;

        if(indicatorIndex !== -1) {
            indicator = id.slice(0, indicatorIndex);
            type = this._indicatorToContourImportType[indicator];
        }
        return type || this._defaultContourImportType;
    };

    _p._importContour = function(contourImportType, item, id, i, glyphName) {
        var data, node;

        this._log.debug('Glyph "'+glyphName+'" importing contour '
                                            + i +' ' + (id ? ('#' + id + ' ') : '')
                                            + 'as MOM ' + contourImportType + '.');
        switch (contourImportType) {
            case 'Contour':
                if(!item.closed && this._skipOpenContours) {
                    this._log.info('Skipping import as MOM-Contour of outline item '
                                        + i +' ' + (id ? ('#' + id + ' ') : '')
                                        + 'because it is open.');
                    return false;
                }
                // NOTE: I did not test importing open contours and
                // it is not further supported in contourFromContour so far.
                // But the effort to make a valid MOM contour from an open
                // ufo-contour should not be that big.
                // Also, the rendering routines need then to learn about
                // open contours.
                data = contourFromContour(item.commands);
                // no classes available yet (due to ufo not offering names here)
                node = this._makeContour(data, !item.closed);
                break;
            case 'PenStroke':
                // import as penstroke if possible
                // FIXME: should this be item.commands.length < 4?
                // FIXME: import a closed contour of 2 points as a penstroke
                //        with two terminals, no centerline
                if(item.commands.length < 5) {
                    this._log.info('Skipping import as MOM-Penstroke of outline item '
                                        + i +' ' + (id ? ('#' + id + ' ') : '')
                                        +'because it has less '
                                        + 'than 4 on-curve points.');
                    return false;
                }
                if(item.commands.length % 2 === 0) {
                    this._log.info('Skipping import as MOM-Penstroke of outline item '
                                            + i +' ' + (id ? ('#' + id + ' ') : '')
                                            +'because count of '
                                            + 'on-curve points is uneven');
                    return false;
                }
                data = new StrokeContour(item.commands).getPenStroke();
                node = this._makePenStroke(data);
                break;
            default:
                throw new ImportError('Import type of outline item '
                                    + i +' ' + (id ? ('#' + id + ' ') : '')
                                    + '"' + contourImportType + '" is unknown.');
        }

        if(id)
            node.id = id;
        return node;
    };

    /**
     * Todo: it must become much more flexible, to configure how a glyph
     * is imported. It may be wished to make contour the default, when
     * just plain interpolation is the aim, or to go into a MOM-Prepolator
     * or MOM-Editor.
     * contourIndicator should be accompanied by a penstrokeIndicator "P:"
     * Both should be configurable.
     *
     * When a path can't be imported as a penstroke, it should be possible
     * to define a fallback. Probably to import it as a contour (default).
     * or to skip it.
     *
     * What to do with non-closed contours? Can Contour handle that?
     * A simple "closed: 0" property on the contour element could be all
     * it needs.
     * -> also add a switch here "skipOpenContours" : true/false
     */
    _p.importGlyph = function(glyphName) {
        this._log.info('### glyph:', glyphName);
        var sourceGlyph = this._readGlyphFromSource(glyphName)
          , item
          , i,l
            // the index at which the contour will be addressable in CPS
          , glyph
          , id
          , contourImportType
          , outlineItem
          , tried
          ;
        glyph = this._makeGlyph(glyphName, sourceGlyph.data);

        for(i=0,l=sourceGlyph.contours.length;i<l;i++) {
            item = sourceGlyph.contours[i];

            // component
            if(item.type == 'component' ) {
                outlineItem = this._makeComponent(item);
                glyph.add(outlineItem);
                continue;
            }
            // find out how to import

            id = item.kwargs && item.kwargs.identifier || null;
            contourImportType = this._getContourImportType(id);
            outlineItem = false;
            tried = new Set();
            while(contourImportType) {
                tried.add(contourImportType);
                // NOTE: this keeps the indicator (C:) in tact as id, if there
                // is any. It's likely that some of the CPS stuff needs to
                // be touched, to be able to handle colons in an idea.
                // However, it's about time to implement escaping for CPS
                // anyways.
                outlineItem = this._importContour(contourImportType, item, id, i, glyphName);
                if(outlineItem) {
                    glyph.add(outlineItem);
                    break;
                }
                // see if there is a fallback defined
                contourImportType = this._contourImportTypeFallbacks[contourImportType];
                if(tried.has(contourImportType)) {
                    this._log.warning('Don\'t know how to import outline item '
                                    + i + ' ' + (id ? ('#' + id + ' ') : ''));
                    break;
                }
                this._log.info('Try fallback import type MOM-' + contourImportType
                    + 'for outline item ' + i +' ' + (id ? ('#' + id + ' ') : '')
                    );
            }
        }
        return glyph;
    };

    return UFOImporter;
});

