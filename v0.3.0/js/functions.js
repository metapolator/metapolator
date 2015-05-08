$(document).ready(function() {


    /*************** horizontal dividers ***************/

    var containmentBottom;
    var containmentTop;
    var containmentMargin = 60;
    setContainment();
    
    $("dividerHor").draggable({
        axis : "y",
        containment: [ 0, containmentTop , 0, containmentBottom ],
        start : function() {
            setContainment(this);
        },
        drag : function() {
            divideHor(this);
        },
        stop : function() {
            divideHor(this);
        }
    });
    
    function setContainment() {
        var menuHeight = $("#menu").outerHeight();
        containmentTop = containmentMargin + menuHeight;
        containmentBottom = $("#pagewrap").outerHeight() + menuHeight - containmentMargin;
    }
    
    function divideHor(element) {
        var parent = $(element).parent();
        var totY = parent.outerHeight();
        var y = $(element).position().top;
        var topElement = $(element).prev();
        var bottomElement = $(element).next();
        topElement.outerHeight("calc(" + y / totY + " * 100%)");
        $(element).css("top", "calc(" + y / totY + " * 100%)");
        bottomElement.outerHeight("calc(" + (1 - (y / totY)) + " * 100%)");
    }


});

