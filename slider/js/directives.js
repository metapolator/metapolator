app.directive('uiSelectable', function () {
    return function (scope, el, attrs) {
    	
        el.sortable({
        	 handle: ".handle", 
        	 connectWith: "ul"
        })
        .selectable({
        	cancel: ".selectable-name, .selectable-diamond, .handle", //excludes the name area from selecting
            stop: function(evt,ui) {
            	
            	// still needs freshing up
            	var type = el.context.id.split("-");
            	
                var highlighted = el.find('.ui-selected').map(function() {
                	var found = $(this).context.id.split("-");
                	return found[1];
                }).get();
                
							
				var viewSet = new Array ();
				for (var i = 0; i < highlighted.length; i++) {
					viewSet[i] = highlighted[i];
				}
				console.log(viewSet);
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
