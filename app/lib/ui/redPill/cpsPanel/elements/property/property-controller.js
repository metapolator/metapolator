define([
    'metapolator/models/CPS/elements/ParameterValue'
  , 'metapolator/models/CPS/elements/Parameter'
  , 'metapolator/project/parameters/registry'
], function(
    ParameterValue
  , Parameter
  , parameterRegistry
) {
    "use strict";
    function PropertyController($scope) {
        this.$scope = $scope;
        // when name or value change do this:
        $scope.changeHandler = changeHandler

        $scope.sizeName = $scope.property[2].length
        $scope.sizeValue = $scope.property[3].length
    }

    PropertyController.$inject = ['$scope'];
    var _p = PropertyController.prototype;

    // FIXME: move this to a central place/make a higher level API
    // also: take care of the dependencies of this module:
    // ParameterValue, parameterRegistry, Parameter
    function updateProperty(propertyDict, index, name, value) {
        var _value = new ParameterValue([value], [])
          , parameter
          , factory = parameterRegistry.getFactory(name)
          ;
        _value.initializeTypeFactory(name, factory);
        parameter = new Parameter({name:name}, _value);
        propertyDict.splice(index, 1, [parameter]);
    }

    function changeHandler() {
        // $scope === this;
        // FIXME: without setTimeout I get:
        //          Error: [$rootScope:inprog] $apply already in progress
        //    cpsPropertyDict.on should probably better trigger async when
        //    used by ui code(?)
        this.sizeName = this.property[2].length
        this.sizeValue = this.property[3].length
        setTimeout(updateProperty, 0, this.cpsPropertyDict
            , this.property[1], this.property[2], this.property[3]);
    }

    return PropertyController;
});
