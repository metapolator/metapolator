/**
 * Copyright (c) 2012, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a port of various functions to write a generic glyph object
 * into a glif xml defined in robofab/branches/ufo3k/Lib/ufoLib/gliflib.py
 *
 * There have been modifications from the python sources because XML is
 * treated with the DOM in here.
 */
define(
    [
        'ufojs',
        'ufojs/errors',
        'ufojs/xml/main',
        'ufojs/plistLib/main',
        'ufojs/ufoLib/validators',
        './constants',
        './GLIFPointPen'
    ],
    function(
        main,
        errors,
        xml,
        plistLib,
        validators,
        constants,
        GLIFPointPen
) {
    "use strict";
    var GlifLibError = errors.GlifLib,
        isNumber = main.isNumber,
        isInt = main.isInt,
        imageValidator = validators.imageValidator,
        anchorsValidator =  validators.anchorsValidator,
        glyphLibValidator = validators.glyphLibValidator,
        transformationInfo = constants.transformationInfo;
    
    /**
     * Return .glif data for a glyph as a UTF-8 encoded string.
     * The 'glyphObject' argument can be any kind of object (even None);
     * the writeGlyphToString() method will attempt to get the following
     * attributes from it:
     *     "width"      the advance width of the glyph
     *     "height"     the advance height of the glyph
     *     "unicodes"   a list of unicode values for this glyph
     *     "note"       a string
     *     "lib"        a dictionary containing custom data
     *     "image"      a dictionary containing image data
     *     "guidelines" a list of guideline data dictionaries
     *     "anchors"    a list of anchor data dictionaries
     *  
     * All attributes are optional: if 'glyphObject' doesn't
     * have the attribute, it will simply be skipped.
     *  
     * To write outline data to the .glif file, writeGlyphToString() needs
     * a function (any callable object actually) that will take one
     * argument: an object that conforms to the PointPen protocol.
     * The function will be called by writeGlyphToString(); it has to call the
     * proper PointPen methods to transfer the outline to the .glif file.
     *  
     * The GLIF format version can be specified with the formatVersion argument.
     */
    function writeGlyphToString (
        glyphName,
        glyphObject /* default = undefined */,
        drawPointsFunc /* default = undefined */,
        // the writer argument is not supported yet, here is no such concept
        /* writer default = undefined */,
        formatVersion /* default = 2 */
    ) {
        var args = Array.prototype.slice.call(arguments)
          , doc = writeGlyphToDOM.apply(undefined, args)
          ;
        return xml.docToString(doc);
    }
    
    function writeGlyphToDOM (
        glyphName,
        glyphObject /* default = undefined */,
        drawPointsFunc /* default = undefined */,
        // the writer argument is not supported yet, here is no such concept
        /* writer default = undefined */,
        formatVersion /* default = 2 */
    ) {
        var identifiers = {},
            doc,
            glyphElement,
            outlineElement;
        // start
        if(typeof glyphName !== 'string' || !(glyphName instanceof String))
            throw new GlifLibError('The glyph name is not properly formatted.')
        if(glyphName.length === 0)
            throw new GlifLibError('The glyph name is empty.');
        
        if(formatVersion === undefined)
            formatVersion = 2;
        
        doc = xml.createDocument(null, 'glyph', null);
        glyphElement = doc.documentElement;
        
        glyphElement.setAttribute('name', glyphName);
        glyphElement.setAttribute('format', formatVersion);
        
        // advance
        _setAttributes.call(glyphElement, _writeAdvance(glyphObject));
        
        // unicodes
        if(glyphObject.unicodes !== undefined)
            glyphElement.appendChild(_writeUnicodes(glyphObject.unicodes, doc));
        
        // note
        if(glyphObject.note !== undefined)
            glyphElement.appendChild(_writeNote(glyphObject, doc));
        
        // image
        if(formatVersion >= 2 && glyphObject.image !== undefined)
            glyphElement.appendChild(_writeImage(glyphObject.image, doc));
        
        // guidelines
        if(formatVersion >= 2 && glyphObject.guidelines !== undefined)
            glyphElement.appendChild(
                _writeGuidelines(glyphObject.guidelines, doc, identifiers)
            );
        
        // anchors
        if(formatVersion >= 2  &&  glyphObject.anchors !== undefined)
            glyphElement.appendChild(
                _writeAnchors(glyphObject.anchors, doc, identifiers)
            );
        
        // outline
        if(drawPointsFunc !== undefined) {
            outlineElement = document.createElement('outline');
            pen = new GLIFPointPen(outlineElement, identifiers, formatVersion);
            drawPointsFunc(pen);
            if(formatVersion == 1 &&  glyphObject.anchors !== undefined)
                _writeAnchorsFormat1(pen, glyphObject.anchors);
            glyphElement.appendChild(outlineElement);
        }
        
        // lib
        if(glyphObject.lib !== undefined)
            glyphElement.appendChild(_writeLib(glyphObject.lib, doc));
        
        return doc;
    }
    
    /**
     *  a little helper
     */
    function _setAttributes(dict) {
        for(var k in dict)
            this.setAttribute(k, dict[k]);
    }
    
    function _writeAdvance(glyphObject) {
        var values = { width: undefined, height: undefined },
            k, val;
        for(k in values) {
            val = glyphObject[k];
            if(val === undefined || val === 0) {
                delete(values[k]);
                continue;
            }
            if(!isNumber(val))
                throw new GlifLibError(k + ' attribute must be int or float');
            values[k] = val;
        }
        return values;
    }
    
    function _writeUnicodes(unicodes, document) {
        var seen = {}, // like a set
            i = 0,
            code,
            tag,
            fragment = document.createDocumentFragment(); 
        // in my opinion unicodes should always be a list, an int would
        // be an error
        if isInt(unicodes)
            unicodes = [unicodes];
        
        for(; i<unicodes.length; i++) {
            code = unicodes[i];
            if(!isInt(code))
                throw new GlifLibError('unicode values must be int');
            if(code in seen)
                continue;
            seen.push(code);
            hexCode = code.toString(16).toUpperCase();
            if(hexCode.length < 4)
                hexCode = ['0', '0', '0', '0', hexCode]
                    .slice(hexCode.length)
                    .join('');
            tag = document.createElement('unicode');
            tag.setAttribute('hex', hexCode);
            fragment.appendChild(tag);
        }
        return fragment;
    }
    
    function _writeNote(note, document) {
        var noteElement;
        
        if(typeof note !== 'string')
            throw new GlifLibError('note attribute must be string');
        
        note = note.split('\n')// array
            .map(function(str){return str.trim();}) // array
            .join('\n'); // string
        
        noteElement = document.createElement('note');
        noteElement.appendChild(document.createTextNode(note));
        return noteElement;
    }
    
    
    function _writeImage(image, document) {
        var i=0,
            attr, defaultVal, imageElement;
            
        if(!imageValidator(image))
            throw new GlifLibError('image attribute must be a dict or '
                + 'dict-like object with the proper structure.');
        
        imageElement = document.createElement('image');
        imageElement.setAttribute('fileName', image.fileName);
        
        for(; i<transformationInfo.length; i++) {
            attr = transformationInfo[i][0];
            defaultVal = transformationInfo[i][1];
            if(image[attr] !== undefined && image[attr] !== defaultVal)
                imageElement.setAttribute(attr, image[attr]);
        }
        
        if(image.color !== undefined)
            imageElement.setAttribute('color', image.color);
        
        return imageElement;
    }
    
    function _writeGuidelines(guidelines, document, identifiers) {
        var i=0, fragment, guidelineElement;
        if(!guidelinesValidator(guidelines, identifiers))
            throw new GlifLibError('guidelines attribute does not have '
                + 'the proper structure.');
        
        fragment = document.createDocumentFragment();
        for (; i<guidelines.length; i++) {
            guidelineElement = document.createElement('guideline');
            // 'x', 'y', 'angle', 'name', 'color', 'identifier'
            _setAttributes.call(guidelineElement, guidelines[i]);
            fragment.appendChild(guidelineElement);
        }
        return fragment;
    }
    
    function _writeAnchorsFormat1(pen, anchors) {
        var i = 0,
            anchor;
        if(!anchorsValidator(anchors))
            throw new GlifLibError('anchors attribute does not have the '
                + 'proper structure.');
        for(; i<anchors.length; i++) {
            anchor = anchors[i];
            pen.beginPath()
            pen.addPoint([anchor.x, anchor.y], "move", false, anchor.name);
            pen.endPath()
        }
    }
    
    function _writeAnchors(anchors, document, identifiers) {
        var i=0, fragment, anchorElement;
        if(!anchorsValidator(anchors, identifiers))
            throw new GlifLibError('anchors attribute does not have the '
                + 'proper structure.');
        
        fragment = document.createDocumentFragment();
        for (; i<anchors.length; i++) {
            anchorElement = document.createElement('anchor');
            _setAttributes.call(anchorElement, anchors[i]);
            fragment.appendChild(anchor)
        }
        return fragment;
    }
    
    function _writeLib(lib, document) {
        var validation, libElement;
        
        validation = glyphLibValidator(lib);
        if(!validation[0])
            throw new GlifLibError(validation[1]);
        
        if (!plistLib.getType(lib) !== 'dict')
            lib = {lib};
            
        libElement = document.createElement('lib');
        libElement.appendChild(
            plistLib.createPlistElement(document, lib)
        );
        return libElement;
    }
    
    return {
        toString: writeGlyphToString, 
        toDOM: writeGlyphToDOM
    }
});

