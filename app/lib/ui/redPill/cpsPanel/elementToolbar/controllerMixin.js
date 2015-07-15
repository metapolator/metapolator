define([
], function(
) {
    "use strict";

    function clickHandler =

    function clickHandlerMixin(controller, name) {
        controller[name] = clickHandler.bind(controller);
    }

    // also export this
    clickHandlerMixin.clickHandler = clickHandler;

    return clickHandlerMixin;
});
