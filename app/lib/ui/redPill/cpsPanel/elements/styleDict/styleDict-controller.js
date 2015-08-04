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
        this._elementSubscription = [this.element, this.element.on('CPS-change', [this, '_cpsChangeHandler'])];
        $scope.$on('$destroy', this._destroy.bind(this));

        this._reset();
    }

    StyleDictController.$inject = ['$scope'];
    var _p = StyleDictController.prototype;

    _p._reset = function() {
        this.items = this._styleDict.getRules();
        this.names = new Set();
    }
    _p._cpsChangeHandler = function() {
        this._reset();
        setTimeout(this.$scope.$apply.call(this.$scope));
    };

    _p._destroy = function() {
        if(!this._elementSubscription)
            return;
        this._elementSubscription[0].off(this._elementSubscription[1]);
        this._elementSubscription = null;
    };

    return StyleDictController;
});
