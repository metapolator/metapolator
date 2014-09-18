$(function() {
    //updateContainment();

    function updateContainment() {
        var containment_1 = parseInt($("#border-2").offset().left) - 150;
        var containment_2 = parseInt($("#border-1").offset().left) + 150;
        var containment_3 = parseInt($(window).outerWidth()) - 150;
        var containment_4 = parseInt($(window).outerWidth()) + 150;
        var containment_5 = parseInt($("#border-4").offset().left) - 150;
        var containment_6 = parseInt($("#border-3").offset().left) + 150;
        var containment_7 = 2 * parseInt($(window).outerWidth()) - 150;
        var containment_8 = 2 * parseInt($(window).outerWidth()) + 150;
        var containment_9 = parseInt($("#border-6").offset().left) - 150;
        var containment_10 = parseInt($("#border-5").offset().left) + 150;
        var containment_11 = 3 * parseInt($(window).outerWidth()) - 150;

        $("#border-1").draggable({
            containment : [150, 0, containment_1, 0]
        });
        $("#border-2").draggable({
            containment : [containment_2, 0, containment_3, 0]
        });
        $("#border-3").draggable({
            containment : [containment_4, 0, containment_5, 0]
        });
        $("#border-4").draggable({
            containment : [containment_6, 0, containment_7, 0]
        });
        $("#border-5").draggable({
            containment : [containment_8, 0, containment_9, 0]
        });
        $("#border-6").draggable({
            containment : [containment_10, 0, containment_11, 0]
        });
    }

    var id, leftPanel, rightPanel, leftStart, rightStart, mirror = 0;
    $(".border").draggable({
        axis : "x",
        start : function(event, ui) {
            id = parseInt($(this).context.id.split("-")[1]);
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
            //console.log(ui.originalPosition.left + " - " + ui.position.left + " - " + ui.offset.left);
            leftPanel.css("width", leftStart + (ui.position.left - ui.originalPosition.left));
            rightPanel.css("width", rightStart - (ui.position.left - ui.originalPosition.left));
            if (mirror != 0) {
                if (id % 2 == 0) {
                    $("#panel-" + mirror).css("width", mirrorStart + (ui.position.left - ui.originalPosition.left));
                } else {
                    $("#panel-" + mirror).css("width", mirrorStart - (ui.position.left - ui.originalPosition.left));
                }
                $("#border-" + mirror).css("left", $("#panel-" + (mirror + 1)).css("left"));
            }
            var a = parseInt($("#panel-1").outerWidth());
            var b = parseInt($("#panel-2").outerWidth());
            var c = parseInt($("#panel-3").outerWidth());
            var d = parseInt($("#panel-4").outerWidth());
            var e = parseInt($("#panel-5").outerWidth());
            var f = parseInt($("#panel-6").outerWidth());
            var g = parseInt($("#panel-7").outerWidth());

            console.log(a + " + " + b + " + " + c + " = " + (a + b + c) + " / " + c + " + " + d + " + " + e + " = " + (c + d + e) + " / " + e + " + " + f + " + " + g + " = " + (e + f + g));

        },
        stop : function(event, ui) {
            mirror = 0;
            //updateContainment();
        }
    });

    $(".readmore-header").on("click", function() {
        $(this).parent(".readmore").toggleClass("readmore-show");
    });
});


function moveLandscape(view) {
    var thisLeft = -$("#panel-" + (view * 2 + 1)).position().left;
    $("#landscape").css("left", thisLeft);
    for (var i = 0; i < 3; i++) {
        $("#menu-item-" + i).removeClass("menu-item-current");
    }
    $("#menu-item-" + view).addClass("menu-item-current");
}