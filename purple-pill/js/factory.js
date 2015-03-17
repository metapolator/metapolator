app.factory("sharedScope", function($rootScope) {
    var scope = $rootScope.$new(true);
    scope.data = {
        projectName : "Untitled document",
        sequences : [{
            id : 0,
            name : "Weight",
            masters : [{
                type : "test",
                id : 0,
                fontFamily : 'Roboto',
                name : 'Roboto Light',
                weight : '100',
                display : false,
                edit : false,
                ag : "Ag"
            }, {
                type : "test",
                id : 1,
                fontFamily : 'Roboto',
                name : 'Roboto Regular',
                weight : '400',
                display : false,
                edit : false,
                ag : "Ag"
            }, {
                type : "test",
                id : 2,
                fontFamily : 'Roboto',
                name : 'Roboto Bold',
                weight : '700',
                display : false,
                edit : false,
                ag : "Ag"
            }, {
                type : "test",
                id : 3,
                fontFamily : 'Roboto',
                name : 'Roboto Ultra-Bold',
                weight : '900',
                display : false,
                edit : false,
                ag : "Ag"
            }, {
                type : "redpill",
                id : 4,
                fontFamily : 'Roboto',
                weight : '400',
                name : "Red Pill Master",
                display : true,
                edit : true,
                ag : "ag",
                parameters : [{
                    name : "width",
                    unit : "",
                    calculatedValue : 0,
                    operations : [{
                        operator : "x",
                        value : 1.2
                    }]
                }],
                glyphs : [{
                    value : "dvA",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "dvI",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "dvKHA",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "dvBHA",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "dvDA",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "dvDHA",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "dvSSA",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "a",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "b",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "c",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "d",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "e",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "f",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "g",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "h",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "i",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "j",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "k",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "l",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "m",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "n",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "o",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "p",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "q",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "r",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "s",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "t",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "u",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "v",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "w",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "x",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "y",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : "z",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }, {
                    value : " ",
                    edit : false,
                    parameters : [{
                        name : "width",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 80
                        }]
                    }, {
                        name : "height",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 200
                        }]
                    }, {
                        name : "xHeight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 100
                        }]
                    }, {
                        name : "slant",
                        unit : "°",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 1
                        }]
                    }, {
                        name : "spacing",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "sidebearings",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : "50+50"
                        }]
                    }, {
                        name : "tension",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 10
                        }]
                    }, {
                        name : "weight",
                        unit : "",
                        calculatedValue : 0,
                        operations : [{
                            operator : "=",
                            value : 20
                        }]
                    }]
                }]
            }]
        }],
        adjustmentMasters : [],
        designSpaces : [{
            trigger : 0,
            name : "Space 0",
            id : 0,
            type : "Control",
            masters : [],
            axes : [],
            triangle : false,
            mainMaster : "0"

        }],
        families : [{
            id : 0,
            instances : []
        }],
        currentDesignSpace : null,
        eventHandlers : {
            initialDisplay : null
        },
        localmenu : {
            project : false,
            help : false,
            masters : false,
            instances : false,
        },
        parametersPanel : 0
    };
    return scope;
});

