$(function() {
    var currentView = 0;
    var bufferIn = 180;
    var bufferOut = 350;
    updateContainment();
    setSizesAbsolute();

    function updateContainment() {
        if (currentView == 2) {
            var containment_1 = $("#divider-1").offset().left + bufferOut;
        } else {
            var containment_1 = $(window).outerWidth() - bufferOut;
        }
        var containment_2 = $(window).outerWidth() - bufferIn;

        $("#divider-1").draggable({
            containment : [bufferIn, 0, bufferOut, 0]
        });
        $("#divider-2").draggable({
            containment : [containment_1, 0, containment_2, 0]
        });
    }

    var id, leftPanel, rightPanel, leftStart, rightStart, mirror = 0, dividerStart;

    $(".divider").draggable({
        axis : "x",
        start : function(event, ui) {
            id = parseInt($(this).context.id.split("-")[1]) + 2 * currentView;
            leftPanel = $("#panel-" + id);
            rightPanel = $("#panel-" + (id + 1));
            leftStart = leftPanel.outerWidth();
            rightStart = rightPanel.outerWidth();

            if (id == 2) {
                mirror = 4;
            } else if (id == 3) {
                mirror = 2;
            } else if (id == 4) {
                mirror = 6;
            } else if (id == 5) {
                mirror = 4;
            }
            if (mirror != 0) {
                mirrorStart = $("#panel-" + mirror).outerWidth();
            }

            dividerStart = $(this).position().left;
        },
        drag : function(event, ui) {
            leftPanel.css("width", leftStart + (ui.position.left - dividerStart));
            rightPanel.css("width", rightStart - (ui.position.left - dividerStart));

            if (mirror != 0) {
                if (id % 2 == 0) {
                    $("#panel-" + mirror).css("width", mirrorStart + (ui.position.left - ui.originalPosition.left));
                } else {
                    $("#panel-" + mirror).css("width", mirrorStart - (ui.position.left - ui.originalPosition.left));
                }
            }
            setLandscape();
            moveLandscape(currentView, 0);

        },
        stop : function(event, ui) {
            mirror = 0;
        }
    });

    $(".readmore-header").on("click", function() {
        $(this).parent(".readmore").toggleClass("readmore-show");
    });

    $(".menu-item").on("click", function() {
        var view = parseInt($(this).context.id.split("-")[2]);
        moveLandscape(view, 1);
    });

    function setSizesAbsolute() {
        for (var i = 1; i < 8; i++) {
            $("#panel-" + i).css("width", $("#panel-" + i).outerWidth());
        }
        for (var j = 1; j < 3; j++) {
            $("#divider-" + j).css("left", $("#panel-" + (j + 1)).offset().left);
        }
        /*
         for (var k = 3; k < 5; k++) {
         $("#subpanel-" + k + "-top").css("height", $("#panel-" + k).outerHeight() / 2);
         $("#subpanel-" + k + "-bottm").css("height", $("#subpanel-" + k + "-bottm").outerHeight());
         }
         */
    }

    function setLandscape() {
        var landscapeWidth = 0;
        for (var i = 1; i < 8; i++) {
            landscapeWidth += $("#panel-" + i).outerWidth();
        }
        $("#landscape").css("width", landscapeWidth);
    }

    function moveLandscape(view, transition) {
        // move virtual dividers
        currentView = view;
        $("#divider-1").css("left", $("#panel-" + (view * 2 + 1)).outerWidth());
        $("#divider-2").css("left", $("#panel-" + (view * 2 + 1)).outerWidth() + $("#panel-" + (view * 2 + 2)).outerWidth());
        updateContainment();

        // move landscape
        if (transition == 1) {
            $("#landscape").css("transition", "all 700ms ease");
        } else {
            $("#landscape").css("transition", "none");
        }
        var thisLeft = -$("#panel-" + (view * 2 + 1)).position().left;
        $("#landscape").css("left", thisLeft);

        // set menu buttons
        for (var i = 0; i < 3; i++) {
            $("#menu-item-" + i).removeClass("menu-item-current");
        }
        $("#menu-item-" + view).addClass("menu-item-current");
    }

    var containmentBottom = $(window).outerHeight() - bufferIn;

    $(".divider-hor").draggable({
        containment : [0, bufferIn, 0, containmentBottom],
        axis : "y",
        start : function(event, ui) {
            id = parseInt($(this).context.id.split("-")[1]);
            topPanel = $("#subpanel-" + id + "-top");
            bottomPanel = $("#subpanel-" + id + "-bottom");
            topStart = topPanel.outerHeight();
            bottomStart = bottomPanel.outerHeight();
            dividerStart = $(this).position().top;
        },
        drag : function(event, ui) {
            topPanel.css("height", topStart + (ui.position.top - dividerStart));
            bottomPanel.css("height", bottomStart - (ui.position.top - dividerStart));
        }
    });
});
