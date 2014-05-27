/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * These methods currently return only the contour data from glif files.
 */

define(['./dom', './glyph'], function(dom, glyph) {
    "use strict";
    /*definition*/
    var glyphFactories = {
        fromGlifString: function(glifString) {
            var parser = new DOMParser();
            var glifDoc = parser.parseFromString(glifString, "text/xml");
            return glyphFactories.fromGlifDocument(glifDoc)
        },
        fromGlifDocument: function(glifDoc) {
            var glyph = {},
                outlineChildrenExpr = '/glyph/outline[1]/contour|/glyph/outline[1]/component',
                outlineElements = dom.evaluateXPath( glifDoc, outlineChildrenExpr ),
                contourExpr = './point';
                                
            glyph.outline = outlineElements.map(function(element){
                var value;
                if(element.tagName === 'contour') {
                    value = dom.evaluateXPath( element, contourExpr )
                                .map(dom.getAtrributesAsDict);
                } else if(element.tagName === 'component') {
                    value = dom.getAtrributesAsDict(element);
                }
                return[element.tagName, value];
            });
            return glyph;
        }
    }
    return glyphFactories;
});
