app.directive('rubberband', function($document) {
    return {
        restrict : 'A',
        link : function(scope, element, attrs, ctrl) {
            var startX, startY, divX1, divX2, divY1, divY2;
            var myclick = false;
            var mymove = false;

            element.bind('mousedown', function(event) {
                // second condition is to exclude the rubberbanding on the scrollbar
                if (!$(event.target).hasClass("no-rubberband") && event.pageX < element.offset().left + element.outerWidth() - 20) {
                    $("#templayer-rubberband").remove();
                    if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
                        scope.deselectAll();
                        scope.$apply();
                    }
                    myclick = true;
                    startX = event.pageX;
                    startY = event.pageY;
                    var templayer = '<div id="templayer-rubberband" class="rubberband" style="position: fixed; z-index: 10000;"></div>';
                    element.append(templayer);
                }
            });
            element.bind('mousemove', function(event) {
                if (myclick) {
                    mymove = true;
                    dragPhase = 1;
                    var x = event.pageX;
                    var y = event.pageY;
                    if (x < startX) {
                        divX1 = x;
                        divX2 = startX;
                    } else {
                        divX1 = startX;
                        divX2 = x;
                    }
                    if (y < startY) {
                        divY1 = y;
                        divY2 = startY;
                    } else {
                        divY1 = startY;
                        divY2 = y;
                    }
                    $("#templayer-rubberband").css({
                        'left' : divX1 + 'px',
                        'top' : divY1 + 'px',
                        'width' : (divX2 - divX1) + 'px',
                        'height' : (divY2 - divY1) + 'px'
                    });
                    $("#specimen-content .catchme").each(function() {
                        if (event.shiftKey || event.ctrlKey || event.metaKey) {
                            if (isThisInBox(this, divX1, divX2, divY1, divY2)) {
                                if ($(this).parent().hasClass("selected-glyph")) {
                                    $(this).addClass("temp-unselected-glyph");
                                } else {
                                    $(this).addClass("temp-selected-glyph");
                                }

                            } else {
                                $(this).removeClass("temp-selected-glyph");
                            }
                        } else {
                            if (isThisInBox(this, divX1, divX2, divY1, divY2)) {
                                $(this).addClass("temp-selected-glyph");
                            } else {
                                $(this).removeClass("temp-selected-glyph");
                            }

                        }
                    });
                }
            });
            element.bind('mouseup', function(event) {
                // remove temp hover classes
                $("#specimen-content .catchme").each(function() {
                    $(this).removeClass("temp-unselected-glyph");
                });
                if (!$(event.target).parents(".spec-glyph-box").length) {
                    scope.deselectAll();
                    scope.$apply();
                }
                if (mymove) {
                    var selected = [];
                    $("#" + element.context.id + " .catchme").each(function() {
                        $(this).removeClass("temp-selected-glyph");
                        if (isThisInBox(this, divX1, divX2, divY1, divY2)) {
                            selected.push({
                                "sequence" : $(this).attr("sequence"),
                                "master" : $(this).attr("master"),
                                "glyph" : $(this).attr("glyph")
                            });
                        }
                    });
                    if (event.shiftKey || event.ctrlKey || event.metaKey) {
                        scope.toggleSet(selected);
                        scope.$apply();
                    } else {
                        scope.selectSet(selected);
                        scope.$apply();
                    }
                }
                $("#templayer-rubberband").remove();
                myclick = false;
                mymove = false;
            });

            function isThisInBox(glyph, x1, x2, y1, y2) {
                if ($(glyph).attr("glyph") == "*n" || $(glyph).attr("glyph") == "*p") {
                    return false;
                } else {
                    var myx1 = $(glyph).offset().left;
                    var myx2 = $(glyph).offset().left + $(glyph).outerWidth();
                    var myy1 = $(glyph).offset().top;
                    var myy2 = $(glyph).offset().top + $(glyph).outerHeight();
                    if (((x1 < myx1 && x2 > myx1) || (x1 < myx2 && x2 > myx2) || (x1 > myx1 && x2 < myx2)) && ((y1 < myy1 && y2 > myy1) || (y1 < myy2 && y2 > myy2) || (y1 > myy1 && y2 < myy2))) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }

        }
    };
}); 