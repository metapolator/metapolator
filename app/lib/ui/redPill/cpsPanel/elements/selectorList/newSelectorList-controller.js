define([
    'metapolator/errors'
  , './selectorList-controller'
  , 'metapolator/models/CPS/cpsTools'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , 'metapolator/models/CPS/parsing/parseSelectorList'
], function(
    errors
  , Parent
  , cpsTools
  , helpers
  , parseSelectorList
) {
    "use strict";

    var CPSParserError = errors.CPSParser;

    function NewSelectorListController($scope) {
        this.$scope = $scope;
        this.$scope.edit = true;
        this._initSelectorList();
    }

    NewSelectorListController.$inject = ['$scope'];
    var _p = NewSelectorListController.prototype = Object.create(Parent.prototype);

    _p._initSelectorList = function() {
        var $scope = this.$scope;
        $scope.selectorList = '';
        $scope.invalid = false;
        $scope.message = '';
        this._setValueBoxSize('');
    };

    // _p.changeSelectorList is defined by Parent and called via the template

    _p._insertItem = function(selectorList) {
        if(selectorList.invalid)
            return;
        this.$scope.$emit('command', 'insert', selectorList);
    };

    _p.finalize = function() {
        // assert this.$scope.edit === true;
        var selectorList = this._getNewSelectorList();
        this._insertItem(selectorList);
    };

    return NewSelectorListController;
});
