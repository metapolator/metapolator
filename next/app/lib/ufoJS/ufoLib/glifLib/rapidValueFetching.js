/**
 * Copyright (c) 2012, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This is a port of various functions for "rapid value fetching" defined in
 * robofab/branches/ufo3k/Lib/ufoLib/gliflib.py
 * 
 * it uses XPATH and DOM Documents, so its very different to the python
 * code.
 */
define(
    [
    'main',
    'ufojs/xml/main'
    ],
    function(
        main,
        xml
) {
    "use strict";
    // FIXME: put this into a module of ufojs/xml/
    // from https://developer.mozilla.org/en-US/docs/Using_XPath
    // Evaluate an XPath expression aExpression against a given DOM node
    // or Document object (aNode), returning the results as an array
    // thanks wanderingstan at morethanwarm dot mail dot com for the
    // initial work.
    function evaluateXPath(aNode, aExpr) {
        var xpe = new xml.XPathEvaluator();
            nsResolver = xpe.createNSResolver(
                aNode.ownerDocument == null
                    ? aNode.documentElement
                    : aNode.ownerDocument.documentElement
            ),
            result = xpe.evaluate(aExpr, aNode, nsResolver, 0, null),
            found = [],
            res;
        while (res = result.iterateNext())
            found.push(res);
        return found;
    }
    
    function _getAttributeValue(attribute) {
        return attribute.value;
    }
    
    var x_unicodes = '/glyph/unicode/@hex',
        x_components = '/glyph/outline[1]/component/@base',
        x_image = '/glyph/image[1]/@fileName';
    
    /**
     * Get a list of unicodes listed in glif
     */
    function fetchUnicodes(doc) {
        var results = evaluateXPath(doc, x_unicodes).map(_getAttributeValue),
            unicodes = { dict: {}, list: [] },
            i = 0,
            v;
        for(; i<results.length; i++) {
            v = parseInt(results[i], 16);
            if(!isFinite(v) || v in unicodes.dict) continue;
            unicodes.dict[v] = true;
            unicodes.list.push(v);
        }
        return unicodes.list;
    }
    
    /**
     * The image file name (if any) from glif.
     */
    function fetchImageFileName(doc) {
        return evaluateXPath(doc, x_image).map(_getAttributeValue)[0];
    }
    
    /**
     * Get a list of component base glyphs listed in glif.
     */
    function fetchComponentBases(doc) {
        return evaluateXPath(doc, x_components).map(_getAttributeValue);
    }
    
    return {
        fetchUnicodes: fetchUnicodes,
        fetchImageFileName: fetchImageFileName,
        fetchComponentBases: fetchComponentBases
    }
});
