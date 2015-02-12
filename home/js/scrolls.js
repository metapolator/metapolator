$(document).ready(function() {
    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop : target.offset().top
                }, 1000);
                return false;
            }
        }
    });

    $('#buttons a').on('click', function() {

        var scrollAnchor = $(this).attr('data-scroll'), scrollPoint = $('section[data-anchor="' + scrollAnchor + '"]').offset().top + 5;

        $('body,html').animate({
            scrollTop : scrollPoint
        }, 500);
        return false;
    })

    $(window).scroll(function() {
        var windscroll = $(window).scrollTop();
        if (windscroll >= 100) {
            $('#buttons').addClass('fixed');
            $('#pagewrap section').each(function(i) {
                if ($(this).position().top <= windscroll) {
                    $('#buttons a.active').removeClass('active');
                    $('#buttons a').eq(i).addClass('active');
                }
            });

        } else {

            $('#buttons').removeClass('fixed');
            $('#buttons a.active').removeClass('active');
            $('#buttons a:first').addClass('active');
        }

    }).scroll();
});
