/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 */

define(function() {
    "use strict";
    var dom = {
        // https://developer.mozilla.org/en/Using_XPath
        evaluateXPath: function(aNode, aExpr) {
            var xpe = aNode.ownerDocument || aNode;
            var nsResolver = xpe.createNSResolver(xpe.documentElement);
            var result = xpe.evaluate(
                aExpr,
                aNode,
                nsResolver,
                XPathResult.ORDERED_NODE_ITERATOR_TYPE,
                null
            );
            var found = [];
            var res;
            while (res = result.iterateNext())
                found.push(res);
            return found;
        },
        getAtrributesAsDict: function(DOMElement) {
            var dict = {};
            for (var i = 0; i < DOMElement.attributes.length; i++) {
                var attrib = DOMElement.attributes[i];
                dict[attrib.name] = attrib.value;
            }
            return dict;
        }
    };
    return dom;
});
