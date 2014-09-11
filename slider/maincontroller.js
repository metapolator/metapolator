app.controller("MetapolatorController", function($scope){
	var self = this;
	
	self.specimen = "Trittst im Morgenrot daher, Seh' ich dich im Strahlenmeer.";
	self.masters = [
        {
            fontFamily: 'Lato',
            weight: '100'
        },
        {
            fontFamily: 'Lato',
            weight: '300'
        },
        {
            fontFamily: 'Lato',
            weight: '400'
        },
        {
            fontFamily: 'Lato',
            weight: '700'
        }
	];
	
	self.adjustmentMasters = [
		{
            fontFamily: 'Lato',
            name: 'adj. 1',
            weight: '100'
		},
		{
            fontFamily: 'Lato',
            name: 'adj. 2',
            weight: '100'
		}
	
	];
});
