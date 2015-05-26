define([
    'metapolator/ui/redPill/cpsPanel/elements/cpsTools'
], function(
    cpsTools
) {
    "use strict";
    function PropertyController($scope) {
        this.$scope = $scope;
        // when name or value change do this:
        $scope.changeHandler = this._changeHandler.bind(this);
        $scope.startEdit = this._startEdit.bind(this);
        $scope.finalize = this._finalize.bind(this);

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

        // define some tools
        // later these tools will probebly accessed differently=u
        $scope.tools = ['drag', 'delete'];
        $scope.clickTool = this._toolClickHandler.bind(this);
    };

    _p._toolClickHandler = function(event, tool) {
        event.stopPropagation();
        if(tool === 'delete')
            setTimeout(this._delete.bind(this));
    }

    _p._delete = function() {
        var $scope = this.$scope;
        $scope.cpsPropertyDict.splice($scope.index, 1, []);
    }

    _p._setValueBoxSize = function(value) {
        var lines = value.split('\n')
          , longestLine = 0, i, l
          , $scope = this.$scope
          ;
        for(i=0,l=lines.length;i<l;i++)
            if(lines[i].length > longestLine)
                longestLine = lines[i].length;

        $scope.valueWidth = longestLine;
        $scope.valueHeight = lines.length;
    };

    _p._updateProperty = function(property) {
        var $scope = this.$scope;
        // FIXME: without setTimeout I get:
        //          Error: [$rootScope:inprog] $apply already in progress
        //    cpsPropertyDict.on should probably better trigger async when
        //    used by ui code(?)
        setTimeout(cpsTools.updateProperty, 0, $scope.cpsPropertyDict
                                             , $scope.index, property);
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
        var $scope = this.$scope;
        // this is used to decide which editing field should get
        // focus. The target element should have either 'display-name'
        // or 'display-value' as a class, but we always fall back to
        // focusing the value field.
        if(event.target.classList.contains('display-name'))
            focus = 'name';
        else
            focus = 'value';
        $scope.$emit('setEditProperty', $scope.index, {focus: focus});
    }

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
