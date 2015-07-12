define([
    'metapolator/errors'
  , 'metapolator/ui/redPill/cpsPanel/elements/cpsTools'
], function(
    errors
  , cpsTools
) {
    "use strict";
    function CollectionController($scope) {
        this.$scope = $scope;
        $scope.controller = this;
        this.cpsCollection = $scope.cpsCollection;
        this._setItems();
        // subscribe to the collection ...
        this._collectionSubscription =  this.cpsCollection.on(
                'structural-change', [this, '_collectionUpdateHandler']);

        $scope.$on('$destroy', this._destroy.bind(this));
        $scope.$on('checkParentCollection', this._checkParentHandler.bind(this));

    }

    CollectionController.$inject = ['$scope'];
    var _p = CollectionController.prototype;

    _p._setItems = function() {
        this.$scope.items = this.cpsCollection.items;
    }

    _p._collectionUpdateHandler = function() {
        this._setItems();
        this.$scope.$apply();
    };

    _p._destroy = function() {
          this.cpsCollection.off(this._collectionSubscription);
     }

    _p._checkParentHandler = function(event, cpsCollection) {
        if(!event.history)
            event.history = [];
        event.history.push([this.cpsCollection.nodeID, this.cpsCollection.constructor.name]);
        if(cpsCollection === this.cpsCollection) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    _p.acceptMoveCPSElement = function(source, sourceIndex, targetIndex, insertPosition) {
        var dragItem = source.getItem(sourceIndex);

        // check if this is a drag into itself
        if(dragItem === this.cpsCollection)
            return false;
        // check if this is a drag into a descendant
        // (if a parent scope cancels the event by doing event.preventDefault)
        var event = this.$scope.$emit('checkParentCollection', dragItem);
        if(event.defaultPrevented)
            return false;


        // Almost not touched when copied from PropertyDictController
        // just changed this.cpsPropertyDict to this.cpsCollection
        // could be reduced to a helper in its core.
        var _targetIndex = insertPosition === 'append'
                ? this.cpsCollection.length
                : targetIndex
          , isIdentical = (source === this.cpsCollection
                          && (   (sourceIndex === _targetIndex)
                              || (insertPosition === 'before' && _targetIndex-1 === sourceIndex)
                              || (insertPosition === 'after'  && _targetIndex+1 === sourceIndex)
                              || (insertPosition === 'append' && _targetIndex-1 === sourceIndex)
                          ))
          ;
        return !isIdentical;
    };

    // Almost not touched when copied from PropertyDictController
    // just changed this.cpsPropertyDict to this.cpsCollection
    // could be reduced to a helper in its core.
    _p.moveCPSElement = function(source, sourceIndex, targetIndex, insertPosition) {
        errors.assert(
            this.acceptMoveCPSElement(source, sourceIndex, targetIndex)
          , 'move CPS-Element is rejected'
        );
        var _targetIndex = insertPosition === 'append'
                ? this.cpsCollection.length
                : targetIndex
                ;

        if(insertPosition === 'after') {
            _targetIndex += 1;
            // now: insertPosition = 'before';
        }
        if(_targetIndex === this.cpsCollection.length) {
            // pass, this is an append anyways.
            // a target index bigger than the last index will always be
            // an append, we don't need to be more exact here
        }
        else if(source === this.cpsCollection
                && sourceIndex < _targetIndex)
            // we are in the same collection, and we will first have the
            // item reoved. So, the target index is one less
            // strange stuff should already be prevented by
            // this.acceptMoveCPSElement
            _targetIndex -= 1;


        cpsTools.moveCPSElement(source, sourceIndex
                             , this.cpsCollection, _targetIndex);
    };

    return CollectionController;
});
