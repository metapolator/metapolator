define([
    'metapolator/errors'
  , 'metapolator/models/CPS/dataTypes/formulae/parsing/Parser'
  , 'metapolator/models/CPS/dataTypes/formulae/parsing/OperatorToken'
  , 'metapolator/models/CPS/dataTypes/formulae/parsing/Stack'
  , 'metapolator/models/CPS/dataTypes/formulae/parsing/NumberToken'
], function(
    errors
  , Parser
  , Operator
  , Stack
  , NumberToken
) {
    "use strict";

    var ValueError = errors.Value
      , CPSFormulaError = errors.CPSFormula
      , engine
      ;

    /**
     * This defines the operators that are usable in simplae math expressions
     *
     * see the reference of new Operator for a description of its arguments.
     *
     * usage: engine.parse(CPSParameterValueString) returns a Stack
     */
    engine = new Parser(
        /**
         * When a value is negated using the minus sign, this operator is
         * inserted instead of the minus sign. It can also be used directly.
         *
         * The parser should detect cases where the minus sign is not a
         * subtraction, but a negation:
         *
         * -5 => negate 5
         * -(5 + name) => negate (5 + name)
         * 5 + -name => 5 + negate name
         * 5 + - name => 5 + negate name
         * name * - 5 => name * negate name
         *
         */
        new Operator('negate', false, 60, 0, 1, [
            // 'number' as an argument is not needed nor happening
            // because something like -123 will be parsed as a negative
            // number directly. This is because "Vector 12 -8" would
            // otherwise be tokenized as "Vector 12 subtract 8", because
            // we have no other indication of splitting.
            // the operator is left in place, so this: --123 could be done
            // and would result in `negate -123`
            ['number', function(a){ return -a; }]
        ])
          /**
           * add
           */
      , new Operator('+', true, 10, 1, 1, [
            ['number' , 'number', function(a, b){ return a + b; }]
        ])
        /**
         * subtract
         */
      , new Operator('-', true, 10, 1, 1, [
            ['number' , 'number', function(a, b){ return a - b; }]
        ])
        /**
         * multiply
         */
      , new Operator('*', true, 20, 1, 1, [
           ['number' , 'number', function(a, b){ return a * b; }]
        ])
        /**
         * divide
         */
      , new Operator('/', true, 20, 1, 1, [
            ['number' , 'number', function(a, b){ return a / b; }]
        ])
        /**
         * pow
         */
      , new Operator('^', true, 30, 1, 1, [
            ['number' , 'number', function(a, b){ return Math.pow(a, b); }]
        ])
      , new Operator('min', true, 40, 0, 2, [
            ['number' , 'number', function(a, b){ return Math.min(a, b); }]
        ])
      , new Operator('max', true, 40, 0, 2, [
            ['number' , 'number', function(a, b){ return Math.max(a, b); }]
      ])
    );

    function SimpleMathStack(postfixStack) {
        Stack.call(this, postfixStack);
    }
    var _p = SimpleMathStack.prototype = Object.create(Stack.prototype);
    _p.constructor = SimpleMathStack;

    _p._check = function(stack) {
        var i, l, invalid=[];
        for(i=0,l=stack.length;i<l;i++) {
            // whitelisting allowed tokens
            if(!(stack[i] instanceof NumberToken || stack[i] instanceof Operator))
                invalid.push(stack[i]);
        }
        if(invalid.length)
            throw new CPSFormulaError('The math expression contains invalid tokens: ' + invalid.join(', '));
        return Stack.prototype._check.call(this, stack);
    };

    /**
     * This method is applied in Stack.execute, with the result of the stack execution.
     *
     * OperatorToken._convertTokenToValue does something similar.
     */
    _p._finalizeMethod = function(result, getAPI) {
        if(typeof result != 'number')
            throw new CPSFormulaError('The math expression did not yield in a number. Got instead: ' + result);
        return result;
    };

    engine.setNegateOperator('-', 'negate');
    engine.setStackConstructor(SimpleMathStack);
    return engine;
});
