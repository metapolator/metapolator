/**
 * Copyright (c) 2012, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a port of the validators defined in robofab/branches/ufo3k/Lib/ufoLib/validators.py
 * The svn revision of the source file was 576 from 2012-05-11 20:00:18 +0200
 * 
 * 
 * 
 * User name to file name conversion.
 * This was taken form the UFO 3 spec.
 * 
 */
 
define(
    [
        'ufojs',
        'ufojs/errors'
    ],
    function(
        main,
        errors
) {
    "use strict";
    var assert = errors.assert,
        NameTranslationError = errors.NameTranslation,
        setLike = main.setLike,
        
        illegalCharacters,
        reservedFileNames,
        maxFileNameLength = 255;
    
    illegalCharacters = setLike((function() {
        var arr = '" * + / : < > ? [ \ ] | \0'.split(' ');
        for(var i=1; i<32; i++)
            arr.push(String.fromCharCode(i));
        arr.push(String.fromCharCode(0x7F));
        return arr;
    })())
    reservedFileNames = setLike([
            'CON PRN AUX CLOCK$ NUL A:-Z: COM1',
            'LPT1 LPT2 LPT3 COM2 COM3 COM4'
        ].join(' ').toLowerCase().split(" "));
    
    /**
     * existing should be a case-insensitive list
     * of all existing file names.
     * 
     * from Python doctest
     * >>> userNameToFileName(u"a")
     * u'a'
     * >>> userNameToFileName(u"A")
     * u'A_'
     * >>> userNameToFileName(u"AE")
     * u'A_E_'
     * >>> userNameToFileName(u"Ae")
     * u'A_e'
     * >>> userNameToFileName(u"ae")
     * u'ae'
     * >>> userNameToFileName(u"aE")
     * u'aE_'
     * >>> userNameToFileName(u"a.alt")
     * u'a.alt'
     * >>> userNameToFileName(u"A.alt")
     * u'A_.alt'
     * >>> userNameToFileName(u"A.Alt")
     * u'A_.A_lt'
     * >>> userNameToFileName(u"A.aLt")
     * u'A_.aL_t'
     * >>> userNameToFileName(u"A.alT")
     * u'A_.alT_'
     * >>> userNameToFileName(u"T_H")
     * u'T__H_'
     * >>> userNameToFileName(u"T_h")
     * u'T__h'
     * >>> userNameToFileName(u"t_h")
     * u't_h'
     * >>> userNameToFileName(u"F_F_I")
     * u'F__F__I_'
     * >>> userNameToFileName(u"f_f_i")
     * u'f_f_i'
     * >>> userNameToFileName(u"Aacute_V.swash")
     * u'A_acute_V_.swash'
     * >>> userNameToFileName(u".notdef")
     * u'_notdef'
     * >>> userNameToFileName(u"con")
     * u'_con'
     * >>> userNameToFileName(u"CON")
     * u'C_O_N_'
     * >>> userNameToFileName(u"con.alt")
     * u'_con.alt'
     * >>> userNameToFileName(u"alt.con")
     * u'alt._con'
     * 
     */
    function userNameToFileName(
        userName,
        existing /* default {} (setLike) */,
        prefix /* default "" */,
        suffix /* default="" */
    ) {
        if(existing === undefined) existing = {};
        if(prefix === undefined) prefix = '';
        if(suffix === undefined) suffix = '';
        // the incoming name must be a unicode string
        // in js every string is that
        assert( typeof userName === 'string',
            "The value for userName must be a string.");
        // establish the prefix and suffix lengths
        var prefixLength = prefix.length,
            suffixLength = suffix.length;
        // replace an initial period with an _
        // if no prefix is to be added
        if(prefix === '' && userName[0] === ".")
            userName = "_" + userName.slice(1)
        // filter the user name
        var filteredUserName = [], i=0, character;
        for(; i<userName.length; i++) {
            character = userName[i];
            // replace illegal characters with _
            if(character in illegalCharacters)
                character = "_";
            // add _ to all non-lower characters
            else if(character != character.toLowerCase())
                character += "_";
            filteredUserName.push(character)
        }
        userName = filteredUserName.join('')
        // clip to 255
        var sliceLength = maxFileNameLength - prefixLength - suffixLength;
        userName = userName.slice(0, sliceLength);
        // test for illegal files names
        var parts = [],
            userNameParts = userName.split("."),
            fullName,
            part;
        for(var i=0; i<userNameParts.length; i++) {
            part = userNameParts[i];
            if(part.toLowerCase() in reservedFileNames)
                part = "_" + part;
            parts.push(part)
        }
        userName = parts.join('.');
        // test for clash
        fullName = prefix + userName + suffix;
        if(fullName.toLowerCase() in existing)
            fullName = handleClash1(userName, existing, prefix, suffix);
        // finished
        return fullName
    }

    /**
     * existing should be a case-insensitive list
     * of all existing file names.
     *
     * python doctest:
     * 
     * >>> prefix = ("0" * 5) + "."
     * >>> suffix = "." + ("0" * 10)
     * >>> existing = ["a" * 5]
     *
     * >>> e = list(existing)
     * >>> handleClash1(userName="A" * 5, existing=e,
     * ...		prefix=prefix, suffix=suffix)
     * '00000.AAAAA000000000000001.0000000000'
     *
     * >>> e = list(existing)
     * >>> e.append(prefix + "aaaaa" + "1".zfill(15) + suffix)
     * >>> handleClash1(userName="A" * 5, existing=e,
     * ...		prefix=prefix, suffix=suffix)
     * '00000.AAAAA000000000000002.0000000000'
     *
     * >>> e = list(existing)
     * >>> e.append(prefix + "AAAAA" + "2".zfill(15) + suffix)
     * >>> handleClash1(userName="A" * 5, existing=e,
     * ...		prefix=prefix, suffix=suffix)
     * '00000.AAAAA000000000000001.0000000000'
     */
    function handleClash1(
        userName,
        existing /* default {} (setLike) */,
        prefix /* default "" */,
        suffix /* default="" */
    ) {
        if(existing === undefined) existing = {};
        if(prefix === undefined) prefix = '';
        if(suffix === undefined) suffix = '';
        // if the prefix length + user name length + suffix length + 15 is at
        // or past the maximum length, silce 15 characters off of the user name
        var prefixLength = prefix.length,
            suffixLength = suffix.length;

        if(prefixLength + userName.length + suffixLength + 15 > maxFileNameLength){
            var l = (prefixLength + userName.length + suffixLength + 15),
                sliceLength = maxFileNameLength - l;
            userName = userName.slice(0, sliceLength);
        }
        // try to add numbers to create a unique name
        var counter = 1,
            fill = '000000000000000',
            finalName, counterStr, name, fullName;
        while(finalName === undefined) {
            counterStr = '' + counter;
            name = userName + fill.slice(0, -counterStr.length) + counterStr;
            fullName = prefix + name + suffix
            if(!(fullName.toLowerCase() in existing)){
                finalName = fullName
                break
            }
            else
                counter += 1;
            if(counter >= 999999999999999)
                break;
        }
        // if there is a clash, go to the next fallback
        if(finalName === undefined)
            finalName = handleClash2(existing, prefix, suffix);
        // finished
        return finalName;
    }
    
    /**
     * existing should be a case-insensitive list
     * of all existing file names.
     * 
     * python doctest:
     * >>> prefix = ("0" * 5) + "."
     * >>> suffix = "." + ("0" * 10)
     * >>> existing = [prefix + str(i) + suffix for i in range(100)]
     *
     * >>> e = list(existing)
     * >>> handleClash2(existing=e, prefix=prefix, suffix=suffix)
     * '00000.100.0000000000'
     *
     * >>> e = list(existing)
     * >>> e.remove(prefix + "1" + suffix)
     * >>> handleClash2(existing=e, prefix=prefix, suffix=suffix)
     * '00000.1.0000000000'
     *
     * >>> e = list(existing)
     * >>> e.remove(prefix + "2" + suffix)
     * >>> handleClash2(existing=e, prefix=prefix, suffix=suffix)
     * '00000.2.0000000000'
     */
    function handleClash2(
        existing /* default {} (setLike) */,
        prefix /* default "" */,
        suffix /* default="" */
    ) {
        if(existing === undefined) existing = {};
        if(prefix === undefined) prefix = '';
        if(suffix === undefined) suffix = '';
        
        // calculate the longest possible string
        var maxLength = maxFileNameLength - prefix.length - suffix.length,
            maxValue = [], finalName = undefined, counter = 1, fullName;
        for(var i=0; i<maxLength; i++)
            maxValue.push('9');
        maxValue = maxValue.join('');
        //try to find a number
        while(finalName === undefined) {
            fullName = prefix + counter + suffix;
            if(!(fullName.toLowerCase() in existing)){
                finalName = fullName;
                break;
            }
            else
                counter += 1;
            if(counter >= maxValue)
                break;
        }
        // raise an error if nothing has been found
        if(finalName === undefined)
            throw new NameTranslationError("No unique name could be found.")
        // finished
        return finalName;
    }
    
    //export the module
    return {
        illegalCharacters: illegalCharacters,
        reservedFileNames: reservedFileNames,
        maxFileNameLength: maxFileNameLength,
        userNameToFileName: userNameToFileName,
        handleClash1: handleClash1,
        handleClash2: handleClash2
    };
});
