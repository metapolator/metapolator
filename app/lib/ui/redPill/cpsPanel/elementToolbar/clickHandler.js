define([
], function(
) {
    "use strict";

    /**
     * controller needs to define the properties `$scope` and `index`
     *
     * used like this:
     *
     * ```
     * function AController() {
     *      this.toolClickHandler = clickHandler.bind(this, 'command');
     * }
     * ```
     **/
    function clickHandler(eventName, event, tool) {
        /*jshint validthis:true*/
        this.$scope.$parent.$emit(eventName, tool, this.index);
        event.stopPropagation();
        return;
    }

    return clickHandler;
});
