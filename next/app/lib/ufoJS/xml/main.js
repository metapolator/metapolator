/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This returns the browsers xml tools or if in nodejs a mapping to the
 * libxmljs api so that it can be used like the w3c tools.
 * 
 * IMPORTANT for nodejs with libxmljs: As the need of this project regarding
 * xml tools is not so big, there will likely be no full DOM w3c api
 * available. Thus, things like running jQuery on a libxmljs element won't
 * work.
 * As it appears the jsdom people are making exactly that possible, so the
 * notice above might become outdated.
 */

define([
    'ufojs/errors'
], function(
    errors
) {
    "use strict";
    var DependencyError = errors.Dependency
      , TypeError = errors.Type
      , NotImplementedError = errors.NotImplemented
      , ParserError = errors.Parser
      , xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>'
      , xml, implementation
      ;
    
    if(typeof DOMParser !== 'undefined') {
        
        var Parser = function() {
                this._parser = new DOMParser();
            }
          , Serializer = function() {
                this._serializer = new XMLSerializer();
            }
          ;
        implementation = 'w3c';
        //this is straightforward, we just map the apis that are there
        xml = {
            xmlDeclaration: xmlDeclaration,
            get implementation() {
                return implementation;
            },
            /**
             * This strange sort of extending is done because:
             * a) native objects can't be extended by the ussual prototype
             *    mechanism.
             * b) The browser parsers fail at throwing Errors when parsing
             *    fails, and we need a common api.
             */
            Parser: Parser,
            Serializer: Serializer,
            XPathEvaluator: XPathEvaluator,
            XPathResult: XPathResult,
        // XPathException is undefined in Firefox
        //    XPathException: XPathException,
            XSLTProcessor: XSLTProcessor,
            Node: window.Node,
            createDocument: function() {
                var args = [].slice.call(arguments);
                return document.implementation.createDocument.apply(
                    document.implementation, args);
            },
            createDocumentType: function() {
                var args = [].slice.call(arguments);
                return document.implementation.createDocumentType.apply(
                    document.implementation, args);
            },
            parseXMLString: function(string) {
                var parser = new Parser();
                return parser.parseFromString(string, 'text/xml');
            },
            docToString: function(doc) {
                return (new Serializer()).serializeToString(doc)
            }
        }
        
        //TODO: implement more of the parser interfaces if needed
        Parser.prototype.parseFromString = function(markup, type) {
            var result = this._parser.parseFromString(markup, type);
            
            // in case of an error chrome returns an html document where
            // somwhere is a <parsererror> element embedded: 
            // <html xmlns="http://www.w3.org/1999/xhtml"><body><parsererror style=" ... "><h3> ...
            // sometimes its not html :/
            //
            // firefox returns a document like this:
            // <?xml-stylesheet href="chrome://global/locale/intl.css" type="text/css"?>
            // <parsererror xmlns="http://www.mozilla.org/newlayout/xml/parsererror.xml">
            // ...
            
            if(result.documentElement.tagName === 'parsererror')
                // this works in firefox
                throw new ParserError('XML DOMParser: ' + result.documentElement.textContent);
            // maybe, if we're going to parse xhtml we should try to find
            // more indicators. Right now html as root element is just fine,
            // because there is no other case for an html result in ufoJS.
            // cmon, sometimes its not html in webkit :-|
            // else if(result.documentElement.tagName === 'html') {
            else {
               // handle the webkit error if it is there
               // this is from: https://bugs.webkit.org/show_bug.cgi?id=13057
                   
                var nsResolverWebkit = function (prefix) {
                        if (prefix == "x")
                            return "http://www.w3.org/1999/xhtml";
                        return null;
                    }
                  , expression = "//x:parsererror//x:div"
                  , errorNode = (new XPathEvaluator())
                        .evaluate(expression, result, nsResolverWebkit, 0, null)
                        .iterateNext()
                  ;
               if (errorNode)
                   throw new ParserError('XML DOMParser: ' + errorNode.textContent);
            }
            return result;
        }
        
        Serializer.prototype.serializeToString = function(doc) {
            var result = this._serializer.serializeToString(doc);
            if(result.indexOf('<?xml') !== 0) 
                result = [xmlDeclaration, result].join('\n')
            return result;
        };
    }
    else {
        /**
        * this is for the nodejs environment
        * 
        * The impementation is not complete but enough for my purposes.
        * If there is a better W3C DOM environment for nodeJS please let me
        * know.
        * caveats:
        * The sax parser does not mention things that would be interesting
        * for xsl/xslt/dtd parsing
        * especially the Doctype of your document won't be recognized
        * 
        * The Serializer throws NotImplementedError on:
        * ENTITY_REFERENCE_NODE, ENTITY_NODE, NOTATION_NODE
        */
        
        
        // the files libs are loaded syncronously with requireJS handing over
        // the call to nodes commomJS require mechanism
        
        // jsdom is available via nodes npm or http://jsdom.org
        var r = require.nodeRequire
          , path = r('path')
          , dom = r('jsdom').dom.level3.core
            //dunno why i need to force node like this to load the files
          , jsdomPath = path.dirname(r.resolve('jsdom')) + '/jsdom/'
          , encodeHTML = r(jsdomPath + 'browser/htmlencoding.js').HTMLEncode
            // https://github.com/polotek/libxmljs
            // another sax parser is https://github.com/robrighter/node-xml 
          , xmlparser = r('libxmljs')
          , Parser = function(){}
          , Serializer = function(){}
          ;
        if(!dom)
            throw new DependencyError('No XML api available.');
        
        
        implementation = 'jsdom';
        xml = {
            xmlDeclaration: xmlDeclaration,
            Parser: Parser,
            Serializer: Serializer,
            XPathEvaluator: dom.XPathEvaluator,
            XPathResult: dom.XPathResult,
        //    XPathException: dom.XPathException,
            Node: dom.Node,
            createDocument: function() {
                var args = [].slice.call(arguments),
                    implementation = new dom.DOMImplementation();
                return implementation.createDocument.apply(implementation, args);
            },
            createDocumentType: function() {
                var args = [].slice.call(arguments),
                    implementation = new dom.DOMImplementation();
                return implementation.createDocumentType.apply(implementation, args);
            },
            get implementation() {
                return implementation;
            },
            parseXMLString: function(string) {
                var parser = new Parser();
                return parser.parseFromString(string, 'text/xml');
            },
            docToString: function(doc) {
                return (new xml.Serializer()).serializeToString(doc);
            }
        };
        //FIXME: How would we get the doctype for our document?
        Parser.prototype.parseFromString = function(string, mimeType) {
            if(!(mimeType in {'text/xml': true, 'application/xml': true}))
                //so it's clear that we don't support html here
                throw new TypeError('MIME-Type must be an XML type like '
                    + '"text/xml" or "application/xml".');
            
            var options = {contentType: mimeType},
                doc = new dom.Document(options),
                currentElement = doc,
                totalElements = 0,
                parser,
                error;
            
            parser = new xmlparser.SaxParser({
                endDocument: function() {
                    var counted = doc.getElementsByTagName("*").length;
                    //errors.assert(
                    //    doc.getElementsByTagName("*").length === totalElements,
                    //    ['Expected', totalElements,
                    //        'elements but found', counted].join(' ')
                    //);
                },
                startElementNS: function(elem, attrs, prefix, uri, namespaces) {
                    totalElements++;
                    var element;
                    if(uri)
                        element = doc.createElementNS(uri, prefix+':'+elem);
                    else
                        element = doc.createElement(elem);
                    //attrs - an array of arrays: [[key, prefix, uri, value]]
                    attrs.map(function(attr){
                        var key = attr[0],
                            prefix = attr[1],
                            uri = attr[2],
                            value = attr[3];
                        if(uri)
                            element.setAttributeNS(
                                uri,
                                (prefix) ? prefix + ':' + key : key,
                                value
                            );
                        else
                            element.setAttribute(key, value);
                    });
                    namespaces.map(function(attr){
                        var name = attr[0],
                            value = attr[1];
                        element.setAttribute('xmlns:' + name, value || '');
                    });
                    
                    currentElement.appendChild(element);
                    currentElement = element;
                },
                endElementNS: function(elem, prefix, uri) {
                    currentElement = currentElement.parentNode;
                },
                characters: function(chars) {
                    var node = doc.createTextNode(chars);
                    currentElement.appendChild(node);
                },
                cdata: function(cdata) {
                    var node = doc.createCDATASection(cdata);
                    currentElement.appendChild(node);
                },
                comment: function(comment) {
                    var node = doc.createComment(comment);
                    currentElement.appendChild(node);
                },
                warning: function(message) {
                    errors.warn('XML SAX2 Parser: ' + message);
                },
                error: function(message) {
                    error = new ParserError('XML SAX2 Parser: ' + message);
                }
            });
            parser.parseString(string);
            if(error)
                throw error
            return doc;
        };
        
        var _serializer = {
            dispatch: function(node) {
                _serializer.renderer[node.nodeType].call(this, node);
            },
            renderer: {}
        };
        _serializer.renderer[dom.Node.ELEMENT_NODE] = function(node) {
            var empty = (node.childNodes.length === 0)
                , attributes = []
                , children = []
                , end = empty
                    ? ['/>']
                    : ['</', node.tagName, '>']
                ;
            
            this.push('<', node.tagName);
            Array.prototype.slice.call(node.attributes)
                                    .map(_serializer.dispatch, this);
            
            if(node.childNodes.length) {
                this.push('>');
                Array.prototype.slice.call(node.childNodes)
                                        .map(_serializer.dispatch, this);
                this.push('</', node.tagName, '>');
            }
            else
                this.push('/>');
        };
        _serializer.renderer[dom.Node.ATTRIBUTE_NODE] = function(node){
            //prepending a space before every attribute
            this.push(' ', node.name, '="', encodeHTML(node.nodeValue, true), '"');
        };
        _serializer.renderer[dom.Node.TEXT_NODE] = function(node){
            this.push(encodeHTML(node.nodeValue));
        };
        _serializer.renderer[dom.Node.CDATA_SECTION_NODE] = function(node) {
            this.push('<![CDATA[', node.nodeValue, ']]>');
        };
        _serializer.renderer[dom.Node.ENTITY_REFERENCE_NODE] = function(node) {
            throw new NotImplementedError('Rendering the node type ENTITY_REFERENCE_NODE.');
        };
        _serializer.renderer[dom.Node.ENTITY_NODE] = function(node) {
            throw new NotImplementedError('Rendering the node type ENTITY_NODE.');
        };
        _serializer.renderer[dom.Node.PROCESSING_INSTRUCTION_NODE] = function(node){
            this.push('<?', node.target, ' ', node.nodeValue,'?>');
        };
        _serializer.renderer[dom.Node.COMMENT_NODE] = function(node) {
            this.push('<!--', node.nodeValue, '-->');
        };
        _serializer.renderer[dom.Node.DOCUMENT_NODE] = function(node) {
            Array.prototype.slice.call(node.childNodes).map(_serializer.dispatch, this);
        };
        _serializer.renderer[dom.Node.DOCUMENT_TYPE_NODE] = function(node) {
            var quote;
                
            this.push('<!DOCTYPE ', node.name);
                
            if (node.publicId)
                // Public ID may never contain double quotes, so this is always safe.
                this.push(' PUBLIC "', node.publicId,'" ');
            if (node.systemId) {
                if (!node.publicId)
                    this.push(' SYSTEM ');
                // System ID may contain double quotes OR single quotes, never both.
                quote = (node.systemId.indexOf('"') > -1)
                    ? '\''
                    : '"';
                this.push(quote, node.systemId, quote);
            }
            this.push('>');
        };
        _serializer.renderer[dom.Node.DOCUMENT_FRAGMENT_NODE] = function(node) {
            return Array.prototype.slice.call(node.childNodes)
                                        .map(_serializer.dispatch, this);
        };
        _serializer.renderer[dom.Node.NOTATION_NODE] = function(node) {
            throw new NotImplementedError('Rendering the node type NOTATION_NODE.');
        };
        
        Serializer.prototype.serializeToString = function(doc) {
            var tokens = [xmlDeclaration, '\n'];
            _serializer.dispatch.call(tokens, doc);
            return tokens.join('');
        };
    }
    return xml;
});
