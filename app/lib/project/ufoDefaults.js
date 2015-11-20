define([
    'ufojs/plistLib/IntObject'
], function(
    IntObject
) {
    "use strict";

    // Specify formatVersion as an int, as required by
    // unifiedfontobject.org, otherwise it becomes a 'real' in the plist.
    return {
        metainfoV3: {
            creator: 'org.ufojs.lib'
          , formatVersion: new IntObject(3)
        }
      , metainfoV2: {
            creator: 'org.ufojs.lib'
          , formatVersion: new IntObject(2)
        }
        // fontforge requires a fontinfo.plist that defines unitsPerEm
      , minimalFontinfo: {
            unitsPerEm: new IntObject(1000)
          , ascender: new IntObject(800)
          , descender: new IntObject(-200)
        }
    };
});
