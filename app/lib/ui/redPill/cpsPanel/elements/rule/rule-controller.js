define([
    'metapolator/ui/redPill/cpsPanel/elements/cpsTools'
  , 'metapolator/ui/redPill/cpsPanel/elementToolbar/clickHandler'
], function(
    cpsTools
  , clickHandler
) {
    "use strict";
    function RuleController($scope) {
        this.$scope = $scope;
        $scope.index = this.index;
        this.toolClickHandler = clickHandler.bind(this, 'command');
    }

    RuleController.$inject = ['$scope'];
    var _p = RuleController.prototype;

    return RuleController;
});
