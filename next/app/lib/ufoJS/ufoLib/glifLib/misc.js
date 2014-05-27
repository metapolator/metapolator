/**
 * Copyright (c) 2012, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a port of various functions  defined in robofab/branches/ufo3k/Lib/ufoLib/gliflib.py
 *
 */ 
define(
    [
    'ufojs',
    'ufojs/errors',
    'ufojs/ufoLib/filenames',
    'ufojs/ufoLib/validators'
    ],
    function(
        main,
        errors,
        filenames,
        validators
) {
    "use strict";
    var setLike = main.setLike,
        userNameToFileName = filenames.userNameToFileName,
        colorValidator = validators.colorValidator,
        genericTypeValidator = validators.genericTypeValidator,
        GlifLibError = errors.GlifLib;
    
    // -----------------------
    // Glyph Name to File Name
    // -----------------------
    
    /**
     * Wrapper around the userNameToFileName function in filenames.py
     */
    function glyphNameToFileName(glyphName, glyphSet) {
        var existing = {};
        for(var name in glyphSet.contents)
            existing[name.toLowerCase()] = true;
        return userNameToFileName(glyphName, existing, '', '.glif');
    }
    
    // -----------------------
    // layerinfo.plist Support
    // -----------------------

    var layerInfoVersion3ValueData = {
        'color' : {type: 'string', valueValidator: colorValidator},
        'lib' : {type: 'object', valueValidator: genericTypeValidator}
    };

    /**
     * This performs very basic validation of the value for attribute
     * following the UFO 3 fontinfo.plist specification. The results
     * of this should not be interpretted as *correct* for the font
     * that they are part of. This merely indicates that the value
     * is of the proper type and, where the specification defines
     * a set range of possible values for an attribute, that the
     * value is in the accepted range.
     */
    function validateLayerInfoVersion3ValueForAttribute(attr, value) {
        if(!(attr in layerInfoVersion3ValueData))
            return false;
        var dataValidationDict = layerInfoVersion3ValueData[attr],
            valueType = dataValidationDict['type'],
            validator = dataValidationDict['valueValidator'],
            valueOptions = dataValidationDict['valueOptions'],
            isValidValue;
        // have specific options for the validator
        if(valueOptions !== undefined)
            isValidValue = validator(value, valueOptions);
        // no specific options
        else
            if (validator === genericTypeValidator)
                isValidValue = validator(value, valueType);
            else
                isValidValue = validator(value);
        return isValidValue;
    }
    
    /**
     * This performs very basic validation of the value for infoData
     * following the UFO 3 layerinfo.plist specification. The results
     * of this should not be interpretted as *correct* for the font
     * that they are part of. This merely indicates that the values
     * are of the proper type and, where the specification defines
     * a set range of possible values for an attribute, that the
     * value is in the accepted range.
     */
    function validateLayerInfoVersion3Data(infoData) {
        var validInfoData = {}, attr, value, isValidValue;
        for(attr in infoData) {
            value = infoData[attr];
            if(!(attr in layerInfoVersion3ValueData))
                throw new GlifLibError('Unknown attribute ' + attr + '.');
            isValidValue = validateLayerInfoVersion3ValueForAttribute(attr, value);
            if(!isValidValue)
                throw new GlifLibError('Invalid value for attribute '
                    + attr + ' (' + (typeof value) + ': '+ value + ').');
            else
                validInfoData[attr] = value
        }
        return validInfoData;
    }
    
    return {
        glyphNameToFileName : glyphNameToFileName,
        layerInfoVersion3ValueData: layerInfoVersion3ValueData,
        validateLayerInfoVersion3ValueForAttribute : validateLayerInfoVersion3ValueForAttribute,
        validateLayerInfoVersion3Data : validateLayerInfoVersion3Data
    }
});
