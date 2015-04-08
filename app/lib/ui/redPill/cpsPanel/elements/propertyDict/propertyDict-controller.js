define([
], function(
) {
    "use strict";
    function PropertyDictController($scope) {
        this.$scope = $scope;

        $scope.properties = _getItems($scope.cpsPropertyDict);

        // subscribe to propertyDict
        this._propertyDictSubscription = $scope.cpsPropertyDict.on(
                            'update', [this, '_propertyDictUpdateHandler']);
        $scope.$on('$destroy', this._destroy.bind(this));
    }

    PropertyDictController.$inject = ['$scope'];
    var _p = PropertyDictController.prototype;

    /**
     * Convert cpsPropertyDict.items into something ng-repeat
     * can track properly and that can be used by the child scopes as model.
     */
    function _getItems(cpsPropertyDict) {
        return cpsPropertyDict.items.map(function(item, index) {
                var ctor = item.constructor.name;
                // FIXME: failes when renaming Parameter to Property
                if(ctor === 'Parameter')
                    // NOTE: future proof mapping, can be replaced with `ctor`
                    // when Parameter got renamed to Property.
                    return ['Property', index, item.name, item.value.toString()]
                return [ctor, item];
        });
    }

    _p._propertyDictUpdateHandler = function() {
        this.$scope.$apply(function($scope) {
            $scope.properties = _getItems($scope.cpsPropertyDict);
        });
    }

    _p._destroy = function() {
        this.$scope.cpsPropertyDict.off(this._propertyDictSubscription);
    }

    return PropertyDictController;
});
