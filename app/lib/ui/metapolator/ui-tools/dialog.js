define([
    'jquery'
], function(
    $
) {
    "use strict";
    var confirm
      , openDialogScreen
      , closeDialogScreen
      , _constructScreen
      , _destructScreen
      , _html = {
            // the css code for these elements are in app.less
            layover : $('<div class="layover"></div>')[0]
          , dialog : $('<div class="dialog"></div>')[0]
          , close : $('<div class="dialog-close">×</div>')[0]
          , loading : $('<div class="dialog-loading"><img src="lib/ui/metapolator/assets/img/loading.gif"></div>')[0]
          , content : $('<div class="dialog-content"></div>')[0]
          , confirm : $('<div class="dialog-confirm"></div>')[0]
          , buttonTrue : $('<button class="dialog-button-true">Okay</button>')[0]
          , buttonFalse : $('<button class="dialog-button-false">Cancel</button>')[0]
        };

    confirm = function(message, callback) {
        openDialogScreen(message, false, true, false);
        $(_html.buttonTrue).click(function() {
            closeDialogScreen();
            $(_html.buttonTrue).unbind();
            callback(true);
        });
        $(_html.buttonFalse).click(function() {
            closeDialogScreen();
            $(_html.buttonFalse).unbind();
            callback(false);
        });
    };

    _constructScreen = function(message, loading, buttons, close) {
        $(document.body).append(_html.layover);
        $(_html.layover).append(_html.dialog);
        $(_html.dialog).append(_html.content);
        $(_html.content).html(message);
        if(loading) {
            $(_html.dialog).append(_html.loading);
        }
        if (close) {
            $(_html.dialog).append(_html.close);
            $(_html.close).click(function() {
                closeDialogScreen();
                $(_html.close).unbind();
            });
        }
        if (buttons) {
            $(_html.dialog).append(_html.confirm);
            $(_html.confirm).append(_html.buttonTrue);
            $(_html.confirm).append(_html.buttonFalse);
        }
    };

    _destructScreen = function() {
        $(_html.content).empty();
        $(_html.dialog).empty();
        $(_html.confirm).empty();
        $(_html.layover).empty();
        $(_html.layover).remove();
    };

    openDialogScreen = function (message, loading, buttons, close) {
        _constructScreen(message, loading, buttons, close);
        $(_html.layover).fadeIn(100);
    };

    closeDialogScreen = function () {
        var fade = 300;
        $(_html.layover).fadeOut(fade);
        setTimeout(function(){
            _destructScreen();
        }, fade);

    };


    return {
        confirm: confirm
      , openDialogScreen: openDialogScreen
      , closeDialogScreen: closeDialogScreen
    };
});
