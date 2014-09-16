app.directive('uiSelectable', function ($compile) {
    return function (scope, el, attrs) {
    	
        el.sortable({
        	 handle: ".handle", 
        	 connectWith: "ul"
        })
        .on( "sortreceive", function( scope, el ) {
        	// if last sequence is not empty anymore
        	//var last = scope.masterSequences.length + 1;  	
        	var last = 2;
        	if ($("#master-ul-" + last + " li").length > 0) {
        		// create new empty ul
        		last++;
        		console.log($(this).parent());
        		var toAppendTo = $(this).parent();
        		toAppendTo.append("<ul ui-selectable class='ui-selectable' id='master-ul-" + last + "'></ul>");
        		
		        //$compile(toAppendTo)(scope);
		        //element.append(toAppendTo);
        	}
        } )
        .selectable({
        	cancel: ".selectable-name, .selectable-diamond, .handle", 
            stop: function( event, ui ) {
            	
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


app.directive('dividerHor', function() {
	return {
	    template: '<div class="divider-hor"><div class="divider-top"></div><div class="divider-bottom"></div>',
	    restrict: 'E',
	    transclude: true,
	    replace: true,
	    require: 'ngModel'
	};
}); 

app.directive('dividerVer', function() {
	return {
	    template: '<div class="divider-ver"><div class="divider-left"></div><div class="divider-right"></div>',
	    restrict: 'E',
	    transclude: true,
	    replace: true,
	    require: 'ngModel'
	};
}); 



