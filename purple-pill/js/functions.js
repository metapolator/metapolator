// some issues with outerWidth() and offsetWidth
var currentView = 0;

$(document).ready(function() {

    /***************  dividers ***************/

    $("divider").draggable({
        axis : "x",
        start : function() {
            checkMirror(this);
            keepTrack(this);
        },
        drag : function() {
            keepTrack(this);
        },
        stop : function() {
            keepTrack(this);
            setDividersRelative();
        }
    });

    var mirrorPanel;
    var outerPanel;
    var centerPanel;
    var inactivePanel;
    var mirrorWorkArea;

    function checkMirror(element) {
        console.clear();
        var i = parseInt($(element).attr("div"));
        if (i == 0) {
            var thisO = 0;
            var thisC = 1;
            var thisI = 2;
        } else {
            var thisO = 1;
            var thisC = 0;
            var thisI = -1;
        }
        var id = i + (2 * currentView);
        outerPanel = id + thisO;
        centerPanel = id + thisC;
        inactivePanel = id + thisI;

        mirrorPanel = null;
        if (id == 1) {
            mirrorPanel = 3;
        }
        if (id == 2) {
            mirrorPanel = 1;
        }
        if (id == 3) {
            mirrorPanel = 5;
        }
        if (id == 4) {
            mirrorPanel = 3;
        }
        if (mirrorPanel) {
            mirrorWorkArea = divider.parts[mirrorPanel] + divider.parts[outerPanel];
        }
        console.log("outerPanel: " + outerPanel);
        console.log("centerPanel: " + centerPanel);
        console.log("inactivePanel: " + inactivePanel);
        console.log("mirrorPanel: " + mirrorPanel);
        console.log("mirrorWorkArea: " + mirrorWorkArea);
    }

    function keepTrack(element) {
        console.clear();
        var i = parseInt($(element).attr("div"));
        var screenWidth = $("#pagewrap").outerWidth();
        if (i == 0) {
            var x = $(element).offset().left;
        } else {
            var x = screenWidth - $(element).offset().left;
        }
        var workingArea = divider.parts[outerPanel] + divider.parts[centerPanel];
        divider.parts[outerPanel] = x;
        divider.parts[centerPanel] = screenWidth - divider.parts[outerPanel] - divider.parts[inactivePanel];
        if (mirrorPanel) {
            divider.parts[mirrorPanel] = mirrorWorkArea - x;
        }
        moveLandscape(currentView, false);
        recountSums();
        resizePanels();
        console.log(divider.parts);
        console.log(divider.sums);
    }

    divider = {
        parts : [3, 10, 3, 10, 3, 4, 9],
        sums : [3, 13, 16, 26, 29, 33, 42]
    };

    function recountSums() {
        var sum = 0;
        for (var i = 0; i < 7; i++) {
            divider.sums[i] = sum + divider.parts[i];
            sum += divider.parts[i];
        }
    }

    function resizePanels() {
        for (var id = 0; id < 7; id++) {
            $("#panel-" + (id + 1)).outerWidth(divider.parts[id]);
        }
        $("#landscape").outerWidth(divider.sums[6]);
    }

    function setArrayAbsolute() {
        for (var id = 0; id < 7; id++) {
            var thisWidth = $("#panel-" + (id + 1)).outerWidth();
            divider.parts[id] = thisWidth;
        }
        recountSums();
    }

    function setDividersRelative() {
        var screenWidth = $("#pagewrap").outerWidth();
        var landscapeWidth = $("#landscape").outerWidth();
        console.log(landscapeWidth);
        for (var id = 0; id < 7; id++) {
            var thisWidth = Math.floor($("#panel-" + (id + 1)).outerWidth());
            $("#panel-" + (id + 1)).css("width", "calc(" + thisWidth + "/" + landscapeWidth + " * 100%)");
        }
        $("#landscape").css("width", "calc(" + landscapeWidth + "/" + screenWidth + " * 100%)");
    }

    setArrayAbsolute();

    /***************   ***************/

    $(window).resize(function() {
        moveLandscape(currentView, false);
        setArrayAbsolute();
        console.clear();
        console.log(divider.parts);
        console.log(divider.sums);
    });

    $(".menu-item").on("click", function() {
        var view = parseInt($(this).context.id.split("-")[2]);
        moveLandscape(view, true);
    });

    moveLandscape(0, 1);

    function moveLandscape(view, transition) {
        currentView = view;
        if (transition) {
            $("#divider-0").hide();
            $("#divider-1").hide();
        }
        $("#divider-0").css("left", $("#panel-" + (view * 2 + 1)).outerWidth());
        $("#divider-1").css("left", $("#panel-" + (view * 2 + 1)).outerWidth() + $("#panel-" + (view * 2 + 2)).outerWidth());
        //updateContainment();

        // move landscape
        if (transition) {
            $("#landscape").css("transition", "all 700ms ease");
        } else {
            $("#landscape").css("transition", "none");
        }
        var thisLeft = -$("#panel-" + (view * 2 + 1)).position().left;
        $("#landscape").css("left", thisLeft);

        setTimeout(function() {
            $("#divider-0").show();
            $("#divider-1").show();
        }, 800);

        // set menu buttons
        for (var i = 0; i < 3; i++) {
            $("#menu-item-" + i).removeClass("menu-item-current");
        }
        $("#menu-item-" + view).addClass("menu-item-current");
    }

});

