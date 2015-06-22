define([
    '../_BaseModel'
], function(
    _BaseModel
){
    "use strict";
    function DialogModel() {

    }
    
    var _p = DialogModel.prototype = Object.create(_BaseModel.prototype);
    
    _p.confirm = function(message, callback) {
        var self = this;
        self.openDialogScreen(message, false, true, false);
        $('#dialog-button-true').click(function() {
            self.closeDialogScreen();
            $('#dialog-button-true').unbind();
            callback(true);
        });
        $('#dialog-button-false').click(function() {
            self.closeDialogScreen();
            $('#dialog-button-false').unbind();
            callback(false);
        });
    };

    _p.openDialogScreen = function (message, loading, buttons, close) {
        $("#layover").fadeIn(100);
        //$("#dialog").fadeIn(300);
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

    _p.closeDialogScreen = function () {
        $("#layover").fadeOut(300);
        // hide buttons
        $("#dialog-loading").hide();
        $("#dialog-close").hide();
        $("#dialog-confirm").hide();
    };
    
    return DialogModel;
});
