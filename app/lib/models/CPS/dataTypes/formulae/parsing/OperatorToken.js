define([
     'metapolator/errors'
   , './_Token'
   , './NameToken'
   , 'ufojs/main'
], function(
    errors
  , Parent
  , NameToken
  , ufoJSUtils
) {
    "use strict";

    var CPSFormulaError = errors.CPSFormula
      , ValueError = errors.Value
      , isInstance = ufoJSUtils.isInstance
      , stringify = JSON.stringify
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

        // need these for access from the compiled functions
        this.CPSFormulaError = CPSFormulaError;
        this.NameToken = NameToken;

        // NOTE: List has a variable argument length, so may others too!
        // The stack compiler will take care of that, but we'll have to
        // wait with compiling
        if(isFinite(this.preConsumes) && isFinite(this.postConsumes))
            this.execute = this.compile();
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
     * Also, it may be an array of arrays like this:
     *   [
     *        [typename/constructor, [ typename/constructor ...] , method]
     *      , [typename/constructor, [ typename/constructor ...] , method]
     *      , function(){} // optional, match all
     *   ]
     *
     * The first method that matches the actual types of arguments will
     * be used, so an early match all function will shadow later ones.
     *
     * typename/constructor can be everything that is useful with ufoJS/main.isInstance
     * However, the compiled version does not use ufoJS/main.isInstance!
     * That may lead to problems when ufoJS/main.isInstance changes but not
     * the compiling code in here!
     * Usually all Operators will be compiled. Interpreting is still here
     * for legacy reasons, also, the algorithm is easier to read.
     *
     * typename/constructor can have special values:
     *
     * - The string: "*getAPI*", only as very first element:
     *        this does two things:
     *            * it injects the getAPI function as first argument of method
     *            * it doesn't resolve NameToken arguments using getAPI(nameToken.getValue())
     *              so, specifiying *getAPI* means method will handle
     *              NameTokens by itself.
     *        In turn, this means NameToken can be used as a typename/constructor
     *        but it will only ever appear as argument when *getAPI* is requested,
     *        otherwise it will be resolved before invocation.
     *        IMPORTANT: All *getAPI* methods must be defined before the ones without
     *        *getAPI*.
     * - The string "*anything*" which matches anything
     *
     * ufoJS/main.isInstance takes:
     *  - functions which will be checked using "instanceof" or a string
     *  - strings can be everything where typeof actually works, like:
     *                  "number", "string", "undefined", "object"
     *  - strings can be: "int" "float" "NaN" "null" "Infinity" "-Infinity"
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
                                description[0] === '*getAPI*' || description[0] === '*unboxed+getAPI*' ? 2 : 1);

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
        else if(this._methods.length // this is not the first
                    && description[0] === '*getAPI*' // this is boxed
                    && this._methods[this._methods.length-1][0] !== '*getAPI*')// the previous is unboxed
            throw new ValueError('The previous operator uses "unboxed" NameTokens '
                + 'but this one unboxes itself. (*getAPI* is the  first argument) '
                + 'This is illegal. Operators that unbox themselves  must be '
                + 'defined before operators that expect unboxed values.\n'
                + 'This is because automatic unboxing could cause '
                + 'unpredictable behavior (like a hit where no hit should be) '
                + 'and also errors for not found names. Also, automatic '
                + 'unboxing for a value that doesn\'t need it is bad for '
                + 'performance.'
            );
        // accept it
        // description is an array that suits our expectations
        this._methods.push(description);
    };

    // helper for compile
    function _makeArgNames(length, _prefix, _postfix) {
        var result = [], i, prefix = _prefix || '', postfix = _postfix || '';
        for(i=0;i<length;i++) result.push(prefix + i + postfix);
        return result;
    }

    // helper for compile
    function _makeLocalBoxedNames(body, methods, consumes) {
        var i, l, isBoxed
          , usersOfBoxed = 0
          , args = _makeArgNames(consumes, 'args[', ']')
          , boxedNames
          ;
        for(i=0, l=methods.length;i<l; i++) {
            isBoxed = methods[i][0] === '*getAPI*';
            // The first unboxed user uses the boxed values for unboxing
            // and thus makes also an access to the unboxed values.
            usersOfBoxed += 1;
            // After the first unboxed user, boxed will not be used anymore.
            if(!isBoxed) break;
        }
        if(usersOfBoxed < 2)
            // We don't declare the vars if less than 2 accesses to boxed NameTokens
            // are done. This assumes that declaring locally and two subsequent
            // accesses are cheaper than always accessing the args array;
            return args;
        boxedNames = _makeArgNames(consumes, 'aN');
        for(i=0,l=consumes;i<l;i++)
            body.push('var ' , boxedNames[i] ,' = ', args[i], ';\n');
        return boxedNames;
    }

    // helper for compile
    function _makeLocalUnboxedNames(body, consumes, boxedNames) {
        var i, arg, unboxedNames = _makeArgNames(consumes, 'aV');
        for(i=0;i<consumes;i++) {
            arg = boxedNames[i];
            body.push('var ' , unboxedNames[i] , ' = ' , arg , ' instanceof NameToken '
                    , '? getAPI.get(' , arg , '.getValue()) '
                    , ': ' , arg , ';\n');
        }
        return unboxedNames;
    }

    // helper for compile
    function _makeTypeTest(arg, typeAdress, typeVal, ctors) {
        var typeTest = []
          , typeOfType = typeof typeVal
          , ctorCache
          , ctorName
          ;
        if(typeOfType === 'function') {
            ctorCache = ctors.cache;
            ctorName = ctorCache.get(typeVal);
            if(!ctorName) {
                ctorName = 'c' + (ctors.i++);
                ctors.init.push('var ', ctorName, ' = ', typeAdress,';\n');
                ctorCache.set(typeVal, ctorName);
            }
            typeTest.push( arg, ' instanceof ', ctorName);
        }
        else if (typeOfType === 'string') {
            switch(typeVal) {
                case 'int':
                    typeTest.push('typeof ', arg,' === "number" && '
                            , arg, ' === (',arg,'|0)');
                    break;
                case 'float':
                    typeTest.push('typeof ', arg,' === "number" && '
                            , 'isFinite(', arg, ') && '
                            , arg, ' !== (',arg,'|0)');
                    break;
                case 'number':
                    typeTest.push('typeof ', arg,' === "number" && '
                            , arg, ' === ', arg);
                    break;
                case 'NaN':
                    typeTest.push(arg, ' !== ', arg);
                    break;
                case 'null':
                    typeTest.push(arg, ' === null');
                    break;
                case 'Infinity':
                    typeTest.push(arg, ' === Number.POSITIVE_INFINITY');
                    break;
                case '-Infinity':
                    typeTest.push(arg, ' === Number.NEGATIVE_INFINITY');
                    break;
                default:
                    typeTest.push('typeof ',arg ,' === ', stringify(typeVal));
                    break;
            }
        }
        else
            throw new ValueError('Unkown type for a value-type: ' + typeOfType);

        return typeTest.join('');
    }

    // helper for compile
    function _makeTypeTests(body, typeTests, ctors, name, type, adress) {
        var i
          , l = type instanceof Array ? type.length : 1
          , typeAdress
          , typeVal
          , test
          ;
        for(i=0;i<l;i++) {
            if(i) body.push(' || ');
            if(type instanceof Array) {
                typeAdress = adress + '[' + i + ']';
                typeVal = type[i];
            }
            else {
                typeAdress = adress;
                typeVal = type;
            }
            test = _makeTypeTest(name, typeAdress, typeVal, ctors);
            // Caching the results of identical tests
            // without _cacheTypeTest this would be just: body.push(test);
            _cacheTypeTest(body, typeTests, test);
        }
    }

    // helper for compile
    function _cacheTypeTest(body, typeTests, typeTest) {
        var typeData = typeTests[typeTest];
        if(!typeData) {
            // Rember the body index (bi) for later replacement
            typeTests[typeTest] = {bi: body.length, varName: null};
            body.push(typeTest);
            return;
        }
        // We had this test once! Prepare to save its result when it's
        // executed the first time.
        if(!typeData.varName) {
            typeData.varName = 'tt' + typeTests.__length;
            typeTests.__length++;

            // Initialize the name in the prelude of the function.
            // We can't  do this inline.
            typeTests.__init.push('var ' + typeData.varName + ';\n');

            // The first occurance of the test is replaced to store
            // its result in a name.
            body[typeData.bi] = typeData.varName + ' = (' + typeTest + ')';

        }
        // The current test tries to use the cached version if it was already
        // executed. Otherwise it falls back to initializie the var itself.
        body.push('(', typeData.varName, ' || (', typeData.varName ,' === false ? false'
                ,' : ',typeData.varName ,' = (',typeTest,')))');
    }

    /**
     * compile the Operator description to native JavaScript.
     */
    _p.compile = function () {
        /*jshint evil:true*/
        var body = ['"use strict";\n']
          , i, j, k, l, ll, description, methodName
          , names, args, type, typeVarsIndex, ctorIndex, isBoxed, hasGetAPI
          , hasMatchAll = false
          , unboxedNameTokens = false
          , typeTests = {
                __length: 0
              , __init: []
            }
          , ctors = {
                i: 0
              , cache: new Map()
              , init: []
            }
          ;
        body.push(
            '//', this.literal, '\n',
            'var NameToken = this.NameToken\n'
          , '  , methods = this._methods\n'
          , '  ;\n'
        );
        names = _makeLocalBoxedNames(body, this._methods, this.consumes);
        args = names.join(', ');

        // a placeholder
        typeVarsIndex = body.length;
        body.push('');

        for(i=0, l=this._methods.length;i<l; i++) {
            description = this._methods[i];
            methodName = 'm' + i;
            body.push('var ',methodName,' = methods[', i ,'];\n');

            isBoxed = description[0] === '*getAPI*';
            hasGetAPI = isBoxed || description[0] === '*unboxed+getAPI*';

            if(unboxedNameTokens && isBoxed)
                // This is a problem in the design of the operator
                // see the lengthy error message in p._setMethod
                throw new ValueError('Found a *getAPI* after names where already unboxed!');
            else if(!unboxedNameTokens && !isBoxed) {
                //unbox NameTokens
                unboxedNameTokens = true;
                names = _makeLocalUnboxedNames(body, this.consumes, names);
                args = names.join(', ');
            }

            if(typeof description === 'function') {
                // That's it! This is a match-all method, no further
                // evaluation is needed.
                hasMatchAll = true;
                body.push('return ',methodName,'(', args, ');');
                break;
            }

            // a placeholder
            ctorIndex = body.length;
            body.push('');

            body.push('if(true');
            // k: start at 1 if the first item is *getAPI*
            for(j=0, k=hasGetAPI?1:0,ll=this.consumes;j<ll;k++,j++) {
                type = description[k];
                // always true
                if(type === '*anything*') continue;
                body.push(' && (');
                _makeTypeTests(body, typeTests, ctors, names[j], type,  methodName + '[' + k +']');
                body.push(')');
            }
            body.push(
                ')\n    '
              , 'return ' ,methodName,'[', description.length-1, '](', (hasGetAPI ? 'getAPI, ' : ''), args, ');\n'
            );

            // write the constructor references
            body[ctorIndex] = ctors.init.join('');
            ctors.init = [];
        }
        // write the type test result var names
        if(typeTests.__init.length)
            body[typeVarsIndex] = typeTests.__init.join('');

        if(!hasMatchAll)
            // raise if we are still here
            body.push(
                'throw new this.CPSFormulaError('
              , stringify('Can\'t find an implementation for the operator '
                    + stringify(this.literal)
                    + ' that matches the given combination of argument types:\n')
              , '\n    '
              , ' + args.map(function(item){\n    '
              , 'return "\\"" + item + "\\" (typeof: " + (typeof item) + ")";}'
              , ').join(", ")'
              , '\n    );'
            );
        return new Function('getAPI', 'args', body.join(''));
    };

    /**
     * Return the index in this._methods of the first matching operator
     * implementation for the given arguments or -1.
     */
    _p._findMethod = function(getAPI, argsObj) {
        var index=0, length=this._methods.length, j, k, type, value, args;

        for(;index<length; index++) {
            // the routine can request as first argument getAPI
            // this however changes how NameToken is processed
            // without *getAPI* the lookup is made for the operator
            // with *getAPI* the operator itself is in charge to
            // look up the names. The latter can happen anywhere, not
            // just with the getAPI.

            // convert from TokenType (container) to the JavaScript Value
            // equivalents, before running the following methods
            if(this._methods[index][0] !== '*getAPI*') {
                j = 0;
                args = argsObj.unboxedNameTokens;
            }
            else {
                j = 1;
                args = argsObj.original;
            }

            if(typeof this._methods[index] === 'function')
                // match all
                return index;

            for(k = 0;k<args.length;j++, k++) {
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

    /**
     * This method interpretes the the Operator description.
     *
     * However, usually the Operator will compile itself into
     * native JavaScript upon initializaiton and override this
     * implementation
     */
    _p.execute = function(getAPI , _args) {
        var argsObj = new Internal_Arguments(_args, getAPI)
          , index
          , args
          , result
          , operator
          , description
          ;
        index = this._findMethod(getAPI ,argsObj);
        if(index === -1) {
            throw new CPSFormulaError('Can\'t find an implementation for the '
                + 'operator "'+this.literal+'" that matches the given '
                + 'combination of argument types: '
                + argsObj.original.map(function(item){
                        return 'type "' + (typeof item)
                                            + '" string "' + item +'"';})
                    .join(', ')
            );
        }
        description = this._methods[index];
        if(typeof description === 'function') {
            operator = description;
            args = argsObj.unboxedNameTokens;
        }
        else {
            operator = description.slice(-1).pop();
            if(description[0] === '*getAPI*') {
                args = [getAPI];
                Array.prototype.push.apply(args, argsObj.original);
            }
            else if(description[0] === '*unboxed+getAPI*') {
                args = [getAPI];
                Array.prototype.push.apply(args, argsObj.unboxedNameTokens);
            }
            else
                args = argsObj.unboxedNameTokens;
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
     * The two versions of the arguments array are available at the
     * property getters:
     *   - unboxedNameTokens:
     *   - original
     * within unboxedNameTokens NameTokens are converted to the value
     * returned by getAPI(token.getValue())
     */
    function Internal_Arguments(args, getAPI) {
        this.original = args;
        this._getAPI = getAPI;
        this._unboxedNameTokens = null;
    }

    Object.defineProperty(Internal_Arguments.prototype, 'unboxedNameTokens', {
        get: function() {
            if(!this._unboxedNameTokens)
                this._unboxedNameTokens = this.original.map(_unbox, this);
            return this._unboxedNameTokens;
        }
    });

    function _unbox (token) {
         /*jshint validthis:true */
        if(token instanceof NameToken)
            return this._getAPI.get(token.getValue());
        return token;
    }

    return OperatorToken;
});
