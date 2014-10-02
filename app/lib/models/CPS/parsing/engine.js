define([
    'metapolator/errors'
  , './Source'
  , 'metapolator/models/CPS/elements/ParameterCollection'
  
], function (
    errors
  , Source
  , ParameterCollection
) {
    "use strict";
    var CPSError = errors.CPS;
    // FIXME: handle errors!
    // especially erros thrown by gonzales, due to bad CSS input need
    // some attention
    
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
     * Create a node as used in engine.
     */
    function _makeNode(nodeConstructors, parent, lineNo, data) {
        var ASTType = data[0];
        if(!parent)
            // this creates a root node
            parent = {
                depth: -1 //  +1 will be 0
              , makeInstance: true
              , type: '__init__' // can be anything but '__GenericAST__'
            };
        var node = {
            type: (ASTType in nodeConstructors)
                // create a known entity
                ? ASTType
                // just save the raw AST data
                : '__GenericAST__'
          , depth: parent.depth + 1
          , lineNo: lineNo
          , rawData: data
          , makeInstance: (
              // if the parent will not be instantiated there's no
              // need to instantiate this node, it won't persist
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
     * ParameterList items, too. Create a deep copy of the AST if you
     * don't want this side effect.
     */
    function parserEngine(defaultNodeConstructors, factorySwitches, ast
                                    , sourceName, parameterRegistry) {
        if(sourceName === undefined)
            sourceName = '(unkown source)';
        var source = new Source(sourceName)
          , stack = []
          , lineNo = 1
          , frame
          , ASTType
          , node, data, childNode
          , root
          // I added a way to change the node constructors object
          // depending on the context, currently only used for @dictionary
          , nodeConstructors = defaultNodeConstructors
          , oldNodeConstructors
          , i
          ;
        
        // initial frame
        root = _makeNode(nodeConstructors, false, lineNo, ast);
        // use slice to make a copy of the ast array
        stack.push([ast.slice(), root]);
        
        // we want to walk the complete tree, because we want to detect all
        // ["s", " \n "] etc. so we can count line breaks. I hope the gonzales
        // parser doesn't hide line breaks from us.
        // Line numbers are VERY helpful when working with a CSS file
        // that's why I want to keep them
        while(frame = stack.pop()) {
            // if frame 2 is set this means that the element switched
            // nodeConstructors for its own object, and that the
            // old nodeConstructors object is in frame[2]
            
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
                    node.instance = nodeConstructors[node.type]
                        .call(nodeConstructors, node, source, parameterRegistry);
                                        
                //switch back nodeConstructors if this element switched it
                if(frame[2])
                    nodeConstructors = frame[2];
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
            
            // switch nodeConstructors if it's the right element
            // currently only used for @dictionary, but this mechanism
            // is very generic
            oldNodeConstructors = undefined;
            for(i=0; i<factorySwitches.length;i++) {
                if(factorySwitches[i][0](data)){
                    oldNodeConstructors = nodeConstructors;
                    // keep this until childNode is finalized, then switch back
                    nodeConstructors = factorySwitches[i][1];
                    break;
                }
            }
            
            childNode = _makeNode(nodeConstructors, node, lineNo, data)
            // Each frame needs to be visited, because we want to count
            // lines.
            // Use slice to make a copy of the data array
            stack.push([data.slice(), childNode, oldNodeConstructors])
            if(!childNode.makeInstance)
                continue;
            // keep the childNode
            if(!node.children)
                // assert(!('data' in node), 'A structural node must not have a data key')
                node.children = [];
            node.children.push(childNode);
        }
        //return root
        if(!(root.instance instanceof ParameterCollection))
            throw new CPSError('Parser was expected to create an instance '
                                + 'of ParameterCollection but it delivered '
                                + 'a ' + root.instance.constructor.name)
        
        return root.instance;
    }
    return parserEngine;
})
