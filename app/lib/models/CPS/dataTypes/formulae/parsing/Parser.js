define([
    'metapolator/errors'
  , './_ValueToken'
  , './OperatorToken'
  , './Stack'
  , './BracketToken'
  , './StringToken'
  , './SelectorToken'
  , './NumberToken'
  , './NameToken'
], function(
    errors
  , _ValueToken
  , OperatorToken
  , Stack
  , BracketToken
  , StringToken
  , SelectorToken
  , NumberToken
  , NameToken
) {
    "use strict";

    var CPSFormulaError = errors.CPSFormula
      , KeyError = errors.Key
      ;

    function Parser(/* operators */) {
        this._operators = this._createOperatorsDict(
                Array.prototype.slice.call(arguments));
        this._operatorsByPrecedence = this._createPrecedenceLookup(
                                                        this._operators);

        this._operatorsByLength = this._createLengthLookup(
                                                        this._operators);

        this._bracketOperators = {};
    }

    var _p = Parser.prototype
        /**
         * Test if a string starts like a number:
         * this omit the notation of a sign (especially -) because negation
         * will be handled by an operator
         * R_number.exec(string) !== null
         */
      , R_number = /^(((\d*\.\d+)|(\d+(\.)?))([eE][+\-]?\d+)?)/
        //  Test if a string starts like a name
      , R_name = /^[0-9A-Za-z_]+/
      ;

    _p._createOperatorsDict = function(operators) {
        var i = 0
          , result = {}
          ;
        for(;i<operators.length;i++) {
            if(operators[i].literal in result)
                throw new CPSFormulaError('An operator with the literal "'
                                + operators[i].literal +'" is defined at '
                                + 'least twice, but it must be unique!');
            if(R_number.exec(operators[i].literal) !== null)
                throw new CPSFormulaError('The operator with the literal "'
                                + operators[i].literal +'" starts like a '
                                + 'number literal. This is forbidden.');
            result[operators[i].literal] = operators[i];
        }
        return result;
    };

    /**
     * Creates an array like so:
     * [
     *      {'*': operatorInstance, '/': operatorInstance},
     *      {'+': operatorInstance, '-': operatorInstance},
     * ]
     *
     * The infixToPostfix method uses this to resolve the operators in
     * the right order. This means the first item in the result of this
     * method has the highest precedence, and all its operators are
     * resolved first.
     */
    _p._createPrecedenceLookup = function(operators) {
        var temp = {}
          , k
          , ordered = []
          ;
        for(k in operators) {
            if(temp[operators[k].precedence] === undefined) {
                temp[operators[k].precedence] = {};
                ordered.push(operators[k].precedence);
            }
            temp[operators[k].precedence][k] = operators[k];
        }
        ordered.sort(function(a, b) { return a-b; });
        // highest precedence first
        ordered.reverse();
        return ordered.map(function(precedence){ return temp[precedence]; });
    };

    /**
     * returns an object with the keys "splitting" and "notSplitting"
     * both keys contain an array of objects.
     * The objects are key value pairs of operatorLiteral: operator
     * The operators in one object have all the same length.
     * The arrays are sorted in the way that the objects with the longest
     * operatorLiterals appear first;
     *
     *  {
     *      splitting: [ operator literals by length lookup ]
     *      notSplitting: [ operator literals by length lookup ]
     *  }
     *
     * the array for the "operator literals by length lookup":
     * // ordered by operator.literal.length, longest first
     * [
     *      // all literalName in these objects have the same length
     *      {literalName_A: operator, literalName_B: operator}
     *    , {literalN_A: operator, literalN_B: operator}
     *      ...
     * ]
     */
    _p._createLengthLookup = function(operators) {
        var _get = function(k) {return this[k];}
          , k
          , _temp
          , temp = {
                splitting: {}
              , notSplitting: {}
            }
          , result = {}
        ;

        // put everything in the right temp container
        for(k in operators) {
            _temp = operators[k].splitting
                ? temp.splitting
                : temp.notSplitting
                ;
            if(_temp[k.length] === undefined)
                _temp[k.length] = {};
            _temp[k.length][k] = operators[k];
        }

        // sort and maintain order by returning arrays of operator dicts
        for(k in temp)
            result[k] = Object.keys(temp[k])
                              // sort by "k.length" keys
                              .sort()
                              // longest first
                              .reverse()
                              // return the operator dicts
                              .map(_get, temp[k]);
        return result;
    };


    _p.setBracketOperator = function(bracketLiteral, operatorLiteral) {
        if(!(operatorLiteral in this._operators))
            throw new KeyError('No operator found for literal: '
                                                        + operatorLiteral);

        this._bracketOperators[bracketLiteral] = operatorLiteral;
    };

    _p.getBracketOperator = function(bracketLiteral) {
        if(bracketLiteral in this._bracketOperators)
            return this._operators[this._bracketOperators[bracketLiteral]];

        throw new KeyError('No bracket operator found for literal: '
                                                        + bracketLiteral);
    };


    /**
     * Unwrap all elements of nested arrays into one flat array. Keep
     * the depth-first order intact.
     */
    function _flatten(tokens) {
        var result = []
          , item
          ;
        while(!!(item = tokens.shift())) {
            if(item instanceof Array)
                Array.prototype.unshift.apply(tokens, item);
            else
                result.push(item);
        }
        return result;
    }

    /**
     * test if string starts with the operator.literal of one of the
     * operators in the operators list.
     *
     * The operators list has the following structure (to avoid a linear search)
     *
     * // ordered by operator.literal.length
     * [
     *      // all literalName keys in here have the same length
     *      {literalName: operator}
     *      ...
     *  }
     * ]
     *
     *
     */
    function _testOperators(operators, string, index) {
        var i=0, k, search;
        for(;i<operators.length;i++) {
            // get the first key
            k = null;
            for(k in operators[i])
                break;
            if(k === null)
                continue;
            // cut out the right length from string
            search = string.substr(index, k.length);
            if(operators[i].hasOwnProperty(search))
                // search is a key in operators
                return operators[i][search];
        }
        return false;
    }

    /**
     * Test for all NOT splitting operators, longest first.
     */
    _p._testNotSplittingOperators = function(string, index) {
        return _testOperators(this._operatorsByLength.notSplitting
                                                        , string, index);
    };

    /**
     * Test for all splitting operators, longest first.
     */
    _p._testSplittingOperators = function(string, index) {
        return _testOperators(this._operatorsByLength.splitting
                                                        , string, index);
    };


    /**
     * tokenize into the following tokens:
     *
     * number literals: anything that ufojs/main.isFloatString accepts
     *      1 .3 1.2 1.2e3  3E3 0.123456E-3 etc..
     *      BUT: we don't need to include the - or + signs, because negation
     *      will be dealt with in the resulting program
     *
     * selector literals: anything between S" AND "  S"master#bold > glyph:i(3)"
     *      we keep the quotes, because some characters that can appear
     *      in selectors could cause problems with our CSS/CPS parser in
     *      the context of a parameter value
     * string literals: anything between " AND "
     * parenthesis: ( and )
     * Square brackets [ and ]  <= will essentially behave like a stack ()
     *              but the resulting value will be used as key to get a
     *              value from the previous value in the stack
     *              So, this resolves to a similar thing like the dot
     *              operator. but the dot operator will use the literal
     *              of a NameValue AND thus require a NameValue
     *              we may get rid of the dot operator but then find us
     *              typing a lot of [" AND "] combinations ...
     *
     * names/identifier: essentially every token that is not something else ...
     *            maybe it is wise to identify a set of legal characters,
     *            like 0-9A-Za-z_ this could save space for new additions
     *            also, this eases parsing
     *
     * operators/symbols: identifier that are keys in this._operators
     *
     * special is the "negate" operator, which will be inserted on some
     * occasions where - appears. But this is not done in this context
     * the parser will do so.
     *
     * splitting is done by:
     *  ' ' space
     *  $" " selector literal
     *  " " string literal
     *  \n newline
     *  \r carriage return
     *  \t tab
     *  all operators where operator.splits === true
     *          if it doesn't split it can be part of a 'name'
     *
     * special in terms of splitting is the . operator
     *      it splits, but only if it is not part of a number literal!
     *
     *
     * in the end, we expect a list of:
     *
     * - number values from number literals
     * - selector values from selector literals
     * - string values from string literals
     * - brackets: one of these four at a time ( ) [ ]
     * - operators
     * - names
     */
    _p.tokenize = function(string) {
        var i=0, j, tokenEnd
          , tokens = []
          , reResult
          , splitExpected
          , foundOperator
          ;
        while(i<string.length) {
            if(' \n\r\t'.indexOf(string[i]) !== -1) {
                // stuff that splits but is not reported (whitespace)
                i++;
                splitExpected = false; // a splitting token was found
                continue;
            }

            // brackets are splitting
            if('()[]'.indexOf(string[i]) !== -1) {
                tokens.push(new BracketToken(string[i]));
                i++;
                splitExpected = false; // a splitting token was found
                continue;
            }

            // string literals are splitting
            if(string[i] === '"') {
                tokenEnd = string.indexOf('"', i+1);
                if(tokenEnd === -1)
                    throw new CPSFormulaError('A closing double quote is '
                        +' missing for an opening string literal: "');
                tokens.push(new StringToken(string.substring(i+1, tokenEnd)));
                i = tokenEnd+1;
                splitExpected = false; // a splitting token was found
                continue;
            }

            // selector literals are splitting
            if(string[i] === 'S' && string[i+1] === '"') {
                tokenEnd = string.indexOf('"', i+2);
                if(tokenEnd === -1)
                    throw new CPSFormulaError('A closing double quote is '
                        +' missing for an opening selector literal S" ...in: '
                        + string.substr(i));
                tokens.push(new SelectorToken(string.substring(i+2, tokenEnd)));
                i = tokenEnd+1;
                splitExpected = false; // a splitting token was found
                continue;
            }

            // test for all splitting operators, length first
            if(!!(foundOperator = this._testSplittingOperators(string, i))) {
                tokens.push(foundOperator);
                i += foundOperator.literal.length;
                splitExpected = false; // a splitting token was found
                continue;
            }

            // END OF SPLITTING TOKENS

            // The last found token was expecting as next token a splitting
            // token, because it was not splitting by itself.
            // A splitting token was not found.
            if(splitExpected === true)
                throw new CPSFormulaError('A splitting token was expected '
                                + 'after: '+ tokens[tokens.length-1])+ ' '
                                + 'but it was not found in: '
                                + string.substr(i);

            // From here we expect to find a not splitting token
            // the token after that must be splitting
            // if we don't find anything a CPSFormulaError is thrown
            splitExpected = true;

            // test for all NOT splitting operators, length first
            if(!!(foundOperator = this._testNotSplittingOperators(string, i))) {
                tokens.push(foundOperator);
                i += foundOperator.literal.length;
                continue;
            }

            // prepare for RegEx.exec searches
            // the string must be truncated to the current index
            // because RegEx.exec has no offset parameter like indexOf
            string = string.substr(i);
            i=0;

            // number literals are not splitting
            // when we find a number literal that is not followed by a
            // split, it is still possible that it is a valid name like 1abc
            if((reResult = R_number.exec(string)) !== null) {
                tokens.push(new NumberToken(reResult[0]));
                i += reResult[0].length;
                continue;
            }

            // name literals are not splitting
            if((reResult = R_name.exec(string)) !== null) {
                tokens.push(new NameToken(reResult[0]));
                i += reResult[0].length;
                continue;
            }

            // not recognized as token!
            throw new CPSFormulaError('Can\'t find the next token in the '
                                    + 'string: ' + string);
        }
        return tokens;
    };

    _p._resolveBrackets = function(tokens) {
        var i = 0
          , openStack = []
          , start
          , result = []
          ;
        for(;i<tokens.length;i++) {
            if(!(tokens[i] instanceof BracketToken)) {
                if(openStack.length === 0)
                    // record this token, it is not inside of any brackets
                    result.push(tokens[i]);
            }
            // it is a bracket
            else if(tokens[i].opening) {
                if(openStack.length === 0)
                    start = i+1;
                openStack.push(tokens[i]);
            }
            else { // tokens[i].closing === true
                if(openStack.length === 0
                        || !openStack[openStack.length-1].matches(tokens[i].literal))
                    throw new CPSFormulaError('A closing bracket appeared '
                        + '"'+ tokens[i].literal +'" but a matching opening '
                        + ' bracket is missing before.');
                // the closing bracket matches
                else if(openStack.length === 1)
                    // this closes the current outermost bracket
                    try {
                        // If an operator is registered for this bracket,
                        // we insert it before the bracket.
                        // This is actually used if this is a [] context
                        // We insert a getter operator then, that will
                        // consume the content of the [] stack and uses
                        // its value as a key to read from in the previous
                        // value like: myValue["myKey"]
                        result.push(this.getBracketOperator(openStack[0].literal));
                    }
                    catch(error) {
                        if(!(error instanceof KeyError))
                            throw error;
                        // else: pass. No operator was registered for this
                        // kind of bracket.
                    }


                    // call this.infixToPostfix recursively...
                    // this.infixToPostfix calls this method
                    result.push(this.infixToPostfix(tokens.slice(start, i)));
                openStack.pop();
            }
        }
        if(openStack.length)
            throw new CPSFormulaError(openStack.length + ' '
                    + (openStack.length === 1 ? 'bracket is'
                                                : 'brackets are' ) + ' '
                    + 'missing for the opened: '
                    + openStack.map(function(item){ return item.literal; })
                               .join(', '));
        return result;
    };


    /**
     * Take the tokens where the calculations are in a infix notation and
     * return postfix or Reverse Polish notation:
     * This means we go from 2 + 3 to 2 3 +. The operator follows all
     * of its operand. This is easy to calculate at the end, and we get
     * rid of the Parenthesis.
     *
     * This works as far as my tests went, but it could be more efficient
     * when implemented using the "Dijkstra shunting yard algorithm" to
     * create this conversion.
     *
     * The algorithm uses one recursive call to eliminate parentheses
     * and multiple passes to solve all operators in order of precedence.
     */
    _p.infixToPostfix = function infixToPostfix(tokensArg) {
        var operators = this._operatorsByPrecedence
          , tokens
          , j=0
          , i
          , k
          , startPre
          , startPost
          , preConsumes
          , postConsumes
          , endPost
          , operation
          ;
        // find brackets and call this method recursively
        tokens = this._resolveBrackets(tokensArg);

        // convert all operators to postfix notation
        // operator precedence defines the order of the conversion

        for(;j<operators.length;j++) {
            for(i=0;i<tokens.length;i++) {
                // Array and Value don't change the stack, only OperatorToken
                // does. Thus Array and Value stay where they are until
                // they are consumed by an Operator.
                if(!(tokens[i] instanceof OperatorToken))
                    continue;
                // tokens[i] is an Operator

                // only apply operators with the correct precedence
                if(!(tokens[i].literal in operators[j]))
                    continue;

                // If preConsumes is Infinity, the operator consumes
                // anything that is on the stack before its position.
                // This is useful for some kind of list creation.
                preConsumes = tokens[i].preConsumes === Infinity
                    ? i
                    : tokens[i].preConsumes
                    ;

                startPre = i - preConsumes;
                if(startPre < 0)
                    throw new CPSFormulaError('Stack underflow at a "'+tokens[i]+'" '
                                    + 'operator, which pre-consumes more items '
                                    + 'than there are on the stack');

                // skip the operator itself
                startPost = i+1;

                // If postConsumes is Infinity, the operator consumes
                // anything that is on the stack after its position.
                // This is useful for some kind of list creation.
                postConsumes = tokens[i].postConsumes === Infinity
                    ? tokens.length - startPost
                    : tokens[i].postConsumes
                    ;

                endPost = startPost + postConsumes;
                if(endPost > tokens.length)
                    throw new CPSFormulaError('Stack underflow at a "'+tokens[i]+'" '
                                    + 'operator, which post-consumes more items '
                                    + 'than there are on the stack');

                operation = tokens.slice(startPre, i)
                                  .concat(tokens.slice(startPost, endPost));

                // check if everything looks alright
                for(k=0; k<operation.length; k++)
                    if(!(operation[k] instanceof _ValueToken)
                                    && !(operation[k] instanceof Array))
                        throw new CPSFormulaError('Malformed stack at a "'
                            + tokens[i].literal+'" operator, which consumes '
                            + (operation[k] instanceof OperatorToken
                                ? 'another operator: "' + operation[k].literal + '"'
                                : 'something that is not a ValueToken: "'
                                    + operation[k] + '" typeof: '
                                    + typeof operation[k]
                                    + ' '+operation[k].constructor.name));
                // add the operator
                if(tokens[i].preConsumes === Infinity
                                || tokens[i].postConsumes === Infinity)
                    operation.push(
                        tokens[i].fixedConsumptionFactory(
                                            preConsumes, postConsumes));
                else
                    operation.push(tokens[i]);

                // change in place, the operation becomes one array
                // and will be handled as a single value in later
                // repetitions.
                tokens.splice(startPre, operation.length, operation);
                i = startPre;
            }
        }
        return _flatten(tokens);
    };

    _p.parse = function(string) {
        var tokens = this.tokenize(string);
        tokens = this.infixToPostfix(tokens);
        return new Stack(tokens);
    };

    return Parser;
});
