app.factory("sharedScope", function($rootScope) {
    var scope = $rootScope.$new(true);
    scope.data = {
        view : {
            showComments : true,
            currentMaster : null
        },
        comments : [],
        maintext : "",
        source : "‘Als je echt wilt begrijpen hoe Nederland in elkaar zit,’ hoorde ik Paul Schnabel eens opmerken, ‘dan moet je vooral veel televisiekijken.’ Misschien zegt één aflevering Ik hou van Holland wel meer over de tijdgeest dan een dik rapport van het Sociaal en Cultureel Planbureau. Misschien is het eerste homohuwelijk in Goede Tijden, Slechte Tijden wel net zo’n mijlpaal als de Wet openstelling huwelijk van 21 december 2000. Dus zo kon het gebeuren dat ik een paar weken geleden met bovengemiddelde interesse naar SBS6 keek. In de lente van vorig jaar ging op deze zender een nieuw programma van John de Mol van start: Geld maakt gelukkig. Het format is simpel. Iedere werkdag gaan drie Nederlanders in acute geldnood de strijd aan. ‘Je gaat met de billen bloot voor honderd man publiek en een kritisch panel,’ vertelt de voice-over in het wervingsfilmpje. Het is de bedoeling dat de kandidaten hun verdrietige verhaal zo verdrietig mogelijk vertellen. Ze moeten alles uit de kast trekken om het publiek te overtuigen van hun leed. De honderd toeschouwers mogen namelijk ieder honderd euro weggeven."
    };
    return scope;
});
