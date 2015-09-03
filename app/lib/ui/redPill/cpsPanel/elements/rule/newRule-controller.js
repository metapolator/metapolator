define([
    'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/elements/ParameterDict'
], function(
    Rule
  , PropertyDict
) {
    "use strict";
    function NewRuleController($scope) {
        this.$scope = $scope;
        this.$scope.$on('command', this._commandHandler.bind(this));
    }
    var _p = NewRuleController.prototype;

    /**
     * intercept this event and augment the value with the specific
     * CPS Ruke type
     */
    _p._commandHandler = function(event, command, selectorList) {
        if(command !== 'insert')
            return;
        event.stopPropagation();

        var propertyDict = new PropertyDict([])
          , item = new Rule(selectorList, propertyDict)
          ;
        this._insertItem(item);
    };


    _p._insertItem = function(item) {
        if(item.invalid)
            return;
        // emit on parent, otherwise this scope receives the event as well
        // because it is listening to "command"
        this.$scope.$parent.$emit('command', 'insert', this.index, item);
    };

    NewRuleController.$inject =  ['$scope'];
    return NewRuleController;
});
