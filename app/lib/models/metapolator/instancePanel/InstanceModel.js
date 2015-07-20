define([
    '../_BaseModel'
  , './GlyphModel'
  , './AxisModel'
  , 'metapolator/ui/metapolator/cpsAPITools'
], function(
    Parent
  , GlyphModel
  , AxisModel
  , cpsAPITools
){
    "use strict";
    function InstanceModel(id, axes, designSpace, color, parent) {
        this.id = id;
        this.name = "instance" + id;
        this.displayName = "Instance " + id;
        this.axes = axes;
        this.children = [];
        this.edit = false;
        this.ag = "Ag";
        this.designSpace = designSpace;
        this.color = color;
        this.exportFont = true;
        this.openTypeFeatures = true;
        this.cpsFile = "instance" + id + ".cps";

        Object.defineProperty(this, 'parent', {
            value: parent,
            enumerable: false,
            writable: true,
            configurable: true
        });
        
        this.addInitialGlyphs();
    }
    
    var _p = InstanceModel.prototype = Object.create(Parent.prototype);

    _p.setCurrent = function() {
        this.parent.parent.setCurrentInstance(this);
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

    _p.setMetapolationValues = function(project) {
        this._setMetapolationValuesInModel();
        this._setMetapolationValuesInCPSfile(project);
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

    _p._setMetapolationValuesInCPSfile  = function(project) {
        var parameterCollection = project.ruleController.getRule(false, this.cpsFile)
            , l = parameterCollection.length
            , cpsRule = parameterCollection.getItem(l - 1)
            , parameterDict = cpsRule.parameters
            , setParameter = cpsAPITools.setParameter;
        for (var i = 0; i < this.axes.length; i++) {
            setParameter(parameterDict, 'proportion' + i, this.axes[i].metapolationValue);
        }
        console.log(parameterDict.toString());
    };
   
    _p.addAxis = function(master, axisValue, metapolationValue, project) {
        this.axes.push(
            new AxisModel(master, axisValue, metapolationValue)
        );
        this._setMetapolationValuesInModel();
    };
    
    _p.reDestributeAxes = function(slack) {
        // this functin is called after a change of slack master
        var axes = this.axes
          , l = axes.length
          , ratio
          , max = null
          , highest = null;
        // 1 find highest of the others
        for (var i = 0; i < l; i++) {
            if (axes[i].axisValue >= max && i != slack) {
                highest = i;
                max = axes[i].axisValue;
            }
        }
        // 2 find ratio of others compared to highest
        ratio = 100 / (parseFloat(max) + parseFloat(axes[slack].axisValue));
        console.log(ratio);
        for (var j = 0; j < l; j++) {
            axes[j].axisValue = this.formatAxisValue(ratio * axes[j].axisValue);
        }
    };
    
    _p.formatAxisValue = function(x) {
        return Math.round(x * 10) / 10;
    };
    
    return InstanceModel;
});
