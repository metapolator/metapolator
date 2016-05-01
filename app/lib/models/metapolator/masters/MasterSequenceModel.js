define([
    './_ElementModel'
  , './MasterModel'
], function(
    Parent
  , MasterModel
){
    "use strict";
    function SequenceModel(name, parent, id, project) {
        this._project = project;
        this.id = id;
        this.name = name;
        this.level = "sequence";
        this.canEdit = true;
        this.parent = parent;
        this.children = [];

        this.masterId = 0;
    }

    var _p = SequenceModel.prototype = Object.create(Parent.prototype);

    _p.addMaster = function(name, MOMelement, cpsFile) {
        var master = new MasterModel(name, this, MOMelement, cpsFile, this.id, this.masterId++, this._project);
        this.children.push(master);
        this.addGlyphsToMaster(master, MOMelement.children);
        return master;
    };

    /**
     * FIXME: this should rather be a method of MasterModel "addGlyphs"
     * however, we must refactor this because it is a bad idea to make
     * just copies of the whole structure. Maybe adding event listeners
     * will be enough (we don't have them in the MOM yet!)
     * But ideally we could augment the existing structure without having
     * to recreate it completeley.
     */
    _p.addGlyphsToMaster = function (master, glyphs) {
        for (var j = 0, jl = glyphs.length; j < jl; j++) {
            var MOMglyph = glyphs[j]
              , glyphName = MOMglyph.id
              // wrong naming! this also contains components and contours
              , MOMpenstrokes = MOMglyph.children
              , glyph = master.addGlyph(glyphName, MOMglyph)
              ;
            // FIXME: This should happen within the glyphModel
            // that is returned by master.addGlyph (I don't need it now
            // though). Also above comment applies regarding copying structure
            // and the Single Source Of Truth.
            // Further, this already misses out the Component and Contour
            // element types that we have and possible future additions
            // to the MOM. Maybe we can do this in a more
            // type agnostic/abstract way.
            for (var k = 0, kl = MOMpenstrokes.length; k < kl; k++) {
                var MOMpenstroke = MOMpenstrokes[k]
                  , penstrokeName = "penstroke:i(" + k + ")"
                  , MOMpoints = MOMpenstroke.children
                  , penstroke = glyph.addPenstroke(penstrokeName, MOMpenstroke);
                for (var m = 0, ml = MOMpoints.length; m < ml; m++) {
                    var pointName = "point:i(" + m + ")";
                    penstroke.addPoint(pointName, MOMpoints[m]);
                }
            }
        }
    };

    _p.addToMasterId = function() {
        return this.masterId++;
    };



    return SequenceModel;
});
