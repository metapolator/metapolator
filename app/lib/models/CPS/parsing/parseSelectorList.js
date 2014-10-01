define([
    'metapolator/errors'
  , 'gonzales/gonzales'
  , './engine'
  , './selectorFactories'
  , 'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/elements/Comment'
  
], function (
    errors
  , gonzales
  , parserEngine
  , selectorFactories
  , Rule
  , Comment
) {
    "use strict";
    var CPSError = errors.CPS
      , CPSParserError = errors.CPSParser;;
    
    function selectorListFromString(string, sourceName) {
        try {
            var ast = gonzales.srcToCSSP(string + '{}');
        } catch(error) {
            throw new CPSParserError('Error parsing "' + string + '" as a selector. '
                + 'Message: ' + error.message);
        }
        return selectorListFromAST(ast, sourceName)
    }
    
    function selectorListFromAST(ast, sourceName) {
        var rules
          , selectorList
          , i=0
          ;
        rules = parserEngine(selectorFactories, [], ast
                                    , sourceName || 'selector parser');
        rules = rules.items;
        // search the first instance of SelectorList
        // and verify that nothing else was submited.
        for(;i<rules.length;i++) {
            if(rules[i] instanceof Comment)
                // accept comments
                continue;
            else if(!(rules[i] instanceof Rule))
                throw new CPSParserError('The argument string describred a '
                        + rules[i].constructor.name + ' but it should be a'
                        + 'SelectorList.');
            else if(selectorList !== undefined)
                throw new CPSParserError('The argument string described more than '
                    + 'a selectorlist is contained: ' + rules[i]);
            else if(rules[i].paramters)
                throw new CPSParserError('Found parameters where there should '
                            + 'be only a SelectorList: ' + rules[i].paramters);
            selectorList = rules[i].selectorList;
            // don't break! we want to validate the rules, if there is
            // awkward stuff in it it's better to complain, because it
            // might be a programming error.
        }
        if(!selectorList)
            throw new CPSParserError('No selector found.')
        if(!selectorList.selects)
            throw new CPSParserError('SelectorList will not select anything: '
                    + selectorList.message)
        return selectorList;
    }
    
    return {
        fromString: selectorListFromString
      , fromAST: selectorListFromAST
    }
})
