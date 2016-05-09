define([
    '../_BaseModel'
  , './GlyphModel'
  , './AxisModel'
  , 'Atem-MOM/cpsTools'

  , 'metapolator/ui/metapolator/ui-tools/instanceTools'
], function(
    Parent
  , GlyphModel
  , AxisModel
  , cpsTools
  , instanceTools
){
    'use strict';

    var setProperty = cpsTools.setProperty;

    function InstanceModel(id, axes, designSpace, color, parent, project) {
        this.id = id;
        this.name = 'instance-' + id;
        this.displayName = 'Instance ' + id;
        this.axes = [];
        this.children = [];
        this.edit = false;
        this.ag = 'Ag';
        this.designSpace = designSpace;
        this.color = color;
        this.exportFont = true;
        this.openTypeFeatures = true;
        this.cpsFile = this.name + '.cps';
        this._project = project;
        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });

        this.addInitialAxis(axes);
        this.addInitialGlyphs();
    }

    var _p = InstanceModel.prototype = Object.create(Parent.prototype);

    _p.clone = function(designSpace, project) {
        var axes = []
          , i
          , l = this.axes.length;
        for (i = 0; i < l; i++) {
            var axis = this.axes[i]
              , clonedAxis = {
                    axisValue: axis.axisValue,
                    metapolationValue : axis.metapolationValue,
                    // keep the reference of the master
                    master: axis.master
                };
            axes.push(clonedAxis);
        }
        // bad hierarchy
        return this.parent.createNewInstance(axes, designSpace, project);
    };

    _p.setMOMElement = function(momElement) {
        var i,l;
        this.momElement = momElement;
        // This is a dirty workaround until we can rewrite this
        for(i=0,l=this.children.length;i<l;i++)
            // assume this is in sync ...
            this.children[i].momElement = momElement.getChild(i);
    };

    _p.remove = function() {
        var index;
        // Don't delete the baseNode.
        if(!this._project.deleteMaster(false, this.momElement.id, false))
            // NOTE: in Metapolator this should usually succeed because
            // intsance-master don't have other dependants. An mp file
            // edited outside of metapolator could however define such
            // relations.
            return;

        index = this._getIndex();
        // modifies this.parent
        // parent should rather have a removeChild method
        // this violates the hierarchy.
        this.parent.children.splice(index, 1);
        this._findNewCurrentInstance(index);
    };

    _p.addInitialAxis = function(axes) {
        for (var i = 0, l = axes.length; i < l; i++) {
            var axis = axes[i];
            this.addAxis(axis.master, axis.axisValue, axis.metapolationValue);
        }
    };

    _p.setCurrent = function() {
        this.parent.parent.currentInstance = this;
        this.designSpace.setLastInstance(this);
    };

    _p.isCurrent = function() {
        if (this.parent.parent.currentInstance === this) {
            return true;
        } else {
            return false;
        }
    };

    _p.addInitialGlyphs = function() {
        // when we render instance glyphs, we have to know the glyphname.
        // We copy the glyphnames in baseMaster0 to the instance.
        // For now, the glyphs in each master and each instance will be the same set
        var baseMaster0 = this.axes[0].master;
        for (var i = 0, l = baseMaster0.children.length; i < l; i++) {
            var glyphName = baseMaster0.children[i].name;
            this._addGlyph(glyphName);
        }
    };

    _p._addGlyph = function (name) {
        this.children.push(
            new GlyphModel(name, this)
        );
    };

    _p.setMetapolationValues = function() {
        this._setMetapolationValuesInModel();
        this._setMetapolationValuesInCPS();
    };

    _p.updateCPSFile = function() {
        instanceTools.update(this._project, this);
    };

    _p._setMetapolationValuesInModel = function() {
        var axes = this.axes
          , n = axes.length - 1
          , thisPiece;
        // when only 1 axis, the value is alway 1
        // this also prevents the possibility from dividing by 0, which can only appear with 1 master
        if (n === 0) {
            axes[0].metapolationValue = 1;
        } else {
            var cake = 0;
            for (var i = n; i >= 0; i--) {
                thisPiece = parseFloat(axes[i].axisValue);
                cake += thisPiece;
            }
            for (var j = n; j >= 0; j--) {
                thisPiece = parseFloat(axes[j].axisValue);
                axes[j].metapolationValue = thisPiece / cake;
            }
        }
    };

    _p._setMetapolationValuesInCPS  = function() {
        var properties = this.momElement.properties
          , i, l
          ;
        for (i=0,l=this.axes.length;i<l;i++)
            setProperty(properties, 'proportion' + i, this.axes[i].metapolationValue);
    };

    _p.addAxis = function(master, axisValue, metapolationValue) {
        this.axes.push(
            new AxisModel(master, axisValue, metapolationValue, this)
        );
        this._setMetapolationValuesInModel();
    };

    _p.reDestributeAxes = function() {
        // this function is called after a change of slack master
        // or when an axis is removed from the design space
        var slack = this.designSpace.slack
          , axes = this.axes
          , l = axes.length
          , ratio
          , max = null
          , highest = null;
        if (axes.length > 1) {
            // 1 find highest of the others
            for (var i = 0; i < l; i++) {
                if (axes[i].axisValue >= max && i !== slack) {
                    highest = i;
                    max = axes[i].axisValue;
                }
            }
            // 2 find ratio of others compared to highest
            ratio = 100 / (parseFloat(max) + parseFloat(axes[slack].axisValue));
            for (var j = 0; j < l; j++) {
                axes[j].axisValue = (ratio * axes[j].axisValue).toFixed(1);
            }
        }
    };

    _p._getIndex = function() {
        for (var i = this.parent.children.length - 1; i >= 0; i--) {
            var instance = this.parent.children[i];
            if (instance === this) {
                return i;
            }
        }
    };

    _p._findNewCurrentInstance = function(index) {
        var l = this.parent.children.length;
        if (l > index) {
            this.parent.children[index].setCurrent();
        } else if (l === 0) {
            this.parent.currentInstance = null;
        } else {
            this.parent.children[l - 1].setCurrent();
        }
    };

    _p.measureAllGlyphs = function() {
        for (var i = 0, l = this.children.length; i < l; i++) {
            // get the corresponding glyph(s) of the master(s) for each glyph of this instance
            var instanceGlyph = this.children[i]
              , masterGlyphs =  instanceGlyph.getMasterGlyphs();
            for (var j = 0, jl = masterGlyphs.length; j < jl; j++) {
                var masterGlyph = masterGlyphs[j];
                // if it isn't displayed before, it is measured and catches up cps if needed
                masterGlyph.checkIfIsDisplayed();
            }
        }
    };

    return InstanceModel;
});
