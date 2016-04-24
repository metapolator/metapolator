define([], function() {
    "use strict";
    function SpecimenSamplesController($scope) {
        this.$scope = $scope;

        $scope.samples = [[{
            name : "[Enter your own text]",
            text : "Metapolator"
        }], [{
            name : "Metagram",
            text : "Incredibly, he makes a major life-change! For example: \"I’ll require that the system have two sizes.\""
        }, {
            name : "3 Pangrams",
            text : "Quick wafting zephyrs vex bold Jim. The quick brown fox jumps over the lazy dog. Bright vixens jump dozy fowl quack."
        }, {
            name : "Capitalised Pan",
            text : "Aladine Biopsia Cumbia Diego Espejo Flecha Gaveta Hockey Index Jaque Kurdos Ludwing Motivo Nylon Ortiz Profit Quiff Roving Sioux Tizzy Unwary Vertex Wrathy Xammar Yachts Zaque"
        }, {
            name : "Ruder",
            text : "vertrag crainte screw, bibel malhabile modo. verwalter croyant science, biegen peuple punibile. verzicht fratricide sketchy, blind qualifier quindi. vorrede frivolité story, damals quelle dinamica. yankee instruction take, china quelque analiso. zwetschge lyre treaty, schaden salomon macchina. zypresse navette tricycle, schein sellier secondo. fraktur nocturne typograph, lager sommier singolo. kraft pervertir vanity, legion unique possibile. raffeln presto victory, mime unanime unico. reaktion prévoyant vivacity, mohn usuel legge. rekord priorité wayward, nagel abonner unione. revolte proscrire efficiency, puder agir punizione. tritt raviver without, quälen aiglon dunque. trotzkopf tactilité through, huldigen allégir quando. tyrann arrêt known, geduld alliance uomini."
        }], [{
            name : "Aa12%@…",
            text : "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz*n1234567890*n( { [ . , ¡ ! ¿ ? * ' ‘ ’ \" \“ \” ] } ) $ € £ % @ & ¶ § ¢ † ‡"
        }, {
            name : "Number Grid",
            text : "12345678901*n23456789012*n34567890123*n45678901234*n56789012345*n67890123456*n78901234567*n89012345678*n90123456789*n01234567890"
        }], [{
            name : "Paragraph",
            text : "Grumpy wizards make toxic brew for the evil Queen and Jack. One morning when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.*pHe lay on his armourlike back and if he lifted his head a little, he could see his brown belly slightly domed and divided by arches into stiff sections.*pThe bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs pitifully thin compared with the size of the rest of him, waved about helplessly as he looked."
        }]];

        
        // add the glyphRange if the model is set to have it
        /*
        if ($scope.model.glyphRange) {
            $scope.model.addGlyphRange();
        }
        */

        $scope.selectSpecimen = function(specimen) {
            $scope.model.specimenSample = specimen;
        };
        
        // select initial specimen
        $scope.model.specimenSample = $scope.samples[0][0];

        if ($scope.glyphRange) {
            addGlyphRange();
        }

        function addGlyphRange() {
            var glyphRange = [{
                name : "Glyph Range"
            }];
            $scope.samples.push(glyphRange);
        }
    }


    SpecimenSamplesController.$inject = ['$scope'];
    var _p = SpecimenSamplesController.prototype;

    return SpecimenSamplesController;
});
