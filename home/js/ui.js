$(document).ready(function() {

    fitOpeningScreen();

    function fitOpeningScreen() {
        var height = $(window).outerHeight() - 50,
            width = $(window).outerWidth(),
            widget,
            slider = 160,
            menu = 100;
        if (width < 1200) {
            widget = width / 6;
        } else {
            widget = 180;
        }
        $('.body .container:first-child').css('min-height', height);
        $('#glyphslider').css('margin-top', ((height - (widget + slider + menu)) / 2.1) + menu);
    }

    $(window).scroll(function() {
        var y = $(window).scrollTop();
        if (y > 150) {
            $('.navbar').addClass('scrolled');
        } else {
            $('.navbar').removeClass('scrolled');
        }
    });

    $(".nav a").on("click", function(){
        $(".nav").find(".active").removeClass("active");
        $(this).parent().addClass("active");
    });
});
