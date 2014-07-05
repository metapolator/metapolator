define([
    'metapolator/errors'
  , 'metapolator/models/CPS/parsing/parseSelectorList'
  , './AtDictionaryReference'

], function(
    errors
  , parseSelectorList
  , AtDictionaryReference
) {
    "use strict";
    var CPSError = errors.CPS;
    
    // matches a string in single quotes or double qoutes
    // at the beginning of the search string that ends with optional
    // whitespace and then a colon
    var r_quoted_colon = /^(\'[^\']*\'|\"[^\"]*\")\s*:/
      , r_quoted = /^(\'[^\']*\'|\"[^\"]*\")$/
    
    function tokenize(input) {
        var match
          , tokens = []
          , token
          , invalidMessage
          , searchBase = input
          ;
        while(searchBase.length) {
            // quoted string, may have whitespace after the quotes
            // ends with a colon
            if((match = r_quoted_colon.exec(searchBase)) !== null) {
                token = match[1]// match[1] excludes the colon
                    .trim()//remove the whitespace betweeen quotes and colon
                    .slice(1,-1)// remove the quotes
                    .trim();
                searchBase = searchBase.slice(match[0].length);
            }
            else if((match = searchBase.indexOf(':')) !== -1) {
                token = searchBase.slice(0, match).trim();
                searchBase = searchBase.slice(match+1);
            } else {
                token = searchBase.trim();
                if(token.search(r_quoted) !== -1)
                    token = token.slice(1,-1);
                searchBase = '';
            }
            searchBase.trim();
            if(token  === '' && searchbase.length)
                throw new CPSError('Found an empty token in: '+parameterValue.valueString);
            tokens.push(token);
        }
        if(!tokens.length)
            throw new CPSError('Found no tokens in: '+parameterValue.valueString);
        return tokens;
    }
    
    return {
        init: function(parameterValue, setFactoryAPI, setInvalidAPI) {
            // parse here ... parameterValue
            var invalidMessage
              , selector
              , tokens
              , referencedParameterName
              , properties
              ;
            try {
                tokens = tokenize(parameterValue.valueString.trim());
            }
            catch(error) {
                if(!(error instanceof CPSError))
                    throw error;
                invalidMessage = 'Can\'t get a selector from "'
                            + parameterValue.valueString + '" with error: '
                            + error;
            }
            if(!invalidMessage && tokens.length < 1)
                invalidMessage('Selector found but the parameter name is '
                            + 'missing in ' + parameterValue.valueString)
            referencedParameterName = tokens[1];
            if(!invalidMessage) {
                properties = tokens.slice(2);
                try {
                    selector = parseSelectorList.fromString(tokens[0]);
                }
                catch(error) {
                    if(!(error instanceof CPSError))
                        throw error;
                    invalidMessage = 'Can\'t get a selector from "' + tokens[0]
                                   + '" with error: ' + error;
                }
            }
            
            // do this if the parameter is bad:
            if(invalidMessage) {
                setInvalidAPI(invalidMessage);
                return;
            }
            //else
            var value = parameterValue.valueString.trim();
            setFactoryAPI(function(name, element) {
                return new AtDictionaryReference(selector,
                                    referencedParameterName, properties);
            });
        }
        , defaultFactory: function(name, element) {
            throw new errros.NotImplemented('There is no default value '
                                    +'for a @dictionary reference!');
        }
        , is: function(value) {
            return value instanceof AtDictionaryReference;
        }
    }
});
