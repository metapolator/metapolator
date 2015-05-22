define([
    'errors'
  , 'metapolator/ui/redPill/cpsPanel/elements/cpsTools'
], function(
    errors
  , cpsTools
) {
    "use strict";
    function PropertyDictController($scope) {
        this.$scope = $scope;

        //$scope.properties = _getItems($scope.cpsPropertyDict);
        $scope.items = $scope.cpsPropertyDict.items;

        $scope.acceptMoveProperty = this._acceptMoveProperty.bind(this);
        $scope.moveProperty = this._moveProperty.bind(this);

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
                // FIXME: fails when renaming Parameter to Property
                if(ctor === 'Parameter')
                    // NOTE: future proof mapping, can be replaced with `ctor`
                    // when Parameter got renamed to Property.
                    return ['Property', index, item.name, item.value.toString()];
                return [ctor, item];
        });
    }

    _p._acceptMoveProperty = function(sourcePropertyDict, sourceIndex, targetIndex) {
        var $scope = this.$scope
          , isIdentical = (sourcePropertyDict === $scope.cpsPropertyDict
                          && sourceIndex === targetIndex)
          ;
        return !isIdentical;
    };

    _p._moveProperty = function(sourcePropertyDict, sourceIndex, targetIndex) {
        var $scope = this.$scope;

        errors.assert(
            this._acceptMoveProperty(sourcePropertyDict, sourceIndex, targetIndex)
          , 'moveProperty is rejected'
        );

        cpsTools.moveProperty(sourcePropertyDict, sourceIndex
                             , $scope.cpsPropertyDict, targetIndex);
    };

    _p._propertyDictUpdateHandler = function() {
        this.$scope.items = this.$scope.cpsPropertyDict.items;
        this.$scope.$apply();
    };

    _p._destroy = function() {
        this.$scope.cpsPropertyDict.off(this._propertyDictSubscription);
    };

    return PropertyDictController;
});
