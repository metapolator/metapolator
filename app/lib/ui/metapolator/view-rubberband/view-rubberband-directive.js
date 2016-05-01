define([
    'jquery'
], function(
    $
) {
    "use strict";
    function viewRubberbandDirective() {
        return {
            restrict : 'A'
          , controller : 'ViewRubberbandController'
          , replace : false
          , scope : {
                model : '=mtkModel'
            }
          , link : function(scope, element, attrs, ctrl) {
                var mouse = {
                    click : false,
                    move : false,
                    startX : null,
                    startY : null
                }
                 , div = {
                    x1 : null,
                    x2 : null,
                    y1 : null,
                    y2 : null
                }
                  , startDisplay = null
                  , templayer = $('<div class="view-rubberband"></div>')[0];
                element.bind('mousedown', function(event) {
                    if ($(event.target).parents('.list-view').length) {
                        // find the display setting of the first clicked master
                        var clickedMaster = $(event.target).closest('.mtk-master');
                        startDisplay = angular.element(clickedMaster).isolateScope().model.display;
                        mouse.click = true;
                        mouse.startX = event.pageX;
                        mouse.startY = event.pageY;
                        createTemplayer();
                        stretchTemplayer(event);
                    }
                });
                
                element.bind('mousemove', function(event) {
                    if (mouse.click) {
                        mouse.move = true;
                        stretchTemplayer(event);
                        findHoveredMasters(event);
                    }
                });
                
                
                element.bind('mouseup', function() {
                    // remove temp hover classes
                    $(element).find(".temp-unselected").each(function() {
                        $(this).removeClass("temp-unselected");
                    });
                    var selected = [];
                    $(element).find(".list-view").each(function() {
                        $(this).removeClass("temp-selected");
                        if (isThisInBox(this)) {
                            var parentElement = $(this).parent();
                            var model = angular.element(parentElement).isolateScope().model;
                            selected.push(model);
                        }
                    });
                    scope.selectSet(selected, startDisplay);
                    removeTemplayer();
                    mouse.click = false;
                    mouse.move = false;
                });
                
                
                function createTemplayer() {
                    resetTemplayer();
                    $(element).append(templayer);
                }
                
                function removeTemplayer() {
                    $(templayer).remove();
                }
                
                function stretchTemplayer(event) {
                    var x = event.pageX
                      , y = event.pageY;
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
                
                function findHoveredMasters() {
                    $(element).find(".list-view").each(function() {
                        $(this).removeClass("temp-selected temp-unselected");
                        if (isThisInBox(this)  && !startDisplay) {
                            $(this).addClass("temp-selected");
                        } else if (isThisInBox(this)  && startDisplay) {
                            $(this).addClass("temp-unselected");
                        }
                    }); 
                }
                
                function isThisInBox(master) {
                    var x1 = div.x1, x2 = div.x2, y1 = div.y1, y2 = div.y2;
                    var myx1 = $(master).offset().left;
                    var myx2 = $(master).offset().left + $(master).outerWidth();
                    var myy1 = $(master).offset().top;
                    var myy2 = $(master).offset().top + $(master).outerHeight();
                    if (((x1 < myx1 && x2 > myx1) || (x1 < myx2 && x2 > myx2) || (x1 > myx1 && x2 < myx2)) && ((y1 < myy1 && y2 > myy1) || (y1 < myy2 && y2 > myy2) || (y1 > myy1 && y2 < myy2))) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        };
    }    

    viewRubberbandDirective.$inject = [];
    return viewRubberbandDirective;
});
