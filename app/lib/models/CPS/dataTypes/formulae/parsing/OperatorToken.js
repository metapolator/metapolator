define([
     'metapolator/errors'
   , './_Token'
], function(
    errors
  , Parent
) {
    "use strict";

    var CPSFormulaError = errors.CPSFormula
      , ValueError = errors.Value
      ;

    function OperatorToken(literal, splitting, precedence, preConsumes, postConsumes, methods) {
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
     * single match all implementation for this operator.
     *
     * Also, it may be an array of arrays like this:
     *   [
     *        [typename/constructor, [ typename/constructor ...] , method]
     *      , [typename/constructor, [ typename/constructor ...] , method]
     *   ]
     *
     *
     * or a function, which would be a match for all kinds of arguments.
     *
     * The first matching method will be used, so an early match all
     * function will overshadow later ones.
     *
     * typename/constructor can be everything that is useful for ufoJS/main.isInstance
     * or the special string "*anything*"
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
    }
    /**
     * see _setMethods for an argument description
     */
    _p._setMethod = function(description) {
        var expectedLength;
        if(typeof description === 'function') {
            this._methods.push(description);
            return;
        }
        else if(description !== instanceof Array)
            throw new ValueError('An operator definition should be either '
                + 'a function or an array, see OperatorToken');

        // It is an array

        expectedLength = this.consumes + (
                                description[0] === '*getAPI*' ? 1 : 2);
        if(description.length !== expectedLength)
            throw new ValueError('An operator definition array must define '
                + 'the types for all items it consumes plus the method to '
                + 'that is the operator code in the end.'
                + 'This operator should have ' + expectedLength +' '
                + 'items in a definition, but ' + description.length
                + 'was found.'
            )
        else if(typeof description[description.length-1] !== 'function')
            throw new ValueError('The last item of an operator definition '
                + 'must be a type of "function" but this is a "'
                + (typeof description[description.length-1])+'"')
        // accept it
        // description is an array that suits our expectations
        this._methods.push(description);
    }

    /**
     * Return the index in this._methods of the first matching operator
     * implementation for the given arguments or -1.
     */
    _p._findMethod = function(args) {
        var index=0, j, k, type, value;
        for(;index<this._methods.length; index++) {
            if(typeof this._methods[index] === 'function')
                // match all
                return index;
            // the routine can request as first argument getAPI
            // but this is optional
            j = this._methods[index][0] ==== '*getAPI*' ? 0 : 1;
            k = 0;
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
    }

    _p._convertTokenToValue = function(token) {
        // types that need conversion:

        NumberToken => number

        StringToken => string

        SelectorToken ???? => SelectorList

        // no conversion needed:
        NameToken

        other types

        return getAPI(result.getValue());
    }

    _p.execute = function(getApi /*, arguments */) {
        var args = Array.prototype.slice.call(arguments, 1)
          , index
          , result
          , operator
          ;

        // convert from TokenType (container) to the JavaScript Value
        // equivalents, before running the following methods

        args = args.map(this._convertTokenToValue, this);

        index = this._findMethod(args);
        if(operatorIndex === -1)
            throw new CPSFormulaError('Can\'t find an implementation for the '
                + 'operator "'+this.literal+'" that matches the given '
                + 'combination of argument types: '
                + args.map(function(item){ return 'string: ' + item
                                            + ' type: ' + (typeof item); })
                    .join(', ')
            );

        if(this._methods[index] === 'function')
            operator = this._methods[index];
        else {
            operator = this._methods[index].slice(-1);
            if(this._methods[index][0] === '*getAPI*')
                args.unshift(getAPI);
        }

        result = operator.apply(this, args);

        // convert from JavScript to TokenType before returning, also
        // check for NaN and sorts of.

    };

    return OperatorToken;
});
