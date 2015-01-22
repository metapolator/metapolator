define([
    'metapolator/errors'
  , './baseFactories'
  , 'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/elements/SelectorList'
  , 'metapolator/models/CPS/elements/ComplexSelector'
  , 'metapolator/models/CPS/elements/CompoundSelector'
  , 'metapolator/models/CPS/elements/SimpleSelector'
  , 'metapolator/models/CPS/elements/Combinator'
  , 'metapolator/models/CPS/elements/GenericCPSNode'
  , 'metapolator/models/CPS/elements/Comment'
  
], function (
    errors
  , baseFactories
  , Rule
  , SelectorList
  , ComplexSelector
  , CompoundSelector
  , SimpleSelector
  , Combinator
  , GenericCPSNode
  , Comment
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
         * 
         * creates a ComplexSelector
         */
      , 'simpleselector': function(node, source, ruleController) {
            var elements = node.children
                    .map(function(item){return item.instance;})
              , invalid = false
              , alien = false
              , invalidMessage
              , value = []
              , fallbackString
                /* combinators that are not alien */
              , combinators = {
                    // the child combinator
                    'child' : true
                    // whitespace is the descendant combinator, but we have to detect
                    // this another way
                }
              , i=0
              , item
              , compoundSelectorElements = null
              , isWhitespace
              ;
            for(; i<elements.length; i++) {
                item = elements[i];
                isWhitespace = (item instanceof GenericCPSNode && item.type === 's');
                if(isWhitespace && value.length === 0)
                    // skip all whitespaces at the beginning
                    continue;
                else if(item instanceof Comment)
                    // skip all comments
                    // we can get them back in if we want though
                    continue;
            
                if(item instanceof Combinator) {
                    // close the current simple selector
                    compoundSelectorElements = null;
                    value.push(item);
                    continue;
                }
                
                // may be whitespace, or a simple selector
                if(isWhitespace) {
                    // close the current simple selector
                    compoundSelectorElements = null;
                    continue;
                }
                
                // must be a simple selector (or invalid/alien)
                if(compoundSelectorElements === null) {
                    // if no other combinator is already there:
                    if(value.length && !(value[value.length-1] instanceof Combinator))
                        // push a simple 'descendant' Combinator
                        // it's somehow pointless to use this._source, this._lineNo
                        // in this case. we could have remembered the source and line
                        // of the last whitespace
                        value.push(new Combinator(' ', source, node.lineNo));
                
                    // make a new one
                    compoundSelectorElements = [];
                    value.push(compoundSelectorElements);
                }
                compoundSelectorElements.push(item);
            }
            // build the CompoundSelectors
            for(i=0; i<value.length; i++) {
                if(value[i] instanceof Combinator)
                    continue;
                // replace directly
                value[i] = compoundSelectorFactory(value[i],
                                value[i][0]._source, value[i][0]._lineNo
                              , ruleController && ruleController.selectorEngine)
            }
            return new ComplexSelector(value, source, node.lineNo);
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
    })
    
    
    function _getImplicitUniversalSelector(source, lineNo) {
        var ast = new GenericCPSNode(['ident', '*'])
          , selector = new SimpleSelector({type: 'universal', name: '*'}
                                                    , source, lineNo)
          ;
          // mark as implicit, so we can let it out when serializing again
          // this is not very 'clean' but very 'practical'
          Object.defineProperty(selector, '___implicit', {value: true});
        return selector;
    }

    /**
     * selectorEngine is optional if not present the selector will be compiled
     * lazily when used first.
     */
    function compoundSelectorFactory(elements, source, lineNo, selectorEngine) {
        var i = 0
          , selectors = []
          , cs
          ;
        for(;i<elements.length;i++) {
            if(!(elements[i] instanceof GenericCPSNode))
                throw new CPSError(['Unknown type for a simple selector:'
                                  , item.constructor.name, 'typeof:'
                                  , typeof item].join(' ')
                                  );
            selectors.push(simpleSelectorFactory(elements[i]));
        }
        cs = new CompoundSelector(selectors, source, lineNo);
        // compiling now moves the load to the parsing process
        if(selectorEngine)
            cs.compile(selectorEngine);
        return cs;
    }
    
    
    function _getSimpleSelectorType(type, name) {
        switch(type) {
          case 'ident':
            if(name === '*')
                return 'universal';
            return 'type';
          case 'clazz':
            return 'class';
          case 'shash':
            return 'id';
          case 'pseudoc':
            return 'pseudo-class';
          case 'pseudoe':
            return 'pseudo-element';
        }
        return undefined;
    }
    
    function _getSimpleSelectorName(element) {
        var name = name;
        if(typeof element._ast[1] === 'string') {
            name = element._ast[1];
        }
        else if(element._ast[1] instanceof Array) {
            if(element._ast[1][0] === 'ident')
                name = element._ast[1][1];
            else if(element._ast[1][0] === 'funktion'
                    && element._ast[1][1] instanceof Array
                    && element._ast[1][1][0] === 'ident')
                name = element._ast[1][1][1];
        }
        if(typeof name !== 'string' && name !== undefined)
            throw new CPSError('Can\'t find a name for SimpleSelector ('
                            + element + ')')
        return name;
    }
    
    function _getSimpleSelectorClassValueForIndex(element) {
        var body
          , number
          , sign
          ;
        if(element._ast[1][0] !== 'funktion'
                    || element._ast[1][2][0] !== 'functionBody')
            return;
        body = element._ast[1][2].slice(1)
                   .filter(function(item) {
                        return !(item[0] in {'s':null,'comment':null});
                    })
        
        sign = '+';
        if(body.length === 2 && body[0][0] === 'unary') {
            //  as the docs say: unary is either - or +
            sign = body[0][1];
            body.shift();
        }
        if(body.length === 1 && body[0][0] === 'number')
            number = parseInt(sign + body[0][1], 10);
            // if the result is NaN return undefined
            return (number === number) ? number : undefined;
    }
    
    function simpleSelectorFactory(element) {
        var name = _getSimpleSelectorName(element)
          , type = _getSimpleSelectorType(element.type, name)
          , value
          ;
        
        if(type === 'pseudo-class' && name === 'i')
            value = _getSimpleSelectorClassValueForIndex(element);
        return new SimpleSelector(type, name, value);
    }
    
    return selectorFactories;
})
