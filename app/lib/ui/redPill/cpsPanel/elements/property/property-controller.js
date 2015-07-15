define([
    'metapolator/ui/redPill/cpsPanel/elements/cpsTools'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , 'metapolator/ui/redPill/cpsPanel/elementToolbar/clickHandler'
], function(
    cpsTools
  , helpers
  , clickHandler
) {
    "use strict";
    function PropertyController($scope) {
        this.$scope = $scope;
        // when name or value change do this:
        $scope.changeHandler = this._changeHandler.bind(this);
        $scope.startEdit = this._startEdit.bind(this);
        $scope.finalize = this._finalize.bind(this);

        // needed for mtk-element-toolbar, creates the function this.clickTool
        this.toolClickHandler = clickHandler.bind(this, 'toolClick');

        // not needed when switching to bindToController: true
        this.index = $scope.index;
        $scope.controller = this;

        this._initPropertyModel();
        this._setValueBoxSize($scope.propertyModel.value);

    }

    PropertyController.$inject = ['$scope'];
    var _p = PropertyController.prototype;
    _p.constructor = PropertyController;


    _p._initPropertyModel = function() {
        var $scope = this.$scope
          , property = $scope.property
          , value = property.value.toString()
          ;
        $scope.propertyModel = {
            name: property.name
          , value: value
        };
        $scope.invalid = property.invalid;
        $scope.message = property.message || '';
    };

    _p._setValueBoxSize = function(value) {
        var $scope = this.$scope
          , sizes = helpers.calculateTextBoxSize(value)
          , cols = sizes[0]
          , lines = sizes[1]
          ;
        $scope.valueWidth = cols;
        $scope.valueHeight = lines;
    };

    _p._updateProperty = function(property) {
        var $scope = this.$scope;
        // FIXME: without setTimeout I get:
        //          Error: [$rootScope:inprog] $apply already in progress
        //    cpsPropertyDict.on should probably better trigger async when
        //    used by ui code(?)
        setTimeout(cpsTools.updateProperty, 0, $scope.cpsPropertyDict
                                             , this.index, property);
    };

    _p._getNewProperty = function() {
        var $scope = this.$scope;
        return cpsTools.makeProperty($scope.propertyModel.name
                                           , $scope.propertyModel.value);
    };

    _p._changeHandler = function () {
        var $scope = this.$scope
          , property = this._getNewProperty()
          ;
        this._setValueBoxSize($scope.propertyModel.value);

        // mark if invalid and show the message
        $scope.invalid = property.invalid;
        $scope.message = property.invalid
            ? (property.message || 'no message :-(')
            : ''
            ;

        // don't set an invalid property.
        if(!property.invalid)
            this._updateProperty(property);
    };

    _p._startEdit = function(event) {
        var $scope = this.$scope
          , focus
          ;
        // this is used to decide which editing field should get
        // focus. The target element should have either 'property-name'
        // or 'property-value' as a class, but we always fall back to
        // focusing the value field.
        if(event.target.classList.contains('property-name'))
            focus = 'name';
        else
            focus = 'value';
        $scope.$emit('setEditProperty', this.index, {focus: focus});
    };

    _p._finalize = function() {
        var $scope = this.$scope;
        // On blur, if property is invalid it is be better to restore
        // the old property (from $scope.property)
        var property = this._getNewProperty();
        if(property.invalid) {
            // reset
            this._initPropertyModel();
            this._setValueBoxSize($scope.propertyModel.value);
        }
        // close editing
        $scope.$emit('setEditProperty', null);
    };

    return PropertyController;
});
