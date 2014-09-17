/*
app.directive('uiSelectable', function($compile) {
    return function(scope, el, attrs) {

        el.selectable({
            cancel : ".selectable-name, .selectable-diamond, .handle",
            stop : function(event, ui) {
                
                console.log ("!");

                // still needs freshing up
                var type = el.context.id.split("-");

                var highlighted = el.find('.ui-selected').map(function() {
                    var found = $(this).context.id.split("-");
                    return found[1];
                }).get();

                var viewSet = new Array();
                for (var i = 0; i < highlighted.length; i++) {
                    viewSet[i] = highlighted[i];
                }
                if (type[0] == "adjustmentMaster") {
                    scope.adjustmentMastersInView = viewSet;
                    scope.$apply();
                }
                if (type[0] == "master") {
                    scope.mastersInView = viewSet;
                    scope.$apply();
                }

            }
        })
    };
});
*/


app.directive('dividerHor', function() {
    return {
        template : '<div class="divider-hor"><div class="divider-top"></div><div class="divider-bottom"></div>',
        restrict : 'E',
        transclude : true,
        replace : true,
        require : 'ngModel'
    };
});

app.directive('dividerVer', function() {
    return {
        template : '<div class="divider-ver"><div class="divider-left"></div><div class="divider-right"></div>',
        restrict : 'E',
        transclude : true,
        replace : true,
        require : 'ngModel'
    };
});

