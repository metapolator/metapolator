define([
     'metapolator/errors'
   , './_Token'
   , './NumberToken'
   , './StringToken'
   , './SelectorToken'
   , './NameToken'
   , 'ufojs/main'
], function(
    errors
  , Parent
  , NumberToken
  , StringToken
  , SelectorToken
  , NameToken
  , ufojs
) {
    "use strict";

    var CPSFormulaError = errors.CPSFormula
      , ValueError = errors.Value
      , isInstance = ufojs.isInstance
      ;

    /**
     * literal:     string, the name of the operator, like: + - Vector etc.
     *              there are some operator literals that are expected by
     *              Parser.tokenize
     *
     * splitting:   defines an operator as splitting, which instructs the
     *              tokenizer to end parsing of the token when it appears.
     *              if an operator is not splitting, it must be followed by
     *              a splitting token. None splitting tokens can be part of
     *              Names
     *
     * precedence: the precedence is used to implement the order of operations.
     *             precedence can be a finite Number and -Infinity for lowest
     *             precedence +Infinity for highest precedence
     *
     * preConsumes,
     * preConsumes: How many tokens this operator consumes
     *              before or after its appearance. This allows the creation
     *              of infix operators.
     *              Infinity is allowed as a value, this makes the creation
     *              of i.e. list constructing operators possible. A Infinity
     *              value will consumes the amount of Items that are corruently
     *              in the stack.
     *
     * methods:     See this._setMethods for a description of the methods argument.
     */
    function OperatorToken(literal, splitting, precedence, preConsumes
                                                , postConsumes, methods) {
        Parent.call(this, literal, preConsumes, postConsumes);
        this._splitting = !!splitting;
        if(typeof precedence !== 'number')
            throw new CPSFormulaError('Precedence must be a number, but is "'
                                + precedence +'" typeof: '+ typeof precedence);
        this._precedence = precedence;
        this._methods = [];
        this._setMethods(methods);
    }

    var _p = OperatorToken.prototype = Object.create(Parent.prototype);
    _p.constructor = OperatorToken;


    Object.defineProperty(_p, 'precedence', {
        get: function(){ return this._precedence; }
    });

    Object.defineProperty(_p, 'splitting', {
        get: function(){ return this._splitting; }
    });

    /**
     * Methods could be just a function, in which case it would be the
     * single match all implementation for this operator, NameTokens as
     * arguments will be resolved upon invocation.
     *
     * Also,
     *
     * Also, it may be an array of arrays like this:
     *   [
     *        [typename/constructor, [ typename/constructor ...] , method]
     *      , [typename/constructor, [ typename/constructor ...] , method]
     *      , function(){} // optional, match all
     *   ]
     *
     * The first method that matches the actual types of arguments will
     * be used, so an early match all function will overshadow later ones.
     *
     * typename/constructor can be everything that is useful with ufoJS/main.isInstance
     *
     * Also, typename/constructor can have special values:
     *
     * - The string: "*getAPI*", only as very first element:
     *        this does two things:
     *            * it injects the getAPI function as first argument of method
     *            * it doesn't resolve NameToken arguments using getAPI(nameToken.getValue())
     *              so, specifiying *getAPI* means method will handle
     *              NameTokens by itself.
     *        In turn, this means NameToken can be used as a typename/constructor
     *        but it will only ever appear as argument when *getAPI* is requested,
     *        otherwise it will be reslved before invokation.
     * - The string "*anything*" which matches anything
     *
     * ufoJS/main.isInstance takes:
     *  - functions which would be checked using "instanceof" or a string
     *  - strings can be: int float NaN null Infinity -Infinity
     *  - strings can be also everything where typeof actually works, like:
     *                  number, string, undefined, object
     *  - arrays of the above
     */
    _p._setMethods = function(methods) {
        if(typeof methods === 'function')
            this._setMethod(methods);
        else if(methods instanceof Array)
            methods.map(this._setMethod, this);
    };
    /**
     * see _setMethods for an argument description
     */
    _p._setMethod = function(description) {
        var expectedLength;
        if(typeof description === 'function') {
            this._methods.push(description);
            return;
        }
        else if(!(description instanceof Array))
            throw new ValueError('An operator definition should be either '
                + 'a function or an array, see OperatorToken');

        // It is an array

        expectedLength = this.consumes + (
                                description[0] !== '*getAPI*' ? 1 : 2);

        if(description.length !== expectedLength)
            throw new ValueError(this.literal + ': An operator definition array must define '
                + 'the types for all items it consumes plus the method to '
                + 'that is the operator code in the end.'
                + 'This operator should have ' + expectedLength +' '
                + 'items in a definition, but ' + description.length
                + ' was found: ' + description
            );
        else if(typeof description[description.length-1] !== 'function')
            throw new ValueError('The last item of an operator definition '
                + 'must be a type of "function" but this is a "'
                + (typeof description[description.length-1])+'"');
        // accept it
        // description is an array that suits our expectations
        this._methods.push(description);
    };

    /**
     * Return the index in this._methods of the first matching operator
     * implementation for the given arguments or -1.
     */
    _p._findMethod = function(getAPI, argsObj) {
        var index=0, j, k, type, value, args;


        for(;index<this._methods.length; index++) {
            // the routine can request as first argument getAPI
            // this however changes how NameToken is procesed
            // without *getAPI* the lookup is made for the operator
            // with *getAPI* the operator itself is in charge to
            // look up the names. The latter can happen anywhere, not
            // just with the getAPI.

            // convert from TokenType (container) to the JavaScript Value
            // equivalents, before running the following methods
            if(this._methods[index][0] !== '*getAPI*'){
                j = 0;
                args = argsObj.convertedNameTokens;
            }
            else {
                j = 1;
                args = argsObj.keptNameTokens;
            }

            k = 0;

            if(typeof this._methods[index] === 'function')
                // match all
                return index;

            for(;k<args.length;j++, k++) {
                type = this._methods[index][j];
                if(type !== "*anything*" && !isInstance(args[k], type))
                    break;
            }
            if(k === args.length)
                // no element broke the loop, thus all where matches;
                return index;
        }
        return -1;
    };

    _p.execute = function(getAPI /*, arguments */) {
        var argsObj = new Internal_Arguments(Array.prototype.slice.call(arguments, 1), getAPI)
          , index
          , args
          , result
          , operator
          ;
        index = this._findMethod(getAPI ,argsObj);
        if(index === -1) {
            throw new CPSFormulaError('Can\'t find an implementation for the '
                + 'operator "'+this.literal+'" that matches the given '
                + 'combination of argument types: '
                + argsObj.pure.map(function(item){
                        return 'type "' + (typeof item)
                                            + '" string "' + item +'"';})
                    .join(', ')
            );
        }
        if(typeof this._methods[index] === 'function') {
            operator = this._methods[index];
            args = argsObj.convertedNameTokens;
        }
        else {
            operator = this._methods[index].slice(-1).pop();
            if(this._methods[index][0] === '*getAPI*') {
                args = argsObj.keptNameTokens;
                args.unshift(getAPI);
            }
            else
                args = argsObj.convertedNameTokens;
        }
        result = operator.apply(this, args);

        // check for NaN and sorts of??
        return result;

    };

    /**
     * Implementation specific Object to create different versions of the
     * arguments array for further processing. This is in place to make
     * the creation of these different versions a) lazy and  b) cached.
     * This object never leaves the OperatorToken internals, so it doesn't
     * need its own module.
     *
     * The versions two versions of the arguments array are available at the
     * property getters:
     *   - convertedNameTokens:
     *   - keptNameTokens
     * In both cases, Tokens of the type NumberToken, StringToken, SelectorToken
     * are converted to their value (using their getValue method)
     * within convertedNameTokens NameTokns are converted to the value
     * returned by getAPI(token.getValue())
     */
    function Internal_Arguments(args, getAPI) {
        this.pure = args;
        this._getAPI = getAPI;
        this._keptNameTokens = null;
        this._convertedNameTokens = null;
    }

    Object.defineProperty(Internal_Arguments.prototype, 'convertedNameTokens', {
        get: function(){
            if(!this._convertedNameTokens)
                this._convertedNameTokens = this.pure
                        .map(this._convertTokenToValue.bind(this, true));
            return this._convertedNameTokens;
        }
    });

    Object.defineProperty(Internal_Arguments.prototype, 'keptNameTokens', {
        get: function(){
            if(!this._keptNameTokens)
                this._keptNameTokens = this.pure
                        .map(this._convertTokenToValue.bind(this, false));
            return this._keptNameTokens;
        }
    });

    Internal_Arguments.prototype._convertTokenToValue  = function(convertNameTokens, token) {
        // types that need conversion:
        if(token instanceof NumberToken || token instanceof StringToken
                || token instanceof SelectorToken)
            return token.getValue();

        // in some cases it is important that we unpack//resolve NameToken
        // namely when they refer to a value of the host (that can be obtained)
        // via getAPI.
        // this is a good place to do, but we need to know if this operator
        // is going to handle name tokens itself or not.
        // The presence of *getAPI* as first argumnt  which indicates
        // that the operator implementation is aware of such things like
        // names.
        if(convertNameTokens && token instanceof NameToken)
            return this._getAPI(token.getValue());
        return token;
    };

    return OperatorToken;
});
