define([
    'metapolator/errors'
  , 'ufojs/errors'
  , 'metapolator/models/MOM/Master'
  , 'metapolator/models/MOM/Glyph'
  , './MOMPointPen'
], function(
    errors
  , ufoErrors
  , Master
  , Glyph
  , MOMPointPen
) {
    "use strict";

    var IONoEntryError = ufoErrors.IONoEntry;

    function ProjectMaster(io, project, name, glyphSetDir, cpsFile) {
        this._io = io;
        this._project = project;
        this._name = name;
        this._glyphSetDir = glyphSetDir;
        this._cpsFile = cpsFile;
        this._glyphSet = undefined;
    }

    var _p = ProjectMaster.prototype;
    _p.constructor = ProjectMaster;

    Object.defineProperty(_p, 'glyphSet', {
        get: function() {
            if(!this._glyphSet)
                this._glyphSet = this._project.getNewGlyphSet(
                                            false, this._glyphSetDir);
            return this._glyphSet;
        }
    });

    // These saveCPS/deleteCPS methods are a bit odd. They don't belong here.
    _p.saveCPS = function(filename, cps) {
        this._io.writeFile(false, this._project.cpsDir+'/'+filename, cps);
    };

    _p.deleteCPS = function(filename) {
        try {
            this._io.unlink(false, this._project.cpsDir+'/'+filename);
        }
        catch(e) {
            if(!(e instanceof IONoEntryError))
                throw e;
        }
    };

    _p.loadMOM = function() {
        // create a MOM Master use this.glyphSet to create glyphs, penstrokes and points
        var fontinfo = this._project.getFontinfo()
          , master = new Master(fontinfo)
          , glyphNames = this.glyphSet.keys()
          , glyphName
          , ufoGlyph
          , glyph
          , i=0
          , classes
          ;
        if(glyphNames.length)
            classes = this._project.getGlyphClassesReverseLookup();
        for(;i<glyphNames.length;i++) {
            glyphName = glyphNames[i];
            ufoGlyph = this.glyphSet.get(glyphName);
            glyph = new Glyph();// FIXME do the stuff of setUFOData here!
            glyph.id = glyphName;
            if(glyphName in classes)
                classes[glyphName].forEach(glyph.setClass, glyph);
            // fetch glyph data and draw the glyph to the MOM
            ufoGlyph.drawPoints(false, new MOMPointPen(glyph));
            // FIXME: if possible remove all usages of `setUFOData`.
            // This can happen in the Constructor.
            // maybe, when event propagation for this stuf is built, we
            // can use this method again
            // Also, I think I don't like that the MOM knows about UFO.
            // That should not be the case. So maybe a stand setUFODataToGlyph
            // in here would be better...
            glyph.setUFOData(ufoGlyph);
            master.add(glyph);
        }
        return master;
    };

    return ProjectMaster;
});
