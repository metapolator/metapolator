define([
    'jquery'
], function(
    $
) {
    "use strict";
    var confirm
      , openDialogScreen
      , closeDialogScreen;

    confirm = function(message, callback) {
        openDialogScreen(message, false, true, false);
        $('#dialog-button-true').click(function() {
            closeDialogScreen();
            $('#dialog-button-true').unbind();
            callback(true);
        });
        $('#dialog-button-false').click(function() {
            closeDialogScreen();
            $('#dialog-button-false').unbind();
            callback(false);
        });
    };

    openDialogScreen = function (message, loading, buttons, close) {
        $("#layover").fadeIn(100);
        $("#dialog #dialog-content").html(message);
        if (loading) {
            $("#dialog-loading").show();
        }
        if (buttons) {
            $("#dialog-confirm").show();
        }
        if (close) {
            $("#dialog-close").show();
        }
    };

    closeDialogScreen = function () {
        $("#layover").fadeOut(300);
        // hide buttons
        $("#dialog-loading").hide();
        $("#dialog-close").hide();
        $("#dialog-confirm").hide();
    };


    return {
        confirm: confirm
      , openDialogScreen: openDialogScreen
      , closeDialogScreen: closeDialogScreen
    };
});
