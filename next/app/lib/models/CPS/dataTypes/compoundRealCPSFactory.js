define([
    'metapolator/errors'
  , './CompoundReal'
  , './IntrinsicValue'
  , './CompoundAlgebraValue'
  , './algebra'
], function(
    errors
  , CompoundReal
  , IntrinsicValue
  , CompoundAlgebraValue
  , algebra
) {
    "use strict";
    
    var ValueError = errors.Value
      , CPSAlgebraError = errors.CPSAlgebra
      ;
    
    function CPSOperator() {
        algebra.Operator.apply(this, Array.prototype.slice.call(arguments));
    }
    CPSOperator.prototype = Object.create(algebra.Operator.prototype);
    CPSOperator.prototype.execute = function(a, b) {
        var args = Array.prototype.slice.call(arguments)
            .map(function(val) {
                if(val instanceof CompoundReal || val instanceof IntrinsicValue)
                    val = val.value;
                else if (typeof val !== 'number')
                    throw new ValueError('Expected a typeof number but got a: '
                                                        + typeof val + ' ' + val.constructor.name);
                else if(!isFinite(val))
                    throw new ValueError('Value is not finite: ' + val);
                return val;
            })
        return this._routine.apply(null, args);
    }
    
    var algebraEngine = new algebra.Engine(
        CompoundAlgebraValue
      , new CPSOperator('+',1, 1, 1, function(a, b){ return a+b; })
      , new CPSOperator('-',1, 1, 1, function(a, b){ return a-b; })
      , new CPSOperator('*',2, 1, 1, function(a, b){ return a*b; })
      , new CPSOperator('/',2, 1, 1, function(a, b){
          if(b === 0)
              throw new ValueError('Division by Zero.');
          return a/b; })
      , new CPSOperator('^',3, 1, 1, function(a, b){ return Math.pow(a, b);})
    );
    
    return {
        defaultFactory: function(name, element, getCPSValueAPI) {
            var intrinsic = getCPSValueAPI(name + 'Intrinsic');
            return  new CompoundReal(intrinsic);
        }
      , is: function(value) {
            return value instanceof CompoundReal;
        }
      , init: function(parameterValue, setFactoryAPI, setInvalidAPI) {
            var invalidParamterMessage = false
            , postfixStack
            ;
            
            try {
                // this stack element stores the calculations that have to
                // be done in an array of postfix/reverse polish notation
                // items.
                postfixStack = algebraEngine.getExecuteableStack(
                                                parameterValue.valueString);
            }
            catch(error) {
                if(error instanceof CPSAlgebraError)
                    invalidParamterMessage = error.message;
                else
                    // reraise in all other cases
                    throw error;
            }
            
            if(invalidParamterMessage) {
                setInvalidAPI(invalidParamterMessage);
                return;
            }
            setFactoryAPI(function(name, element, getCPSValueAPI) {
                var intrinsic = 0;
                intrinsic = getCPSValueAPI(name + 'Intrinsic');
                return new CompoundReal(
                    intrinsic,
                    getCPSValueAPI,
                    postfixStack.items
                );
            });
        }
    }
});
