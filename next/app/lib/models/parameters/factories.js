define([
    'gonzales/gonzales'
  , './PropertyCollection'
], function(
    gonzales
  , PropertyCollection
) {
    "use strict";
    
    // FIXME: handle errors!
    
    /**
     * Constructors OR factory functions
     * this can be both because JavaScript allows to call a factory function
     * using the new operator like in `new myfactory()`. The factory must
     * return a new object in this case.
     * 
     * We'll use mostly factories, because the "node" we use as argument
     * is not exactly a nice interface. However, its called _nodeConstructors
     * because that implies that these functions are beeing called using
     * the `new` keyword.
     */
    var _nodeConstructors = {
        'ruleset': function(){}/*has a selector as first child and a block as seccond child, comments? */
      , 'comment': function(){}/* can be almost everywhere */
      , 'selector': function(){}/* is actually a list of selectors */
      , 'simpleselector': function(){}/* an item in a list of selectors */
      , 'block': function(){}/* a list of declarations and comments*/
      
      , 'declaration': function(){}/* key value pair of property and value, comments? */
      , 'property': function(){}/* the name of the property */
      , 'value': function(){}/* the value of the property */
      
      , 'stylesheet': PropertyCollection/*a list of rulesets, comments and __GenericAST__*/
      , '__GenericAST__': function(){}/* everything we refuse to understand at this point or later */
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
        var node = {
              depth: parent.depth + 1
            , lineNo: lineNo
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
        
        if(ASTType in _nodeConstructors)
            // create a known entity
            node.type = ASTType;
        else {
            // just save the raw AST data
            // FIXME: we should only keep "meaningful" data.
            // A ["s", " "] could be left out, because we don't want
            // to recreate the formatting, the meaning is enough.
            // unfortunately, depending on the context, a ["s", " "]
            // could have meaning i.e. in a simpleselector.
            // When the direct parent is a 'stylesheet', We can savely
            // skip all string nodes ['s', 'anything'], especially
            // because we are already keeping comments.
            // one question is where we skip this stuff, maybe in the
            // constructor of the parent
            node.type = '__GenericAST__';
            node.data = data;
            // nice! we can easily recreate the css string of these
            // rules:
            // string = gonzales.csspToSrc(data)
        }
        return node;
    }
    
    /**
     * Create a ParameterList from an Abstract Syntax Tree(AST)
     * like the one that is returned by gonzales.srcToCSSP
     * 
     * In the ParameterList Tree, there will be some arrays of the AST
     * referenced. SO if you are going to change the AST, you might change
     * ParameterList items, too. Create a deep copy of the AST, if you
     * don't wan't this side effect.
     */
    function rulesFromAST(ast, sourceName) {
        if(sourceName === undefined)
            sourceName = '(unkown source)';
        var stack = []
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
                    node.instance = new _nodeConstructors[node.type](node);
                continue;
            }
            // there may still be data left, we have to revisit this frame
            stack.push(frame)
            data = data[0];
            if(!(data instanceof Array)) {
                // DEEPEST POINT, this node has no children
                // genericAST received its data already upon creation
                if(!('data' in node))
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
    }
})
