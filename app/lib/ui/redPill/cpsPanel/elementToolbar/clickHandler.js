define([
], function(
) {
    "use strict";

    /**
     * controller needs to define the properties `$scope` and `index`
     **/
    function clickHandler(eventName, event, tool) {
        /*jshint validthis:true*/
        this.$scope.$parent.$emit(eventName, tool, this.index);
        event.stopPropagation();
        return;
    }

    return clickHandler;
});
