/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * just in case your need the definition of a plist and your internet died,
 * this are the contents of http://www.apple.com/DTDs/PropertyList-1.0.dtd:
<!ENTITY % plistObject "(array | data | date | dict | real | integer | string | true | false )" >
<!ELEMENT plist %plistObject;>
<!ATTLIST plist version CDATA "1.0" >

<!-- Collections -->
<!ELEMENT array (%plistObject;)*>
<!ELEMENT dict (key, %plistObject;)*>
<!ELEMENT key (#PCDATA)>

<!--- Primitive types -->
<!ELEMENT string (#PCDATA)>
<!ELEMENT data (#PCDATA)> <!-- Contents interpreted as Base-64 encoded -->
<!ELEMENT date (#PCDATA)> <!-- Contents should conform to a subset of ISO 8601 (in particular, YYYY '-' MM '-' DD 'T' HH ':' MM ':' SS 'Z'.  Smaller units may be omitted with a loss of precision) -->

<!-- Numerical primitives -->
<!ELEMENT true EMPTY>  <!-- Boolean constant true -->
<!ELEMENT false EMPTY> <!-- Boolean constant false -->
<!ELEMENT real (#PCDATA)> <!-- Contents should represent a floating point number matching ("+" | "-")? d+ ("."d*)? ("E" ("+" | "-") d+)? where d is a digit 0-9.  -->
<!ELEMENT integer (#PCDATA)> <!-- Contents should represent a (possibly signed) integer number in base 10 -->
 */

define([
    'ufojs'
  , 'ufojs/errors'
  , 'ufojs/xml/main'
  , 'ufojs/tools/io/main'
  , 'ufojs/obtainJS/lib/obtain'
  , './DataObject'
  , './IntObject'
], function(
    main
  , errors
  , xml
  , io
  , obtain
  , DataObject
  , IntObject
) {
    "use strict";
    //shortcuts
    var TypeError = errors.Type,
        ValueError = errors.Value,
        parseDate = main.parseDate;
    
    var PlistQualifiedNameStr = 'plist',//this is going to be the documentElement
        PlistPublicId = '-//Apple//DTD PLIST 1.0//EN',
        PlistSystemId = 'http://www.apple.com/DTDs/PropertyList-1.0.dtd';
    
    /*definition*/
    var plistLib = {
        types: {
            Data: DataObject,
            Int: IntObject
        },
        readPlistFromString: function(plistString) {
            var plistDoc = xml.parseXMLString(plistString);
            return plistLib.readPlistFromDocument(plistDoc);
        },
        /**
         * Read a .plist file. path may be a file name. Return the unpacked
         * root object (which usually is a dictionary).
         * 
         * see obtainJS for the switch betwen sync/async mode
         * sync is blocking, while async is not
         * 
         * readPlistFromFile(@swich async/sync, path)
         */
        readPlistFromFile: obtain.factory(
            { // sync
                plistString: ['path', io.readFileSync]
            }
          , { // async
                plistString: ['path', '_callback', io.readFile]
            }
          , ['path']
          , function(obtain, path) {
                var plistString = obtain('plistString')
                return plistLib.readPlistFromString(plistString)
            }
        ),
        readPlistFromDocument: function(plistDoc) {
            var root = plistDoc.documentElement;
            if(root.nodeName !== 'plist')
                throw new TypeError('The documentElement is expected to be '
                    + '"plist", but it is "' + root.nodeName + '"');
            // <!ELEMENT plist %plistObject;> from the plist DTD means
            // there is only on child element of plist which is an member
            // of plistObject is that correct. If yes, we start with
            // .firstElementChild (.children[0] is synonym to .firstElementChild
            // but supported by jsdom, the DOM implementation uses for
            // environments without native DOM.
            // chromium/google chrome has no children list :-/
            if(!root.firstElementChild && !root.children.length)
                return null;
            return plistLib.readPlistElement(root.firstElementChild || root.children[0]);
        },
        createPlistDocument: function(value) {
            var doc = plistLib._createPlistDOMDocument();
            var child = this.createPlistElement(doc, value);
            if(!child)
                return false;
            doc.documentElement.appendChild(child);
            return doc;
        },
        createPlistElement: function(doc /* DOM Document */, value) {
            return plistLib._createElement(doc, value) || false;
        },
        /**
         * returns a value serialized as plist xml string.
         * 
         * This seems to work so far, but the browsers have still some
         * quirks, especially if you are looking for pretty printed xml.
         * For further processing the output is ok.
         */
        createPlistString: function(value) {
            var doc = plistLib.createPlistDocument(value),
                returnString,
                serializer;
            /* maybe useful when pretty printing gets interesting,
             * now it seems that browsers do not really make the xslt part
             * good. firefox 7 had problems with the indent="yes" part,
             * what makes the xslt solution half baked. Chromium, however,
             * did well.
            if(prettyPrint) {
                var xslt = xml.parseXMLString([
                    '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
                        '<xsl:output method="xml" indent="yes" doctype-public="' + PlistPublicId + '" doctype-system="'+PlistSystemId+'"/>',
                        '<xsl:template match="node()|@*">',
                            '<xsl:copy>',
                            '<xsl:apply-templates select="node()|@*"/>',
                            '</xsl:copy>',
                        '</xsl:template>',
                    '</xsl:stylesheet>'].join(''), 'text/xml'),
                    processor = new xml.XSLTProcessor();
                processor.importStylesheet(xslt);
                var doc = processor.transformToDocument(doc); 
            }
            */
            return xml.docToString(doc);
        },
        _createPlistDOMDocument: function() {
            var namespaceURI = null,
                documentType = xml.createDocumentType(
                    PlistQualifiedNameStr, PlistPublicId, PlistSystemId),
                doc = xml.createDocument(
                    namespaceURI, PlistQualifiedNameStr, documentType);
            doc.documentElement.setAttribute('version', '1.0');
            return doc;
        },
        getType: function(value) {
            if(value instanceof IntObject)
                return 'integer';
            else if(value instanceof Number || typeof value === 'number')
                return 'real';
            else if(value instanceof Date)
                return 'date'
            else if(value instanceof DataObject)
                return 'data';
            else if(value instanceof Array)
                return 'array';
            else if(value instanceof Boolean || typeof value === 'boolean')
                return value ? 'true' : 'false';
            else if(value instanceof String || typeof value === 'string')
                return 'string';
            else if(value instanceof Object)
                return 'dict';
            else
                return false;
        },
        _createElement: function(doc, value) {
            var type, element, content;
            type = plistLib.getType(value);
            if(!type) return false;
            element = doc.createElement(type);
            content = plistLib._plistElementWriters[type](doc, value);
            if(content !== null)
                element.appendChild(content);
            return element;
        },
        readPlistElement: function(plistElement) {
            var type = plistElement.nodeName;
            if(!(type in plistLib._plistElementReaders))
                throw new TypeError(['A PlistElement of type "' , type, '" is not supported.'].join(''));
            return plistLib._plistElementReaders[type](plistElement);
        },
         /**
         * return a list of childNodes that are DOM-elements discard the others
         */
        _getChildElements: function(elem) {
            var list =
                // make a real array out of the nodeList
                [].slice.call(elem.childNodes)
                // remove all nodes that are not elements -- textnodes
                // (for formatting) and comments etc.
                .filter(function(node){return node.nodeType === node.ELEMENT_NODE});
            return list;
        },
        _getText: function(elem) {
            return elem.textContent
        },
        _plistElementReaders: {
            array: function(elem){
                return plistLib._getChildElements(elem)
                    //read the values of the elements
                    .map(plistLib.readPlistElement);
            },
            data: function(elem) {
                return new DataObject(plistLib._getText(elem));
            },
            date: function(elem){
                return new Date(parseDate(plistLib._getText(elem)));
            },
            /**
             * It seems like the robofab plistParser would just ignore
             * subsequent key elements, always the last key is the one
             * that will be used (once of course). But when there is no
             * key for a value, the parser will fail. I'm doing the same
             * here. However, the dtd forces one plistObject after each key
             * <!ELEMENT dict (key, %plistObject;)*>
             **/
            dict: function(elem) {
                var dict = {},
                    childElements = plistLib._getChildElements(elem),
                    key;
                for(var i=0; i<childElements.length; i++) {
                    if(childElements[i].nodeName === 'key') {
                        //if key !== undefined this is an error, but we skip this
                        key = plistLib._getText(childElements[i]);
                    } else if(key === undefined || key === null) {
                        throw new ValueError('Dict has a value without a key.');
                    } else {
                        dict[key] = plistLib.readPlistElement(childElements[i]);
                        key = undefined;
                    };
                }
                return dict;
            },
            real: function(elem) {
                return parseFloat(plistLib._getText(elem));
            },
            integer: function(elem) {
                return new IntObject(plistLib._getText(elem));
            },
            string: function(elem) {
                return plistLib._getText(elem);
            },
            'true': function(elem) {
                return true
            },
            'false': function(elem) {
                return false
            }
        },
        _plistElementWriters: {
            array: function(doc, list) {
                var fragment = doc.createDocumentFragment(),
                    elem;
                for(var i=0; i<list.length; i++) {
                    elem = plistLib._createElement(doc, list[i]);
                    if(!elem) continue;
                    fragment.appendChild(elem);
                }
                return fragment;
            },
            data: function(doc, elem) {
                return doc.createTextNode(elem);
            },
            date: function(doc, date) {
                return doc.createTextNode(date.toISOString());
            },
            dict: function(doc, dict) {
                var fragment = doc.createDocumentFragment(),
                    key, value, keyElement;
                for(key in dict) { 
                    if(!dict.hasOwnProperty(key) || dict[key] === undefined || dict[key] === null)
                        //there is no notation for empty things in plist
                        continue;
                    value = plistLib._createElement(doc, dict[key]);
                    if(!value) continue;
                    keyElement = doc.createElement('key');
                    keyElement.appendChild(doc.createTextNode(key));
                    fragment.appendChild(keyElement);
                    fragment.appendChild(value);
                }
                return fragment;
            },
            real: function(doc, number) {
                return doc.createTextNode(number.toString());
            },
            integer: function(doc, number) {
                return doc.createTextNode(number);
            },
            string: function(doc, string) {
                return doc.createTextNode(string)
            },
            'true': function(doc, elem) {
                return null
            },
            'false': function(doc, elem) {
                return null
            }
        },
        /**
         * this method is a Tool considered for testing the plist parsing
         * and thus not 'public'.
         * When there's a real need for this thing we should make a
         * specification for it. There is a lot of stuff to take into account
         * when figuring out whether two javascript objects look the same.
         * 
         * This does not check if the keys of a and b are in the same order.
         * I consider plist dicts as 'unordered'. That means their value
         * doesn't change when changing just the order of key-value pairs.
         **/
        _comparePlists: function(a, b, verbose) {
            var compare = function(a, b, path, recursive) {
                if(a === b) return true;//allows syncronous recursion i.e the same object is a an b
                if(typeof a !== 'object') return false;//this is the point, we want to compare similar objects
                if(a instanceof Date)
                   return b instanceof Date && a.getTime()===b.getTime();
                for(var i=0; i<recursive.length; i++) {
                    if(recursive[i] === a)
                        throw new ValueError([path.join('.'),'async recursion detected'].join(' '));
                }
                recursive.push(a);
                for(var key in a) {
                    path.push(key);
                    if(!(key in b)) return false;
                    if(!a.hasOwnProperty(key)) {
                        if(b.hasOwnProperty(key)) return false;
                        //don't walk down the prototype
                        if(a[key] === b[key]) continue;
                        return false;
                    }
                    if(!compare(a[key], b[key], path, recursive)) return false;
                    path.pop();
                }
                for(var key in b)//maybe b had more keys than a
                    if(!(key in a)) return false;
                recursive.pop();
                return true;
            }, path = [''], recursive = [];
            if(!compare(a, b, path, recursive)) {
                if(verbose) console.log(path.join('.'), 'looks not the same ');
                return false;
            }
            return true;
        }
    }
    return plistLib;
});
