define([
    'metapolator/errors'
  , 'metapolator/math/Vector'
  , './CompoundReal'
  , './CompoundVector'
  , './IntrinsicValue'
  , './CompoundAlgebraValue'
  , './algebra'
], function(
    errors
  , Vector
  , CompoundReal
  , CompoundVector
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
            if(val instanceof CompoundVector || val instanceof CompoundReal
                    || val instanceof IntrinsicValue)
                val = val.value;

            // at this point val may be number or Vector
            if(!(val instanceof Vector) && typeof val !== 'number')
                throw new ValueError(this._literal + ': '
                                    + 'Expected an instanceof Vector or a '
                                    + 'typeof number but got a: ' + val
                                    + ' typeof: '+ typeof val);
            else if(typeof val === 'number' && !isFinite(val))
                throw new ValueError('Value is a number but not finite '+ val);
            else if(val instanceof Vector && (!isFinite(val.x) || !isFinite(val.y)))
                throw new ValueError('Value is a Vector but one of its components '
                    + 'is not finite: ' + val);
                return val;
            }, this)
        return this._routine.apply(null, args);
    }

    function printType(a){
        console.log('debug typeof:', typeof a, 'string val: '+a);
        return a;
    }

    var _toRad = Math.PI/180;
    function deg2rad(deg){
        // deg * Math.PI/180;
        return deg * _toRad;
    }

    function subtract(a, b) {
        if(typeof a === 'number' && typeof b === 'number')
            return a - b;
        if(!(a instanceof Vector))
            a = new Vector(a);
        return a['-'](b);
    }

    var algebraEngine = new algebra.Engine(
        CompoundAlgebraValue
      , new CPSOperator('getrad', 1, 0, 1, function(a) {
            return a.rad;
        })
      , new CPSOperator('+',1, 1, 1, function(a, b){ return a+b; })
      , new CPSOperator('-',1, 1, 1, subtract)
      , new CPSOperator('*',2, 1, 1, function(a, b){ return a*b; })
      , new CPSOperator('/',2, 1, 1, function(a, b){
          if(b === 0)
              throw new ValueError('Division by Zero.');
          return a/b; })
      , new CPSOperator('^',3, 1, 1, function(a, b){ return Math.pow(a, b);})
      , new CPSOperator('deg', 5, 0, 1, deg2rad)
      , new CPSOperator('_type',100, 0, 1, printType)
    );

    return {
        defaultFactory: function(name, element, getCPSValueAPI) {
            // var intrinsic = getCPSValueAPI(name + 'Intrinsic');
            var intrinsic = 0;
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
                //intrinsic = getCPSValueAPI(name + 'Intrinsic');
                return new CompoundReal(
                    intrinsic,
                    getCPSValueAPI,
                    postfixStack.items
                );
            });
        }
    }
});
