define([
    'metapolator/errors'
  , './CompoundVector'
  , 'metapolator/math/Vector'
  , './CompoundReal'
  , './IntrinsicValue'
  , './CompoundAlgebraValue'
  , './algebra'
  , 'ufojs/tools/misc/transform'
], function(
    errors
  , CompoundVector
  , Vector
  , CompoundReal
  , IntrinsicValue
  , CompoundAlgebraValue
  , algebra
  , transform
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
                val = val.getValue(getCPSValueAPI);
            // at this point val may be number, CompoundReal, Vector,
            // CompoundVector or IntrinsicValue
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
            args.push(val);
        }
        var result = this._routine.apply(null, args);
        return result;
    };

    function add(a, b) {
        if(typeof a === 'number' && typeof b === 'number')
            return a + b;
        if(!(a instanceof Vector))
            a = new Vector(a);
        return a['+'](b);
    }
    function subtract(a, b) {
        if(typeof a === 'number' && typeof b === 'number')
            return a - b;
        if(!(a instanceof Vector))
            a = new Vector(a);
        return a['-'](b);
    }
    function multiply(a, b) {
        if(typeof a === 'number' && typeof b === 'number')
            return a * b;
        if(!(a instanceof Vector))
            a = new Vector(a);
        return a['*'](b);
    }
    function divide(a, b) {
        if(typeof a === 'number' && typeof b === 'number')
            return a / b;
        if(!(a instanceof Vector))
            a = new Vector(a);
        return a['/'](b);
    }
    function pow(a, b) {
        if(typeof a === 'number' && typeof b === 'number')
            return Math.pow(a, b);
        if(!a instanceof Vector)
            a = new Vector(a);
        return a['**'](b);
    }
    function constructVector(a, b) {
        if(typeof a !== 'number' || typeof b !== 'number')
            throw new ValueError('All arguments of the Vector constructor '
                +'operator must be typeof number, but got: '
                + typeof a + ' and ' + typeof b);
        return new Vector(a, b);
    }

    function constructVectorFromPolar(r, phi) {
        if(typeof r !== 'number' || typeof phi !== 'number')
            throw new ValueError('All arguments of the Vector.fromPolar '
                +'operator must be typeof number, but got: '
                + typeof r + ' and ' + typeof phi);
        return Vector.fromPolar(r, phi);
    }

    var _toRad = Math.PI/180;
    function deg2rad(deg){
        // deg * Math.PI/180;
        return deg * _toRad;
    }

    function printType(a){
        console.log('debug typeof:', typeof a, 'string val: '+a);
        return a;
    }

    function scale(x, y, vector) {
        var scale = transform.Scale(x, y);
        return new Vector.fromArray(scale.transformPoint(vector));
    }

    var algebraEngine = new algebra.Engine(
        CompoundAlgebraValue
      , new CPSOperator('index', 0, 0, 2, function(index, item){ return item[index]; })
      , new CPSOperator('scale', 0, 0, 3, scale)
      , new CPSOperator('+',1, 1, 1, add)
      , new CPSOperator('-',1, 1, 1, subtract)
      , new CPSOperator('*',2, 1, 1, multiply)
      , new CPSOperator('/',2, 1, 1, divide)
      , new CPSOperator('^',3, 1, 1, pow)
      // comma is the vector constructor operator
      , new CPSOperator(',',4, 1, 1, constructVector)
      // "polar" is used to construct a vector from polar arguments:
      // magnitude and an angle in radians "polar 100, 0.7853"
      , new CPSOperator('polar', 4, 0, 2, constructVectorFromPolar)
      // use the deg operator to convert a number from degree to radians
      // this has higher precedence than "polar" because it makes writing:
      // "polar 100 45 deg" possible.
      , new CPSOperator('deg', 5, 0, 1, deg2rad)

      , new CPSOperator('_type', 100, 0, 1, printType)
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
                // FIXME: part of testing the removal the implicit
                // intrinsic value (by simply setting it to zero)
                // the 'name + Intrinsic' property will be used in
                // the parameter definition explicitly
                // If this is a good idea: refactor :-)
                intrinsic = [0,0]// getCPSValueAPI(name + 'Intrinsic');
                return new CompoundVector(
                    intrinsic,
                    getCPSValueAPI,
                    postfixStack.items
                );
            });
        }
    };
});
