define([
    'metapolator/errors'
  , './baseFactories'
  , 'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/elements/SelectorList'
  , 'metapolator/models/CPS/elements/ComplexSelector'
  , 'metapolator/models/CPS/elements/Combinator'
  
], function (
    errors
  , baseFactories
  , Rule
  , SelectorList
  , ComplexSelector
  , Combinator
) {
    "use strict";
    var CPSError = errors.CPS;
    /**
     * Constructors OR factory functions
     * this can be both because JavaScript allows to call a factory function
     * using the new operator like in `new myfactory()`. The factory must
     * return a new object in this case.
     * 
     * all constructors take the following arguments: (node, source)
     * @node: object as created by parserEngine._makeNode and augmented by
     * parserEngine
     * @source: instance of parameters/Source
     * 
     * We'll use mostly factories, because the "node" we use as argument
     * is not exactly a nice interface. However, its called _nodeConstructors
     * because that implies that these functions are beeing called using
     * the `new` keyword.
     * 
     * see: https://github.com/css/gonzales/blob/master/doc/AST.CSSP.en.md
     */
     
    // inherit from baseFactories
    var selectorFactories = Object.create(baseFactories);
    (function(factories){
        var k;
        for(k in factories) selectorFactories[k] = factories[k];
    })({        
        /**
         * ruleset:
         * 
         * Has a "selector" as first child and a "block" as second child.
         * 
         * From the docs:
         * Consists of selector (selector) and block (a set of rules).
         */
        'ruleset': function(node, source) {
            var selectorList, parameterDict;
            if(node.children[0].type !== 'selector')
                throw new CPSError('The first child of "ruleset" is '
                + 'expected to be a "selector", but got "' + node.children[0].type +'" '
                +'" in a ruleset from: ' + source + 'line: '
                + node.lineNo
                +'.', (new Error).stack)
            
            if(node.children[1].type !== 'block')
                throw new CPSError('The second child of "ruleset" is '
                + 'expected to be a "block", but got "' + node.children[1].type +'" '
                +'" in a ruleset from: ' + source + 'line: '
                + node.lineNo
                +'.', (new Error).stack)
            selectorList = node.children[0].instance;
            parameterDict = node.children[1].instance;
            
            return new Rule(selectorList, parameterDict, source, node.lineNo)
        }
        // just a stub
      , 'block': function(node, source){
            var item = baseFactories['__GenericAST__'](node, source);
            item.selects = true;
            return item;
        }
        /**
         * selector:
         * 
         * A list of selectors.
         * 
         * It contains 'simpleselector' and divides these by 'delim'.
         * delim is a comma in the serialization. Comments are not in here,
         * as these map to the 'simpleselector's.
         * 
         * From the docs:
         * Node to store simpleselector groups.
         */
      , 'selector': function(node, source) {
            var items
              , selectorList
              ;
            items = node.children
                .filter(function(item){return item.type === 'simpleselector'})
                .map(function(item){return item.instance;})
            return new SelectorList(items, source, node.lineNo)
        }
        /**
         * simpleselector:
         * 
         * An item in a list of selectors "selector".
         * 
         * This has a lot different elements, also whitespace 's' AND
         * comments 'comment' etc.
         */
      , 'simpleselector': function(node, source) {
            var elements = node.children
                .map(function(item){return item.instance;})
            
            return new ComplexSelector(elements, source, node.lineNo);
        }
        /**
         * 
         * Combinator: +, >, ~
         * is a child of ComplexSelector
         * 
         */
      , 'combinator': function (node, source) {
            return new Combinator(node.data, source, node.lineNo);
        }
    });
    return selectorFactories;
})
