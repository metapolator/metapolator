$(function() {
    var buffer = 200;
    updateContainment();
    function updateContainment() {
        var containment_1 = parseInt($("#divider-2").offset().left) - buffer;
        var containment_2 = parseInt($("#divider-1").offset().left) + buffer;
        var containment_3 = $(window).outerWidth() - buffer;

        $("#divider-1").draggable({
            containment : [buffer, 0, containment_1, 0]
        });
        $("#divider-2").draggable({
            containment : [containment_2, 0, containment_3, 0]
        });
    }

    var id, leftPanel, rightPanel, leftStart, rightStart, mirror = 0;

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

        },
        drag : function(event, ui) {
            leftPanel.css("width", leftStart + (ui.position.left - ui.originalPosition.left));
            rightPanel.css("width", rightStart - (ui.position.left - ui.originalPosition.left));

            if (mirror != 0) {
                if (id % 2 == 0) {
                    $("#panel-" + mirror).css("width", mirrorStart + (ui.position.left - ui.originalPosition.left));
                } else {
                    $("#panel-" + mirror).css("width", mirrorStart - (ui.position.left - ui.originalPosition.left));
                }
            }
            moveLandscape(currentView, 0);

        },
        stop : function(event, ui) {
            mirror = 0;
            updateContainment();
        }
    });

    $(".readmore-header").on("click", function() {
        $(this).parent(".readmore").toggleClass("readmore-show");
    });
});

var currentView = 0;

function moveLandscape(view, transition) {
    // move virtual dividers
    currentView = view;
    $("#divider-1").css("left", $("#panel-" + (view * 2 + 1)).outerWidth());
    $("#divider-2").css("left", $("#panel-" + (view * 2 + 1)).outerWidth() + $("#panel-" + (view * 2 + 2)).outerWidth());

    // move landscape
    if (transition == 1) {
        $("#landscape").css("transition",  "all 700ms ease");
    } else {
        $("#landscape").css("transition",  "none");
    }
    var thisLeft = -$("#panel-" + (view * 2 + 1)).position().left;
    $("#landscape").css("left", thisLeft);

    // set menu buttons
    for (var i = 0; i < 3; i++) {
        $("#menu-item-" + i).removeClass("menu-item-current");
    }
    $("#menu-item-" + view).addClass("menu-item-current");
}