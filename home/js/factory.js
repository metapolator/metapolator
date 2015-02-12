app.factory("sharedScope", function($rootScope) {
    var scope = $rootScope.$new(true);
    scope.data = {
        glyphs : ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
        strokes : ["stroke 1", "stroke 2", "stroke 3"],
        points : ["point 1", "point 2"],
        projectName : "Untitled document",
        sequences : [{
            name : "Weight",
            masters : [{
                fontFamily : 'Roboto',
                name : 'Roboto Light',
                weight : '100',
                display : true,
                edit : true
            }, {
                fontFamily : 'Roboto',
                name : 'Roboto Regular',
                weight : '400',
                display : false,
                edit : true
            }, {
                fontFamily : 'Roboto',
                name : 'Roboto Bold',
                weight : '700',
                display : true,
                edit : false
            }, {
                fontFamily : 'Roboto',
                name : 'Roboto Ultra-Bold',
                weight : '900',
                display : true,
                edit : false
            }]
        }],
        adjustmentMasters : [],
        designSpaces : [{"name":"Space 1","type":"Control","masters":[{"master":{"fontFamily":"Roboto","name":"Roboto Light","weight":"100","display":true,"edit":true},"value":0.582},{"master":{"fontFamily":"Roboto","name":"Roboto Bold","weight":"700","display":true,"edit":false},"value":0.418}],"axes":[{"value":41.75}],"triangle":false,"mainMaster":"0"}, {"name":"Space 2","type":"Explore","masters":[{"master":{"fontFamily":"Roboto","name":"Roboto Light","weight":"100","display":true,"edit":true},"coordinates":[193.5,187.2833251953125]},{"master":{"fontFamily":"Roboto","name":"Roboto Bold","weight":"700","display":true,"edit":false},"coordinates":[317.5,184.2833251953125]},{"master":{"fontFamily":"Roboto","name":"Roboto Bold","weight":"700","display":true,"edit":false},"coordinates":[319.5,315.2833251953125]},{"master":{"fontFamily":"Roboto","name":"Roboto Regular","weight":"400","display":false,"edit":true},"coordinates":[199.5,311.2833251953125]}],"axes":[],"triangle":false,"mainMaster":"0"}],
        currentDesignSpace : 0
    }
    return scope;
});

