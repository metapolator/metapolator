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
            }]
        }, {
            name : "Width",
            masters : [{
                fontFamily : 'Roboto Condensed',
                name : 'Roboto C Regular',
                weight : '400',
                display : true,
                edit : false
            }, {
                fontFamily : 'Roboto Condensed',
                name : 'Roboto C Bold',
                weight : '700',
                display : true,
                edit : false
            }]
        }, {
            name : "Slab",
            masters : [{
                fontFamily : 'Roboto Slab',
                name : 'Roboto S Regular',
                weight : '400',
                display : false,
                edit : false
            }, {
                fontFamily : 'Roboto Slab',
                name : 'Roboto S Bold',
                weight : '700',
                display : true,
                edit : false
            }]
        }],
        adjustmentMasters : [{
            fontFamily : 'Droid sans mono',
            name : 'Droid Regular',
            weight : '400'
        }, {
            fontFamily : 'Lato',
            name : 'Lato Black',
            weight : '900'
        }],
        designSpaces : [{
            name : "Space 1",
            type : "Control",
            masters : [],
            axes : [],
            triangle : false
        }],
        currentDesignSpace : 0
    }
    return scope;
});

