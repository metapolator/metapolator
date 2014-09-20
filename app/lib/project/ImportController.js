define([
    'metapolator/errors'
  , 'ufojs/ufoLib/glifLib/GlyphSet'
  , './import/SegmentPen'
  , './import/ImportOutlinePen'
  , './import/StrokeContour'
  
  , 'metapolator/models/CPS/elements/AtNamespaceCollection'
  , 'metapolator/models/CPS/elements/AtRuleName'
  , 'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/elements/ParameterDict'
  , 'metapolator/models/CPS/elements/Parameter'
  , 'metapolator/models/CPS/elements/ParameterName'
  , 'metapolator/models/CPS/elements/ParameterValue'
  , 'complex/Complex'
  , 'metapolator/models/CPS/parsing/parseSelectorList'
  , 'winston'
  , 'ufojs/ufoLib/glifLib/misc'
], function(
    errors
  , GlyphSet
  , SegmentPen
  , ImportOutlinePen
  , StrokeContour
  
  , AtNamespaceCollection
  , AtRuleName
  , Rule
  , ParameterDict
  , Parameter
  , ParameterName
  , ParameterValue
  , Complex
  , parseSelectorList
  , winston
  , ufojsmisc
) {
    "use strict";
    
    function ImportController(project, masterName, sourceUFODir) {
        this._project = project;
        this._masterName = masterName;
        
        if(this._project.hasMaster(masterName))
            this._master = this._project.getMaster(masterName);
        else
            this._master = this._project.createMaster(masterName);
        
        // open the source ufo glyphs layer of an UFOv2
        this._sourceGlyphSet  = this._project.getNewGlyphSet(
                false, [sourceUFODir, 'glyphs'].join('/'), undefined, 2 );

        // tell us about errors instead of throwing the partially loaded glyph away
        var x = new (winston.Logger)({
            transports: [ new (winston.transports.Console)() ]
        });
        Object.defineProperty(x, 'glyphName', {
            get: function(){ return this._glyphName; } ,
            set: function(v){ this._glyphName = v; } 
        });
        ufojsmisc.logger = x;
        x.on('logging', function (pm, transport, level, msg, meta) {
            var glyphName = ufojsmisc.logger.glyphName;
            if( glyphName && level == 'error' ) {
                console.log("FAILED TO IMPORT GLYPH:" + glyphName );
                console.log("original bt:" + meta.err.stack );
                pm.rememberThatImportFailedForGlyph( glyphName, msg );
            }
        }.bind( null, this._master ));

    }
    var _p = ImportController.prototype;
    
    _p.import = function(glyphs) {
        var missing, i=0
          , rules = []
          , cps
          ;
        
        if(!glyphs)
            glyphs = this._sourceGlyphSet.keys();
        else {
            missing = glyphs.filter(function(name) {
                        return !this._sourceGlyphSet.has_key(name);}, this)
            if(missing.length)
                throw new errors.Key('Some glyphs requested for import '
                                    +'are missing in the source GlyphSet: '
                                    +missing.join(', '));
        }
        console.log('importing ...');
        for(;i<glyphs.length;i++) {
            var glyphName = glyphs[i];
            Array.prototype.push.apply(rules, this.importGlyph( glyphName ));
        }
        this._master.glyphSet.writeContents(false);
        this._master.saveMetaData();
        
        // a namespace for the master ...
        cps = new AtNamespaceCollection(
                new AtRuleName('namespace', [])
              , parseSelectorList.fromString('master#'+this._masterName)
              , rules
        );
        
        // this just overrides the local cps file
        // we might come up with some smart merging in the future, in such
        // a way, that it is possible to import changed glyphs into an
        // existing cps files, changing only the new glyphs and keeping
        // the old ones. But that ain't gonna be easy.
        this._master.saveLocalCPS(cps);
    }
    
    _p._readGlyphFromSource = function(glyphName) {
        var glyph = this._sourceGlyphSet.get(glyphName)
          , segmentPen = new SegmentPen()
          , pen = new ImportOutlinePen(segmentPen, true)
          ;
        
        glyph.drawPoints(false, pen);
        return {data:glyph, contours:segmentPen.flush()};
    }

    _p.importGlyph = function(glyphName) {
        console.log('> importing glyph:', glyphName);
        var sourceGlyph = this._readGlyphFromSource(glyphName)
          , targetGlyph
          , contours = []
          , i=0
            // the index at which the contour will be addressable in CPS
          , penStrokeIndex = 0
          , rules = []
          ;
        for(;i<sourceGlyph.contours.length;i++) {
            if(!sourceGlyph.contours[i].closed) {
                console.log('    skipping contour '+ i +' because it is open.');
                continue;
            }
            if(sourceGlyph.contours[i].commands.length < 5) {
                console.log('    skipping contour '+ i +' because it has less '
                                            +'than 4 on-curve points.');
                continue;
            }
            if(!(sourceGlyph.contours[i].commands.length % 2)) {
                 console.log('    skipping contour '+ i +' because count of '
                                            +'on-curve points is uneven');
                continue;
            }
            console.log('    importing contour '+ i);
             // the z points of this stroke can go directly to the skeleton glyph
            var penStrokeData = new StrokeContour(
                        sourceGlyph.contours[i].commands).getPenStroke(true);
            
            // this goes into the glyph/skeleton
            contours.push(penStrokeData);
            
            // draws only the center line using the absolute points, no
            // hobby or so for the moment. Because we don't use the control
            // points of the skeleton as reference, it might be also an
            // option to draw the centerline with tension = 1, to get a
            // sort of "normalized" skeleton line.
            // ... will try out when I have time
            // makeSkeletonContour(penStroke)
            
            // this goes into the glyph
            // returns an atNamespaceRule(penstroke:i({penStrokeIndex})){ points ... }
            rules.push(makeCPSPenStrokeRule(penStrokeData, penStrokeIndex));
            
            
            penStrokeIndex += 1;
        }
        
        this._master.glyphSet.writeGlyph(false, glyphName, sourceGlyph.data,
            // draw the outline to the new glif
            drawPenStroke.bind(null, contours)
        )
        
        return [new AtNamespaceCollection(
                    new AtRuleName('namespace', [])
                  , parseSelectorList.fromString('glyph#'+(glyphName.replace('.', '\\.')))
                  , rules)
                ];
    }
    
    function drawPenStroke(contours, pen) {
        var i=0, j, segmentType;
        
        for(;i<contours.length;i++) {
            pen.beginPath()
            // draw just the skeleton
            for(j=0;j<contours[i].length;j++) {
                if(j===0)
                    // this is a non closed path
                    segmentType = 'move';
                else if(contours[i][j].z.in !== undefined) {
                    segmentType = 'curve';
                    pen.addPoint(contours[i][j].z.in.vector.valueOf())
                }
                else
                    segmentType =  'line';
                pen.addPoint(contours[i][j].z.on.vector.valueOf(), segmentType)
                if(contours[i][j].z.ou !== undefined)
                    pen.addPoint(contours[i][j].z.ou.vector.valueOf())
            }
            pen.endPath();
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
                // Vector is instanceof Complex, too
                ( obj[k] instanceof Complex 
                    ? [obj[k].real, obj[k].imag].join(',')
                    : obj[k] )], []);
            items.push(new Parameter(name, value))
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
     */
    function makeCPSPointRules(point, index) {
        var rules = []
          , left, center, right
          , selectorList
          , zon = point.z.on.vector
          ;
        
        // center
        selectorList = parseSelectorList.fromString('point:i('+index+') > center')
        center = {
            onIntrinsic:  '0,0'
        }
        if(point.z.in !== undefined) {
            center.inIntrinsic = point.z.in.vector['-'](zon)
            center.inTension = point.z.inTension;
            center.inDirIntrinsic = point.z.inDir;
        }
        if(point.z.ou !== undefined) {
            center.outIntrinsic = point.z.ou.vector['-'](zon)
            center.outTension = point.z.ouTension
            center.outDirIntrinsic = point.z.ouDir
        }
        rules.push(
            new Rule(selectorList, parameterDictFromObject(center)));
        
        // left
        selectorList = parseSelectorList.fromString('point:i('+index+')>left')
        left = {
            onIntrinsic: point.l.on.vector['-'](zon)
        }
        if(point.l.in !== undefined) {
            left.inIntrinsic = point.l.in.vector['-'](zon)
                                                ['-'](center.inIntrinsic)
                                                ['-'](left.onIntrinsic);
            left.inDirIntrinsic = point.l.inDir['-'](point.z.inDir);
            left.inTension = point.l.inTension
        }
        if(point.l.ou !== undefined) {
            left.outIntrinsic = point.l.ou.vector['-'](zon)
                                                 ['-'](center.outIntrinsic)
                                                 ['-'](left.onIntrinsic);
            left.outDirIntrinsic = point.l.ouDir['-'](point.z.ouDir);
            left.outTension = point.l.ouTension;
        }
        rules.push(
            new Rule(selectorList, parameterDictFromObject(left)));
        
        //right
        selectorList = parseSelectorList.fromString('point:i('+index+')>right');
        right = {
            onIntrinsic: point.r.on.vector['-'](zon)
        }
        if(point.r.in !== undefined) {
            right.inIntrinsic = point.r.in.vector['-'](zon)
                                                 ['-'](center.inIntrinsic)
                                                 ['-'](right.onIntrinsic);
            right.inDirIntrinsic = point.r.inDir['-'](point.z.inDir);
            right.inTension = point.r.inTension
        }
        if(point.r.ou !== undefined) {
            right.outIntrinsic = point.r.ou.vector['-'](zon)
                                                  ['-'](center.outIntrinsic)
                                                  ['-'](right.onIntrinsic);
                                                 
                                                 
            right.outDirIntrinsic = point.r.ouDir['-'](point.z.ouDir);
            right.outTension = point.r.ouTension;
        }
        rules.push(
            new Rule(selectorList, parameterDictFromObject(right)));
        
        return rules;
    }
    
    /**
     * returns an atNamespaceRule(penstroke:i({penStrokeIndex}))
     */
    function makeCPSPenStrokeRule(penStrokeData, index) {
        var name = new AtRuleName('namespace', [])
          , selectorList = parseSelectorList.fromString('penstroke:i('+index+')')
          , i = 0
          , items = []
          ;
        for(;i<penStrokeData.length;i++)
            Array.prototype.push.apply(
                items, makeCPSPointRules(penStrokeData[i], i));
        
        
        return new AtNamespaceCollection(name, selectorList, items);
    }
    
    
    return ImportController;
});

