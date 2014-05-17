define([
    'gonzales/gonzales'
  , './PropertyCollection'
], function(
    gonzales
  , PropertyCollection
) {
    "use strict";
    
    /**
     * Create a ParameterList from a CSS-string
     */
    function rulesFromString(css, sourceName) {
        // FIXME: handle errors?
        var ast = gonzales.srcToCSSP(css);
        return listFromAST(ast, sourceName)
    }
    
    /**
     * Create a ParameterList from an Abstract Syntax Tree(AST)
     * like the one that is returned by gonzales.srcToCSSP
     * 
     * In the ParameterList Tree, there will be some arrays of the 
     * referenced. SO if you are going to change the ast, you might change
     * ParameterList items, too. Create a deep copy of the ast, if you
     * don't wan't this side effect.
     */
    
    var _pattern_linebreak = /\n/g;
    function rulesFromAST(ast, sourceName) {
        if(sourceName === undefined)
            sourceName = '(unkown source)';
        var stack = []
          , lineNo = 1
          , depth
          , frame
          , type
          , node, unvisited, data, childFrame, childType, childNode
          , root
          , createNode = {
                'ruleset': null
              , 'comment': null
              , 'selector': null
              , 'block': null
              , 'declaration': null
              , 'property': null
              , 'value': null
            }
          ;
        
        type = ast[0];
        root = {
            type: type
          , depth: 0
          , lineNo: 0
        }
        stack.push([type, root, ast.slice(1)])
        
        // we wan't to walk the complete tree, because we want to detect all
        // ["s", " \n "] so we can count line breaks. I hope the gonzales
        // parse doesn't hide line breaks from us.
        // Line numbers are VERY helpful when working with a CSS file
        // thats why I want to keep them
        while(frame = stack.pop()) {
            type = frame[0]
            node = frame[1]
            unvisited = frame[2]
            
            if(node)
                depth = node.depth;
            
            data = unvisited.shift()
            if(unvisited.length)
                stack.push(frame)
            
            if(!(data instanceof Array)) {
                // assert(typeof data === 'string')
                if(node)
                    // save the data
                    node.data = data;
                // count linebreaks
                if (type in {'comment':null, 's':null})
                    // count linebreaks
                    switch(data) {
                        // cheaper shortcuts
                        case ' ':
                            break;
                        case '\n':
                        case ' \n':
                        case ' \n ':
                        case '\n ':
                            lineNo++;
                            break;
                        default:
                            // this is the most expensive one
                            lineNo += (data.match(_pattern_linebreak) || [] ).length
                    }
                
                continue;
            }
            // data is an array
            console.log('data:', JSON.stringify(data), 'parent:', node ? node.type : '(no direct parent)');
            
            childType = data[0];
            childNode = undefined;
            if(childType in createNode) {
                childNode = {
                    type: childType
                  , depth: depth+1
                  , lineNo: lineNo
                }
            }
            // every frame needs to be visited, because we wan't to count lines
            stack.push([childType, childNode, data.slice(1)])
            
            if(!node)
                continue;
            // there is a node, so we save data
            if(!childNode) {
                // just save the raw AST data
                // FIXME: this should only keep "meaningful" data.
                // A ["s", " "] could be skipped, because we don't want
                // to recreate the formatting, the meaning is enough.
                // unfortunately, depending on the context, a ["s", " "]
                // could have meaning, at least, I can't rule out that
                // right now.
                // When the direct parent is a 'stylesheet', We can savely
                // skip all string nodes ['s', 'anything'], especially
                // because we are already keeping comments.
                
                childNode = {
                    type: 'AST'
                  , data: data
                  , lineNo: lineNo
                  // nice! we can easily recreate the css string of these
                  // rules:
                  // , string: gonzales.csspToSrc(data)
                }
            }
            // keep the childNode
            if(!node.children)
                node.children = [];
            node.children.push(childNode);
        }
        
        return root;
    }
    
    
    return {
        rulesFromString: rulesFromString
      , rulesFromAST: rulesFromAST
    }
})
