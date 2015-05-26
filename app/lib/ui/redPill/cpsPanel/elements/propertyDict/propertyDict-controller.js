define([
    'errors'
  , 'metapolator/ui/redPill/cpsPanel/elements/cpsTools'
], function(
    errors
  , cpsTools
) {
    "use strict";

    var KeyError = errors.Key;

    function PropertyDictController($scope) {
        this.$scope = $scope;

        //$scope.properties = _getItems($scope.cpsPropertyDict);
        $scope.items = $scope.cpsPropertyDict.items;

        $scope.acceptMoveProperty = this._acceptMoveProperty.bind(this);
        $scope.moveProperty = this._moveProperty.bind(this);

        $scope.getPropertyHash = this._getPropertyHash.bind(this);
        $scope.getEditingPropertyData = this._getEditingPropertyData.bind(this);
        $scope.$on('setEditProperty', this.setEditPropertyHandler.bind(this));
        this._editingProperty = null;

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

    _p._setEditingProperty = function(index, data) {
        if(typeof index !== 'number')
            this._editingProperty = null;
        else
            this._editingProperty = {
                index: index
              , oldItem: this.$scope.cpsPropertyDict.getItem(index)
              , data: data
            };
        this.$scope.$apply();
    }

    _p.setEditPropertyHandler = function(event, index, data) {
        event.stopPropagation();
        this._setEditingProperty(index, data);
    }

    _p._isEditingProperty = function(index) {
        return this._editingProperty && this._editingProperty.index === index;
    }

    _p._getEditingPropertyData = function(index, defaultValue) {
        if(this._isEditingProperty(index))
            return this._editingProperty.data;
        else if(arguments.length >= 2)
            return defaultValue;
        throw new KeyError('index '+index+' is not currently editing');
    }

    _p._getPropertyHash = function(index) {
        var item;
        if(this._isEditingProperty(index))
            // we wan't to create the old hash while editing, that way
            // the html get's not reloaded by the ng-repeat directive
            // and the input element doesn't lose focus.
            item = this._editingProperty.oldItem;
        else
            item = this.$scope.cpsPropertyDict.getItem(index);
        return (index + ':' + item.hash)
    }

    return PropertyDictController;
});
