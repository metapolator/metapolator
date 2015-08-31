define([
    './_ElementModel'
  , './PenstrokeModel'
  , 'metapolator/ui/metapolator/ui-tools/selectionTools'
], function(
    Parent
  , PenstrokeModel
  , selection
){
    'use strict';
    function GlyphModel(name, parent, MOMelement) {
        this.level = 'glyph';
        this.type = 'master';
        this.name = name;
        this.edit = false;
        this.displayed = false;
        this.master = parent;
        this.parent = parent;
        this.children = [];

        // cps properties
        this.parameters = [];
        this.measured = false; // only the initial parameter values are measured for glyphs when they appear in the view
        this.MOMelement = MOMelement;
        this.ruleIndex = null;

        this.setInitialParameters();
    }
    
    var _p = GlyphModel.prototype = Object.create(Parent.prototype);

    _p.getSelector = function() {
        return 'master glyph#' + this.name;
    };

    _p.getMasterName = function() {
        return this.parent.name;
    };
    
    _p.addPenstroke = function(name, MOMelement) {
        var penstroke = new PenstrokeModel(name, this, MOMelement);
        this.children.push(penstroke);
        return penstroke;
    };

    // handling measuring and cps writing only for displayed glyphs

    _p.checkIfIsDisplayed = function() {
        if (!this.displayed) {
            if (!this._isMeasured()) {
                this._measureGlyph();
            }
            this._catchUpCPS();
        }
    };

    _p._isMeasured = function() {
        var glyph = this._getOriginalGlyph();
        return glyph.measured;
    };

    _p._getOriginalGlyph = function() {
        var originalMaster = this.parent.originalMaster;
        return originalMaster.findGlyphByName(this.name);
    };

    _p._measureGlyph = function () {
        for (var i = selection.baseParameters.length - 1; i >= 0; i--) {
            // get all the elements for the specific parameter. Eg: 'weight' has
            // its effecitve level at point level, so for weight the effected
            // elements are all 'points' of this glyph
            var baseParameter = selection.baseParameters[i]
              , effectedElements;
            // some glyphs don't have children (like 'space'). For these glyphs
            // we only have to set the parameters with effectiveLevel 'glyph'
            if (this.children.length > 0 || baseParameter.effectiveLevel === 'glyph') {
                if (baseParameter.effectiveLevel === 'glyph') {
                    effectedElements = [this];
                } else {
                    effectedElements = this.getEffectedElements(baseParameter.effectiveLevel);
                }
                for (var j = 0, jl = effectedElements.length; j < jl; j++) {
                    var effectedElement = effectedElements[j]
                      , elementParameter = effectedElement.getParameterByName(baseParameter.name)
                      , MOMelement = effectedElement.MOMelement;
                    elementParameter.setInitial(MOMelement);
                }
            }

        }
        this._getOriginalGlyph().measured = true;
    };

    _p._catchUpCPS = function() {
        // if there are parent elements (can only be the master) with parameters with a 'non-local effective operator'
        // (like + and -), we need to write local cps to compensate for that
        for (var i = 0, l = this.parent.parameters.length; i < l; i++) {
            var parameter = this.parent.parameters[i];
            if (parameter.checkIfHasNonLocalOperators()) {
                // find all elements down the tree that are effected (at the effective level)
                var effectedElements = this.getEffectedElements(parameter.base.effectiveLevel);
                for (var j = 0, jl = effectedElements.length; j < jl; j++) {
                    var effectedElement = effectedElements[j]
                        , elementParameter = effectedElement.getParameterByName(parameter.base.name);
                    elementParameter.updateEffectiveValue(true);
                }
            }
        }
        this.displayed = true;
    };
    
    return GlyphModel;
});
