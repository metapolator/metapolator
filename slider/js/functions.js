// some issues with outerWidth() and offsetWidth
var currentView = 0;

$(document).ready(function(){
    
    $(window).resize(function(){
        moveLandscape(currentView, 0);
    });

    $(".menu-item").on("click", function() {
        var view = parseInt($(this).context.id.split("-")[2]);
        moveLandscape(view, 1);
    });
    
   moveLandscape(1, 1);
        
    function moveLandscape(view, transition) {
        currentView = view;
        //$("#divider-1").css("left", $("#panel-" + (view * 2 + 1)).outerWidth());
        //$("#divider-2").css("left", $("#panel-" + (view * 2 + 1)).outerWidth() + $("#panel-" + (view * 2 + 2)).outerWidth());
        //updateContainment();

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
    
    


/*  
    var currentView = 0, bufferIn = 180, bufferOut = 270, id, leftPanel, rightPanel, leftStart, rightStart, mirror = 0, dividerStart;

    updateContainment();
    setSizesAbsolute();
    setLandscapeWidth();
    $(window).resize(function() {
        resizeLandscape();
    });



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
            setLandscapeWidth();
            moveLandscape(currentView, 0);

        },
        stop : function(event, ui) {
            mirror = 0;
        }
    });
    
    
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



    function setSizesAbsolute() {
        for (var i = 1; i < 8; i++) {
            
            $("#panel-" + i).css("width", $("#panel-" + i).outerWidth());
        }
        for (var j = 1; j < 3; j++) {
            $("#divider-" + j).css("left", $("#panel-" + (j + 1)).offset().left);
        }
    }



    function setLandscapeWidth() {
        var landscapeWidth = 0;
        for (var i = 1; i < 8; i++) {
            landscapeWidth += $("#panel-" + i).outerWidth();
        }
        $("#landscape").css("width", landscapeWidth);
    }
    
    function resizeLandscape() {
        newWindowSize = $(window).outerWidth();
        oldWindowSize = $("#panel-1").outerWidth() + $("#panel-2").outerWidth() + $("#panel-3").outerWidth();
        var restant = new Array();
        for (var i = 1; i < 8; i++) {
            restant[i] = 0;
            var newWidth = Math.round($("#panel-" + i).outerWidth() / oldWindowSize * newWindowSize);
            if (i != 2 && i != 4) {
                if (newWidth < 180) {
                    restant[i] += newWidth - 180;
                    newWidth = 180;
                }
            }
            if (i == 1 || i == 3 || i == 5) {
                if (newWidth > 270) {
                    restant[i] += newWidth - 270;
                    newWidth = 270;
                }
            }
            $("#panel-" + i).css("width", newWidth);
        }
        
        //distribute restants
        $("#panel-2").css("width", $("#panel-2").outerWidth() + restant[1] + restant[3]);
        $("#panel-4").css("width", $("#panel-4").outerWidth() + restant[3] + restant[5]);
        $("#panel-6").css("width", $("#panel-6").outerWidth() + restant[5]);
        $("#panel-7").css("width", $("#panel-7").outerWidth() + restant[6]);
        

        // TBD vertical resize on panel 3 and 4

        setLandscapeWidth();
        moveLandscape(currentView);
        setSizesAbsolute();
    }
    
    
*/








});

