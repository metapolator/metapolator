define([
    './property-controller'
  , 'metapolator/ui/redPill/cpsPanel/elements/cpsTools'
], function(
    Parent
  , cpsTools
) {
    "use strict";
    function NewPropertyController($scope) {
        Parent.call(this, $scope);
    }

    NewPropertyController.$inject = ['$scope'];
    var _p = NewPropertyController.prototype = Object.create(Parent.prototype);
    _p.constructor = NewPropertyController;

    // override _initPropertyModel of Parent
    _p._initPropertyModel = function() {
        var $scope = this.$scope;
        $scope.invalid = false;
        $scope.message = '';
        $scope.propertyModel = {
            name: ''
          , value: ''
        };
        $scope.edit = true;
    }

    // override _changeHandler of Parent
    _p._changeHandler = function () {
        var $scope = this.$scope
          , property = property = this._getNewProperty()
          ;

        this._setValueBoxSize($scope.propertyModel.value);
        $scope.invalid = property.invalid;
        $scope.message = property.invalid
            ? (property.message || 'no message :-(')
            : ''
            ;
    }

    // override _finalize of Parent
    _p._finalize = function() {
        var $scope = this.$scope
          , propertyModel = $scope.propertyModel
          , property = property = this._getNewProperty()
          ;
        // this will close this directive
        this.$scope.$emit('finalizeNewProperty');
        if(!property.invalid)
            cpsTools.appendProperty($scope.cpsPropertyDict, property);
    }

    return NewPropertyController;
});
