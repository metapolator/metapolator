define([
    'metapolator/models/CPS/elements/AtNamespaceCollection'
], function(
    AtNamespaceCollection
) {
    "use strict";
    function NewNamespaceCollectionController($scope) {
        this.$scope = $scope;
        this.$scope.$on('command', this._commandHandler.bind(this));
    }
    var _p = NewNamespaceCollectionController.prototype;

    /**
     * intercept this event and augment the value with the specific
     * CPS AtNamespaceCollection type
     */
    _p._commandHandler = function(event, command, selectorList) {
        if(command !== 'insert')
            return;
        event.stopPropagation();

        var item = new AtNamespaceCollection('namespace', selectorList, []);
        this._insertItem(item);
    };


    _p._insertItem = function(item) {
        if(item.invalid)
            return;
        // emit on parent, otherwise this scope receives the event as well
        // because it is listening to "command"
        this.$scope.$parent.$emit('command', 'insert', this.index, item);
    };

    NewNamespaceCollectionController.$inject =  ['$scope'];
    return NewNamespaceCollectionController;
});
