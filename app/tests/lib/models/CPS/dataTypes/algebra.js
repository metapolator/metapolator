 define([
    'intern!object'
  , 'intern/chai!assert'
  , 'metapolator/errors'
  , 'metapolator/models/CPS/dataTypes/algebra'
], function (
    registerSuite
  , assert
  , errors
  , algebra
) {
    "use strict";
    
    
    // this tests algebra against javascripts eval,
    // the most results should equal, however, there are some fine
    // differences
    function Value(literal) {
        algebra.Value.apply(this, Array.prototype.slice.call(arguments));
        var val = this.literal;
        if(typeof this.literal === 'string')
            val = parseFloat(this.literal);
        else if (typeof val !== 'number')
            throw new Error('Got a value wich is not type of number: "'
                                        + val +'" typeof: '+ typeof val);
        if(val !== val)
            throw new Error('Got a NaN value: ' +val + ' from '+this.literal
                    +' typeof: '+ typeof this.literal);
        
        this._value = val;
    }
    
    Value.prototype = Object.create(algebra.Value.prototype);
    Value.prototype.valueOf = function() {
        return this._value;
    }
    
    function Operator() {
        algebra.Operator.apply(this, Array.prototype.slice.call(arguments));
    }
    Operator.prototype = Object.create(algebra.Operator.prototype);
    Operator.prototype.execute = function(a, b) {
        var args = Array.prototype.slice.call(arguments)
            .map(function(val) {
                if(!val instanceof Value)
                    throw new Error('Expected a Value but got something '
                                                        +'else: '+ val);
                return val.valueOf();
            })
        return new Value(this._routine.apply(null, args));
    }
    
    var algebraEngine = new algebra.Engine(
          Value
        , new Operator('+',1, 1, 1, function(a, b){ return a+b; })
        , new Operator('-',1, 1, 1, function(a, b){ return a-b; })
        , new Operator('*',2, 1, 1, function(a, b){ return a*b; })
        , new Operator('/',2, 1, 1, function(a, b){
            if(b === 0)
                throw new Error('Division by Zero.');
            return a/b; })
        , new Operator('^',3, 1, 1, function(a, b){ return Math.pow(a, b);})
    );
    
    registerSuite({
        name: 'CPS dataTypes Algebra',
        CPS_Algebra_vs_eval: function() {
            // Note, not everything you can solve with eval can be solved
            // with this engine. But it should be enough to solve some
            // easy expressions.
            // There are also a lot of thing this engine can do, that eval
            // couldn't do.
            // The aim of these tests is to see that the order of precedence
            // of algebraic expressions is obeyed.
            var tests = [
                    '1+1'
                  , '1+-1'
                  , '1+2*3'
                  , '(1+2)*3'
                  , '1 - 2 * 3 + 4 * 7 / (8 + 2)'
                  , '1+1-1+1-1+1-1+1-1+1'
                  , '((((((1)))))) + 1'
                  , '-1+1'
                  , '3*(3+4)*-4'
                  , '1/(3+2)*9'
                  , '(2 - 1) + 2 * 3'
                  , '(1 + 2 * 3) + (1 + 2 * 3)'
                  , '(1 + 2 * (1 + 2 * 3)) + 3'
                  , '(1 + 2 * (1 + 2 * 3)) * 3'
                ]
              , i=0
              , stack
            for(;i<tests.length;i++) {
                stack = algebraEngine.getExecuteableStack(tests[i])
                assert.strictEqual(
                    stack.execute().valueOf(),
                    eval(tests[i]),
                    'The results of calculating :"'+tests[i]+'" are not strict equal'
                )
            }
        }
    });
})
