define([
    'metapolator/errors'
  , './CompoundVector'
  , './Vector'
  , './CompoundReal'
  , './IntrinsicValue'
  , './CompoundAlgebraValue'
  , './algebra'
], function(
    errors
  , CompoundVector
  , Vector
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
    CPSOperator.prototype.execute = function(getCPSValueAPI, a, b) {
        var args = []
          , i = 1
          , val
          ;
        for(;i<arguments.length;i++) {
            val = arguments[i];
            if(val instanceof CompoundAlgebraValue)
                val = val.getValue(getCPSValueAPI)
            // at this point val may be number, CompoundReal, Vector,
            // CompoundVector or IntrinsicValue
            if(val instanceof CompoundVector || val instanceof CompoundReal
                    || val instanceof IntrinsicValue)
                val = val.value;
            
            // at this point val may be number or Vector
            if(!(val instanceof Vector) && typeof val !== 'number')
                throw new ValueError('Expected an instanceof Vector or a '
                                    + ' typeof number but got a: ' + val
                                    + ' typeof: '+ typeof val);
            else if(typeof val === 'number' && !isFinite(val))
                throw new ValueError('Value is a number but not finite '+ val);
            else if(val instanceof Vector && (!isFinite(val.x) || !isFinite(val.y)))
                throw new ValueError('Value is a Vector but one of its components '
                    + 'is not finite: ' + val);
            args.push(val);
        }
        var result = this._routine.apply(null, args);
        return result;
    }
    
    function add(a, b) {
        if(!(a instanceof Vector))
            a = new Vector(a)
        return a['+'](b);
    }
    function subtract(a, b) {
        if(!(a instanceof Vector))
            a = new Vector(a)
        return a['-'](b);
    }
    function multiply(a, b) {
        if(!(a instanceof Vector))
            a = new Vector(a)
        return a['*'](b);
    }
    function divide(a, b){
        if(!(a instanceof Vector))
            a = new Vector(a)
        return a['/'](b);
    }
    function pow(a, b){
        if(!a instanceof Vector)
            a = new Vector(a)
        return a['**'](b);
    }
    function constructVector(a, b) {
        if(typeof a !== 'number' || typeof b !== 'number')
            throw new ValueError('All arguments of the Vector constructior '
                +'operator must be typeof number, but got: '
                + typeof a + ' and ' + typeof b);
        return new Vector(a, b);
    }
    
    var algebraEngine = new algebra.Engine(
        CompoundAlgebraValue
      , new CPSOperator('+',1, 1, 1, add)
      , new CPSOperator('-',1, 1, 1, subtract)
      , new CPSOperator('*',2, 1, 1, multiply)
      , new CPSOperator('/',2, 1, 1, divide)
      , new CPSOperator('^',3, 1, 1, pow)
      // comma is the vector constructor operator
      // it has highest precedence
      , new CPSOperator(',',4, 1, 1, constructVector)
    );
    
    return {
        defaultFactory: function(name, element, getCPSValueAPI) {
            var intrinsic = getCPSValueAPI(name + 'Intrinsic');
            return  new CompoundVector(intrinsic);
        }
      , is: function(value) {
            return value instanceof CompoundVector;
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
                var intrinsic;
                intrinsic = getCPSValueAPI(name + 'Intrinsic');
                return new CompoundVector(
                    intrinsic,
                    getCPSValueAPI,
                    postfixStack.items
                );
            });
        }
    }
});
