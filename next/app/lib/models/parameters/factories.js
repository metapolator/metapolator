define([
    'gonzales/gonzales'
  , './Source'
  , './ParameterCollection'
  , './Comment'
  , './GenericCPSNode'
  
], function (
    gonzales
  , Source
  , ParameterCollection
  , Comment
  , GenericCPSNode
) {
    "use strict";
    
    // FIXME: handle errors!
    // especially erros thrown by gonzales, due to bad CSS input need
    // some attention
    
    function CPSError(message, stack) {
        this.name = 'CPSError'
        this.message = message
        if(stack instanceof Error)
            this.stack = error.stack
        else if(stack)
            this.stack = stack
    }
    
    
    function Rule(){}
    function SelectorList(source, lineNo){}
    SelectorList.prototype.push = function(){};
        // add a push/list interface
    
    function Selector(elements, source, lineNo){}
    function ParameterDict(source, lineNo){}
    ParameterDict.prototype.push = function(){};
        // add a push/list interface
        // make this an ordered dict. Ordered to keep the comments where
        // they belong. Dict for access to the Parameters themselves!
        // There is the possibility to declare two parameters of the same
        // name. We merge multiply defined Parameter like so:
        // the last one wins, the other previous ones are getting dumped.
        // If this is not fancy enough we can still think of another approach.
    
    
    function Parameter(name, value, source, lineNo){}
    function ParameterName(name, comments ,source, lineNo){}
    function ParameterValue(value, comments ,source, lineNo){}
    
    
    // FIXME: we should only keep "meaningful" data.
    // A ["s", " "]  ("s" is whitespace) could be left out, because we
    // don't want to recreate the formatting, the meaning is enough.
    // unfortunately, depending on the context, a ["s", " "]
    // could have meaning i.e. in a "simpleselector" or "value".
    // When the direct parent is a 'stylesheet', We can savely
    // skip all string nodes ['s', 'anything'], especially
    // because we are already keeping comments.
    // one question is where we skip this stuff, maybe in the
    // constructor of the parent
    
    
    /**
     * Constructors OR factory functions
     * this can be both because JavaScript allows to call a factory function
     * using the new operator like in `new myfactory()`. The factory must
     * return a new object in this case.
     * 
     * all constructors take the following arguments: (node, source)
     * @node: object as created by _makeNode and augmented by rulesFromAST
     * @source: instance of parameters/Source
     * 
     * We'll use mostly factories, because the "node" we use as argument
     * is not exactly a nice interface. However, its called _nodeConstructors
     * because that implies that these functions are beeing called using
     * the `new` keyword.
     * 
     * see: https://github.com/css/gonzales/blob/master/doc/AST.CSSP.en.md
     */
    var _nodeConstructors = {
        /**
         * stylesheet:
         * 
         * A list of rulesets, comments and __GenericAST__
         * We will delete __GenericAST__ of type 's'
         * 
         * From the docs:
         * Consists of ruleset (a set of rules with selectors),
         * atrules (single-line at-rule),
         * atruleb (block at-rule)
         * and atruler (at-rule with ruleset).
         * 
         * Also there are s (whitespace) and comment (comments).
         */
        'stylesheet': ParameterCollection
        
        /**
         * ruleset:
         * 
         * Has a "selector" as first child and a "block" as second child.
         * 
         * From the docs:
         * Consists of selector (selector) and block (a set of rules).
         */
      , 'ruleset': function(){}
      
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
              , selectorList = new SelectorList(source, node.lineNo)
              ;
            items = node.children
                .filter(function(item){return item.type === 'simpleselector'})
                .map(function(item){return item.instance;})
            selectorList.push.apply(selectorList, items)
            return selectorList;
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
            
            return new Selector(elements, source, node.lineNo);
        }
        
        /**
         * block:
         * 
         * A list of
         * "declaration"
         * "decldelim" (semicolon)
         * "s" (whitespace)
         * and "comment".
         * 
         * IMPORTANT: "filter" can occur, which is a like "declaration"
         * but has a special name. This was a rather random pick, I suppose.
         * We can use "filter" AS "declaration", if we need it, OR just let
         * it be a __GenericAST__. Filter has, instead of a "value" a "filterv"
         * This is a bugging inconsequence in gonzales. But we can shield
         * it from higher levels.
         * 
         * We rename "declaration" as "Parameter"
         * 
         * We throw a way "decldelim" and "s", we keep "declaration", 
         * "comment" and __GenericAST__ (which will be produced by from
         * unkown "declaration"s/properties)
         * 
         * From the docs: Part of the style in the braces.
         */
      , 'block': function(node, source) {
            var i=0
              , block = new ParameterDict(source, node.lineNo)
              ;
            
            for(;i<node.children.length; i++)
                if(node.children[i].type in {'comment': null,
                                             'declaration': null,
                                             '__GenericAST__':true
                                        })
                    block.push(node.children[i].instance);
            return block;
        }
      
        /**
         * declaration // Parameter:
         * 
         * Key value pair of "property" and "value"
         * We rename "declaration" to "Parameter" and "property" to "ParameterName"
         * 
         * We convert unkown "declaration"s into __GenericAST__
         * objects. But for performance reasons, this decision is made in
         * _makeNode.
         */
      , 'declaration': function (node, source) {
            if(node.children[0].type !== 'property')
                throw new CPSError('The first child of "declaration" is '
                + 'expected to be a "property", but got "' + node.children[0].type +'" '
                +'" in a declaration from: ' + source + 'line: '
                + node.lineNo
                +'.', new Error)
            
            if(node.children[1].type !== 'value')
                throw new CPSError('The second child of "declaration" is '
                + 'expected to be a "value", but got "' + node.children[1].type +'" '
                +'" in a declaration from: ' + source + 'line: '
                + node.lineNo
                +'.', new Error)
            
            var name = node.children[0].instance
              , value = node.children[1].instance;
            return new Parameter(name, value, source, node.lineNo);
        }
        
        /**
         * property // ParameterName
         * 
         * The name of a property.
         * 
         * It has as first child an ident, which value is the actual name:
         *          ["ident", "margin"]
         * But it also can have subsequent "s" (whitespace) and "comment"
         * nodes:
         */
         // any{ background-color /*property comment*/: #fff;\n\ }
        /**
         * yields in:
         * ['property', 
         *    ['ident', 'background-color'], 
         *    ['s', ' '], 
         *    ['comment', 'property comment']
         * ]
         * 
         * The whitespace is going to be removed.
         * 
         * I would try to keep the comments here, however, this is a low
         * priority, because comments are not often used at this position.
         * 
         * When printing, all comments go between the name and the colon.
         */
      , 'property': function (node, source) {
            var comments = node.children
                .filter(function(item) {
                    return (item.type === 'comment');
                }).
                map(function(item){
                    return item.instance;
                });
            
            if(node.children[0].type !== '__GenericAST__'
                    && node.children[0].instance.type !== 'ident')
                throw new CPSError(['The first child of "property" is '
                    , 'expected to be an __GenericAST__ of type "ident", '
                    , 'but got "', node.children[0].type, '" '
                    , 'type: "', (node.children[0].instance
                          ? node.children[0].instance.type
                          : '<no instance>'), '" '
                    ,'in a property from: ', source, 'line: '
                    , node.lineNo
                    ,'.'].join(''), new Error)
                
            var name = node.children[0].data;
            return new ParameterName(name, comments ,source, node.lineNo)
        }
      
        /**
         * value:
         * 
         * The value of a property.
         * 
         * It's a list of a lot of different nodes. Besides all things
         * meaningful for the value, Comments can go in here, too.
         * I propose to keep the comments, but print them at the beginning
         * of the value, followed by the value itself. Because we won't be
         * able to restore the correct place in most cases anyways.
         */
      , 'value': function(node, source) {
            var comments = []
              , value = []
              , i=0
              ;
            for(;i<node.children.length;i++)
                if(node.children[i].type === 'comment')
                    comments.push(node.children[i].instance);
                else
                    value.push(node.children[i].instance);
            return new ParameterValue(value, comments ,source, node.lineNo)
        }
      
        /** 
         * comment:
         * 
         * A comment. We keep comments in the most cases around.
         * 
         * Nodes aware of comments are:
         * 
         * stylesheet
         * simpleselector
         * block
         * property
         * value
         */
      , 'comment': function (node, source) {
            return new Comment(node.data, source, node.lineNo);
        }
      
      /**
       * Everything we refuse to understand at this point or later.
       * 
       * We use this constructy to keep alien data around and to be able
       * to reproduce it upon serialization.
       */
      , '__GenericAST__': function (node, source) {
            return new GenericCPSNode(node.rawData, source, node.lineNo);
        }
    }
    
    var _pattern_linebreak = /\n/g;
    function _countLinebreaks(data) {
        switch (data) {
            // cheaper shortcuts
            case ' ':
                return 0;
            case '\n':
            case ' \n':
            case '\n ':
            case ' \n ':
                return 1;
            default:
                // this is the most expensive one
                return (data.match(_pattern_linebreak) || [] ).length
        }
    }
    
    /**
     * Create a node as used internally in rulesFromAST.
     * 
     * This is no no beauty, but it makes rulesFromAST easier to red.
     */
    function _makeNode(parent, lineNo, data) {
        var ASTType = data[0];
        if(!parent)
            // this creates a root node
            parent = {
                depth: -1 //  +1 will be 0
              , makeInstance: true
              , type: '__init__' // can be anything but '__GenericAST__'
            };
        
        // TODO: Test if a property is known to us! if not make it
        // an __GenericAST__
        // That way we won't instantiate this, the ParameterName and the
        // ParameterValue Nodes, before throwing em away again.
        // if(type === 'declaration' && declaration->property is unkown)
        //     node.type = '__GenericAST__'
            
        var node = {
            type: (ASTType in _nodeConstructors)
                // create a known entity
                ? ASTType
                // just save the raw AST data
                : '__GenericAST__'
          , depth: parent.depth + 1
          , lineNo: lineNo
          , rawData: data
          , makeInstance: (
              // if the parent will not be instanciated there's no
              // need to instanciate this node, it won't persist
              // anywhere
              parent.makeInstance
              // AND if the parent is a __GenericAST__ type, it won't
              // save any children, so we don't need to make an instance
              // of this node. This--above all--is because we save
              //  __GenericAST__s children at the 'data' key.
              && parent.type !== '__GenericAST__'
            )
        };
        return node;
    }
    
    
    
    /**
     * Create a parameter node (ParameterCollection) from an Abstract
     * Syntax Tree(AST) like the one that is returned by gonzales.srcToCSSP
     * see: https://github.com/css/gonzales/blob/master/doc/AST.CSSP.en.md
     * 
     * In the ParameterList Tree, there will be some arrays of the AST
     * referenced. SO if you are going to change the AST, you might change
     * ParameterList items, too. Create a deep copy of the AST, if you
     * don't wan't this side effect.
     */
    function rulesFromAST(ast, sourceName) {
        if(sourceName === undefined)
            sourceName = '(unkown source)';
        var source = new Source(sourceName)
          , stack = []
          , lineNo = 1
          , frame
          , ASTType
          , node, data, childNode
          , root
          ;
        
        // initial frame
        root = _makeNode(false, lineNo, ast)
        // use slice to make a copy of the ast array
        stack.push([ast.slice(), root])
        
        // we wan't to walk the complete tree, because we want to detect all
        // ["s", " \n "] etc. so we can count line breaks. I hope the gonzales
        // parser doesn't hide line breaks from us.
        // Line numbers are VERY helpful when working with a CSS file
        // thats why I want to keep them
        while(frame = stack.pop()) {
            ASTType = frame[0][0]
            //remove the 2nd item from frame[0] and return it encapsulated
            // into an array
            data = frame[0].splice(1, 1)
            node = frame[1]
            
            // only ASTType is left; frame[0].splice(1, 1) returned and empty array
            if(!data.length) {
                // ASCENDING
                // All children are already initialized.
                if(node.makeInstance)
                    node.instance = new _nodeConstructors[node.type](node, source);
                continue;
            }
            // there may still be data left, we have to revisit this frame
            stack.push(frame)
            data = data[0];
            if(!(data instanceof Array)) {
                // DEEPEST POINT, this node has no children
                // assert(!('children' in node), 'A data node must not have a children key')
                // save the data
                node.data = data;
                
                if (ASTType in {'comment':null, 's':null})
                    // count linebreaks
                    lineNo += _countLinebreaks(data);
                continue;
            }
            // data is an array
            // DESCENDING
            childNode = _makeNode(node, lineNo, data)
            // each frame needs to be visited, because we wan't to count lines.
            // use slice to make a copy of the data array
            stack.push([data.slice(), childNode])
            if(!childNode.makeInstance)
                continue;
            // keep the childNode
            if(!node.children)
                // assert(!('data' in node), 'A structural node must not have a data key')
                node.children = [];
            node.children.push(childNode);
        }
        return root
        return root.instance;
    }
    
    /**
     * Create a ParameterList from a CSS-string
     */
    function rulesFromString(css, sourceName) {
        var ast = gonzales.srcToCSSP(css);
        return rulesFromAST(ast, sourceName)
    }
    
    
    return {
        rulesFromString: rulesFromString
      , rulesFromAST: rulesFromAST
      , CPSError: CPSError
    }
})
