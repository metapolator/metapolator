define([
   'jquery'
], function(
    $
) {
    "use strict";
    function specimenRubberbandDirective() {
        return {
            restrict : 'A',
            controller : 'SpecimenRubberbandController',
            replace : false,
            scope : {
                model : '=mtkModel'
            },
            link : function(scope, element, attrs, ctrl) {
                // activate the rubberband if specimenModel.setting.rubberband is true
                if (attrs.mtkSpecimenRubberband == "true") {
                    var mouse = {
                        click : false,
                        move : false,
                        startX : null,
                        startY : null,
                    };
                    var div = {
                        x1 : null,
                        x2 : null,
                        y1 : null,
                        y2 : null
                    };
                    var templayer = $('<div class="rubberband"></div>')[0];        
                    element.bind('mousedown', function(event) {
                        // condition is to exclude the rubberbanding on the scrollbar
                        if (event.pageX < $(element).offset().left + $(element).outerWidth() - 20) {
                            if (!(event.shiftKey || event.ctrlKey || event.metaKey)) {
                                scope.deselectAllGlyphs();
                            }
                            mouse.click = true;
                            mouse.startX = event.pageX;
                            mouse.startY = event.pageY;
                            createTemplayer();
                        }
                    });
                    
                    element.bind('mousemove', function(event) {
                        if (mouse.click) {
                            mouse.move = true;
                            var x = event.pageX;
                            var y = event.pageY;
                            if (x < mouse.startX) {
                                div.x1 = x;
                                div.x2 = mouse.startX;
                            } else {
                                div.x1 = mouse.startX;
                                div.x2 = x;
                            }
                            if (y < mouse.startY) {
                                div.y1 = y;
                                div.y2 = mouse.startY;
                            } else {
                                div.y1 = mouse.startY;
                                div.y2 = y;
                            }
                            stretchTemplayer();
                            findHoveredGlyphs(event);
                        }
                    });
                    
                    
                    element.bind('mouseup', function(event) {
                        // remove temp hover classes
                        $(element).find(".temp-unselected").each(function() {
                            $(this).removeClass("temp-unselected");
                        });
                        //if (!(event.shiftKey || event.ctrlKey || event.metaKey)) {
                        //    scope.deselectAllGlyphs();
                        //}
                        // trigger a click+move+release event
                        if (mouse.move) {
                            var selected = [];
                            $(element).find("mtk-glyph").each(function() {
                                $(this).removeClass("temp-selected");
                                if (isThisInBox(this)) {
                                    var model = angular.element(this).isolateScope().model;
                                    selected.push(model);
                                }
                            });
                            if (event.shiftKey || event.ctrlKey || event.metaKey) {
                                scope.toggleSet(selected);
                            } else {
                                scope.selectSet(selected);
                            }
                        }
                        removeTemplayer();
                        mouse.click = false;
                        mouse.move = false;
                    });
                }
                
                function createTemplayer() {
                    resetTemplayer();
                    $(element).append(templayer);
                }
                
                function removeTemplayer() {
                    $(templayer).remove();
                }
                
                function stretchTemplayer() {
                    $(templayer).css({
                        'left' : div.x1 + 'px',
                        'top' : div.y1 + 'px',
                        'width' : (div.x2 - div.x1) + 'px',
                        'height' : (div.y2 - div.y1) + 'px'
                    });
                }
                
                function resetTemplayer() {
                    $(templayer).css({
                        'left' : 0,
                        'top' : 0,
                        'width' : '0px',
                        'height' : '0px'
                    });
                }
                
                function findHoveredGlyphs(event) {
                    $(element).find("mtk-glyph").each(function() {
                        if (event.shiftKey || event.ctrlKey || event.metaKey) {
                            // the temp-selected and the temp-unselected only represent wether a glyph is caught by the rubberband
                            // the real selected represents the edit: true state of a glyph. 
                            // when rubberbanding the temp states overrule (temp, while dragging) the real state (only optical)
                            if (isThisInBox(this)) {
                                if ($(this).hasClass("selected")) {
                                    $(this).addClass("temp-unselected");
                                } else {
                                    $(this).addClass("temp-selected");
                                }
                            } else {
                                $(this).removeClass("temp-selected");
                            }
                        } else {
                            if (isThisInBox(this)) {
                                $(this).addClass("temp-selected");
                            } else {
                                $(this).removeClass("temp-selected");
                            }
                        }
                    }); 
                }
                
                function isThisInBox(glyph) {
                    if ($(glyph).hasClass("no-glyph")) {
                        // ignore non-glyph mtk-glyphs, like a paragraph-break, etc.
                        return false;
                    } else {
                        var x1 = div.x1, x2 = div.x2, y1 = div.y1, y2 = div.y2;
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
    }    

    specimenRubberbandDirective.$inject = [];
    return specimenRubberbandDirective;
});
