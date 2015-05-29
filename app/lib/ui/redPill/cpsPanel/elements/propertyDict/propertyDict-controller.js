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

        this._setItems();

        $scope.$on('setEditProperty', this._setEditPropertyHandler.bind(this));
        this._editingProperty = null;

        // subscribe to propertyDict
        this._propertyDictSubscription = this.cpsPropertyDict.on(
                            'update', [this, '_propertyDictUpdateHandler']);
        $scope.$on('$destroy', this._destroy.bind(this));
    }

    PropertyDictController.$inject = ['$scope'];
    var _p = PropertyDictController.prototype;

    _p._setItems = function() {
        function makeItem (item, index) {
            /*jshint validthis:true*/
            return [this.getPropertyHash(index), item];
        }
        this.$scope.items = this.cpsPropertyDict.items.map(makeItem, this);
    };

    _p.acceptMoveProperty = function(sourcePropertyDict, sourceIndex, targetIndex, insertPosition) {
        var _targetIndex = insertPosition === 'append'
                ? this.cpsPropertyDict.length
                : targetIndex
          , isIdentical = (sourcePropertyDict === this.cpsPropertyDict
                          && (   (sourceIndex === _targetIndex)
                              || (insertPosition === 'before' && _targetIndex-1 === sourceIndex)
                              || (insertPosition === 'after'  && _targetIndex+1 === sourceIndex)
                              || (insertPosition === 'append' && _targetIndex-1 === sourceIndex)
                          ))
          ;
        return !isIdentical;
    };

    _p.moveProperty = function(sourcePropertyDict, sourceIndex, targetIndex, insertPosition) {
        errors.assert(
            this.acceptMoveProperty(sourcePropertyDict, sourceIndex, targetIndex)
          , 'moveProperty is rejected'
        );
        var _targetIndex = insertPosition === 'append'
                ? this.cpsPropertyDict.length
                : targetIndex
                ;

        if(insertPosition === 'after') {
            _targetIndex += 1;
            // now: insertPosition = 'before';
        }
        if(_targetIndex === this.cpsPropertyDict.length) {
            // pass, this is an append anyways.
            // a target index bigger than the last index will always be
            // an append, we don't need to be more exact here
        }
        else if(sourcePropertyDict === this.cpsPropertyDict
                && sourceIndex < _targetIndex)
            // we are in the same dict, and we will first have the
            // item reoved. So, the target index is one less
            // strange stuff should already be prevented by
            // this.acceptMoveProperty
            _targetIndex -= 1;


        cpsTools.moveProperty(sourcePropertyDict, sourceIndex
                             , this.cpsPropertyDict, _targetIndex);
    };

    _p._propertyDictUpdateHandler = function() {
        this._setItems();
        this.$scope.$apply();
    };

    _p._destroy = function() {
        this.cpsPropertyDict.off(this._propertyDictSubscription);
    };

    _p._setEditingProperty = function(index, data) {
        if(typeof index !== 'number')
            this._editingProperty = null;
        else
            this._editingProperty = {
                index: index
              , oldItem: this.cpsPropertyDict.getItem(index)
              , data: data
            };
        this._setItems();
    };

    _p._setEditPropertyHandler = function(event, index, data) {
        event.stopPropagation();
        this._setEditingProperty(index, data);
        this.$scope.$apply();
    };

    _p._isEditingProperty = function(index) {
        return this._editingProperty && this._editingProperty.index === index;
    };

    _p.getEditingPropertyData = function(index, defaultValue) {
        if(this._isEditingProperty(index))
            return this._editingProperty.data;
        else if(arguments.length >= 2)
            return defaultValue;
        throw new KeyError('index '+index+' is not currently editing');
    };

    _p.getPropertyHash = function(index) {
        var item;
        if(this._isEditingProperty(index))
            // we wan't to create the old hash while editing, that way
            // the html not gets reloaded by the ng-repeat directive
            // and the input element doesn't lose focus.
            item = this._editingProperty.oldItem;
        else
            item = this.cpsPropertyDict.getItem(index);
        return (index + ':' + item.hash);
    };

    return PropertyDictController;
});
