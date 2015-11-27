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
        this.index = $scope.index;

        this.cpsCollection = $scope.cpsCollection;
        this._setItems();
        // subscribe to the collection ...
        this._collectionSubscription =  this.cpsCollection.on(
                // prefer "add" + "delete" over "structural-change"
                // because the latter also fires when a child changed
                // and that is not needed here, we care only about the
                // cpsCollection itself.
                ['add', 'delete'], [this, '_collectionUpdateHandler']);

        $scope.$on('$destroy', this._destroy.bind(this));
        $scope.$on('checkParentCollection', this._checkParentHandler.bind(this));
        $scope.elementTools = ['delete'];
        $scope.$on('command', this._commandHandler.bind(this));

    }

    CollectionController.$inject = ['$scope'];
    var _p = CollectionController.prototype;

    _p._setItems = function() {
        this.$scope.items = this.cpsCollection.items;
    };

    _p._collectionUpdateHandler = function() {
        this.$scope.$apply(this._setItems.bind(this));
    };

    _p._destroy = function() {
          this.cpsCollection.off(this._collectionSubscription);
     };

    _p._checkParentHandler = function(event, cpsCollection) {
        if(!event.history)
            event.history = [];
        event.history.push([this.cpsCollection.nodeID, this.cpsCollection.constructor.name]);
        if(cpsCollection === this.cpsCollection) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    Object.defineProperty(_p, 'empty', {
        get: function(){
            return !this.cpsCollection.length;
        }
    });


    _p.isIdentityMoveCPSElement = function(source, sourceIndex, targetIndex, insertPosition) {
        // Almost not touched when copied from PropertyDictController
        // just changed this.cpsPropertyDict to this.cpsCollection
        // could be reduced to a helper in its core.
        var isIdentical = (source === this.cpsCollection
                          && (   (sourceIndex === targetIndex)
                              || (insertPosition === 'before' && targetIndex-1 === sourceIndex)
                              || (insertPosition === 'after'  && targetIndex+1 === sourceIndex)
                          ))
          ;
        return isIdentical;
    };

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

        return !this.isIdentityMoveCPSElement(source, sourceIndex, targetIndex, insertPosition);
    };

    // Almost not touched when copied from PropertyDictController
    // just changed this.cpsPropertyDict to this.cpsCollection
    // could be reduced to a helper in its core.
    _p.moveCPSElement = function(source, sourceIndex, targetIndex, insertPosition) {
        errors.assert(
            this.acceptMoveCPSElement(source, sourceIndex, targetIndex)
          , 'move CPS-Element is rejected'
        );
        var _targetIndex = targetIndex;

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
            // item removed. So, the target index is one less
            // strange stuff should already be prevented by
            // this.acceptMoveCPSElement
            _targetIndex -= 1;

        cpsTools.moveCPSElement(source, sourceIndex
                             , this.cpsCollection, _targetIndex);
    };

    _p.deleteCPSElement = function(index) {
        this.cpsCollection.splice(index, 1, []);
    };

    _p.replaceCPSElement = function(index, replacement) {
        this.cpsCollection.splice(index, 1, [replacement]);
    };

    _p.insertCPSElement = function(index, item) {
        this.cpsCollection.splice(index, 0, [item]);
    };

    _p._commandHandler = function(event, command, index) {
        var args
          , method
          , externalArgs = Array.prototype.slice.call(arguments, 2)
          ;
        // always stop propagation, we don't want a parent element handle
        // tool clicks
        event.stopPropagation();
        switch(command) {
            case 'delete':
                // index
                method = this.deleteCPSElement.bind(this);
                break;
            case 'replace':
                // index, replacement
                method = this.replaceCPSElement.bind(this);
                break;
            case 'insert':
                // index, item
                method = this.insertCPSElement.bind(this);
                break;
            default:
                console.warn('unkown command:', command, 'index:', index);
                return;
        }
        args = [method, 0];
        Array.prototype.push.apply(args, externalArgs);
        setTimeout.apply(null, args);
    };

    return CollectionController;
});
