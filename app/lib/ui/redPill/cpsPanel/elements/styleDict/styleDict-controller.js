define([
    'metapolator/errors'
  , 'metapolator/ui/redPill/cpsPanel/elements/cpsTools'
], function(
    errors
  , cpsTools
) {
    "use strict";
    function StyleDictController($scope) {
        this.$scope = $scope;
        // this.element is set by the directive
        this._styleDict = this.element.getComputedStyle();

        // store also this.element, it may get changed by the directive/binding
        // before $destroy is called

        this._styleDictSubscription = [this._styleDict, this._styleDict.on(
                ['change', 'update'] , [this, '_styleDictChangeHandler']
        )];
        $scope.$on('$destroy', this._destroy.bind(this));


        this.items = null;
        this.names = null;
        this._scheduledUpdateNames = false;
        this._resetItems();
        this._updateNames();
    }

    StyleDictController.$inject = ['$scope'];
    var _p = StyleDictController.prototype;

    _p._resetItems = function(){
        this.items = this._styleDict.getRules();
    };

    _p.__updateNames = function() {
        this.names = new Set();
        this.$scope.updateNames(this.names);
        this._scheduledUpdateNames = false;
    };

    /**
     * This call is asynchronously debounced for two reasons:
     *
     * When called from the constructor, the children are not initialized
     * yet.
     * When called from _styleDictChangeHandler there are often both events
     * fireing after directly each other "change" and "update".
     */
    _p._updateNames = function() {
        /*global setTimeout:true*/
        if(this._scheduledUpdateNames) return;
        this._scheduledUpdateNames = true;
        setTimeout(this.__updateNames.bind(this));
    };

    _p._styleDictChangeHandler = function(userData, event, eventData) {
        if(event === 'change') {
            this._resetItems();
            // re-render the children
            this.$scope.$apply();
        }
        this._updateNames();
    };

    _p._destroy = function() {
        if(this._styleDictSubscription) {
            this._styleDictSubscription[0].off(this._styleDictSubscription[1]);
            this._styleDictSubscription = null;
        }
    };

    return StyleDictController;
});
