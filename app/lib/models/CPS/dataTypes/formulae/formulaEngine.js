define([
    'metapolator/errors'
  , './parsing/Parser'
  , './parsing/OperatorToken'
  , './parsing/NameToken'
  , './parsing/SelectorToken'
  , './parsing/StringToken'
  , './parsing/NumberToken'
  , './parsing/_Token'
  , 'metapolator/models/CPS/elements/SelectorList'
  , 'metapolator/models/MOM/_Node'
  , 'metapolator/models/CPS/cpsGetters'
  , 'ufojs/tools/misc/transform'
  , 'metapolator/math/Vector'
], function(
    errors
  , Parser
  , Operator
  , NameToken
  , SelectorToken
  , StringToken
  , NumberToken
  , _Token
  , SelectorList
  , _MOMNode
  , cpsGetters
  , transform
  , Vector
) {
    "use strict";

    var ValueError = errors.Value
      , CPSFormulaError = errors.CPSFormula
      , Transformation = transform.Transform
      , engine
      ;

    /**
     * This defines the operators that are usable in CPS-formulae, thus
     * the better part of the language definition can be found in here.
     * However, some rather specific behaviors are still buried in the
     * Parser implementation
     *
     * see the reference of new Operator for a description of its arguments.
     *
     * usage: engine.parse(CPSParameterValueString)
     */
    engine = new Parser(
        /**
         * returns an Array of everything that is on the current stack
         *
         * May become useful in the future, but for now it's more on the
         * experimentation side. Getters should already work on arrays, so
         * it may be a way to store values in an @dictionary parameter and
         * index numbers.
         */
        new Operator('List', false, -Infinity, 0, Infinity, function(/*args, ...*/) {
            // the first args is the 'get' interface, we don't return it.
            return Array.protoype.slice(arguments, 1);
        })
        /**
         * Returns a generic Value, could be virtually anything
         *
         * used in a context like this
         * item['key']
         * which is translated to
         * item __get__ 'key'
         *
         * which should translate roughly to the javascript:
         * item['key'] or item.get('key'), depending of the nature
         * of item and the details of the implementation
         */
      , new Operator('__get__', false, Infinity, 1, 1, [
            ['*getAPI*', NameToken, 'String', function(getApi, name, key) {
                var item = getApi(name.getValue());
                return cpsGetters.generic(item, key);
            }]
          , ['*getAPI*', NameToken, NameToken, function(getAPI, name1, name2) {
                var item = getAPI(name1.getValue())
                  , key = getAPI(name2.getValue())
                  ;
                return cpsGetters.generic(item, key);
            }]
            // value: this['parent'][S"point.top"]
          , [_MOMNode, SelectorList, function(node, selector) {
                var result = node.query(selector);
                if(!result)
                    throw new KeyError('Not found: an element for '
                                        + SelectorList + ' '
                                        + 'in ' + node.particulars
                                    );
                return result;
            }]
          , ['*anything*', ['number', 'string'], function(item, key) {
                return cpsGetters.generic(item, key);
            }]
        ])
        /**
         * Returns a generic Value, could be virtually anything
         * similar to __get__
         *
         * used like this:
         * item.name
         *
         * name must be a name token, its value is used to get a propety
         * of item.
         * in javascript it does roughly the following:
         * var key = name.getValue()
         * return item[key]
         */
      , new Operator(':', true, Infinity, 1, 1, [
            ['*getAPI*', NameToken, NameToken, function(getAPI, name, key) {
                var item = getAPI(name.getValue());
                return cpsGetters.generic(item, key.getValue());
            }]
          , ['*getAPI*', SelectorList, NameToken, function(getAPI, selector, key) {
                // SelectorList selects from global scope, aka multivers
                var item = getAPI('this').multivers.query(selector);
                if(!item)
                    throw new KeyError('Not found: an element for '
                                                        + SelectorList);
                return cpsGetters.generic(item, key.getValue());
            }]
          , ['*getAPI*', '*anything*', NameToken, function(getAPI, item, key) {
                return cpsGetters.generic(item, key.getValue());
            }]
        ])
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
      , new Operator('negate', false, 60, 0, 1, [
            // 'number' as an argument is not needed nor happening
            // because something like -123 will be parsed as a negative
            // number directly. This is because "Vector 12 -8" would
            // otherwise be tokenized as "Vector 12 subtract 8", because
            // we have no other indication of splitting.
            // the operator is left in place, so this: --123 could be done
            // and would result in `negate -123`
            ['number', function(a){ return -a; }]
          , [Vector, function(a){ return a.negate();}]
          , [Transformation, function(transformation){ return transformation.inverse();}]
        ])
          /**
           * add
           */
      , new Operator('+', true, 10, 1, 1, [
            ['number' , 'number', function(a, b){ return a + b; }]
          , ['string' , 'string', function(a, b){ return a + b; }]
          , [Array , Array, function(a, b){ return a.concat(b); }]
          , [Vector, Vector, function(a, b){ return a['+'](b);}]
          , [Vector, 'number', function(a, b){ return a['+'](b);}]
        ])
        /**
         * subtract
         */
      , new Operator('-', true, 10, 1, 1, [
            ['number' , 'number', function(a, b){ return a - b; }]
          , [Vector, Vector, function(a, b){ return a['-'](b);}]
          , [Vector, 'number', function(a, b){ return a['-'](b);}]
        ])
        /**
         * multiply
         */
      , new Operator('*', true, 20, 1, 1, [
           ['number' , 'number', function(a, b){ return a * b; }]
         , [Vector, Vector, function(a, b){ return a['*'](b);}]
         , [Vector, 'number', function(a, b){ return a['*'](b);}]
         , [Transformation, Vector, function(tarnsformation, vector) {
                return Vector.fromArray(tarnsformation.transformPoint(vector));
           }]
         , [Transformation, Transformation, function(t1, t2) {return t1.transform(t2);}]
        ])
        /**
         * divide
         */
      , new Operator('/', true, 20, 1, 1, [
            ['number' , 'number', function(a, b){ return a / b; }]
          , [Vector, Vector, function(a, b){ return a['/'](b);}]
          , [Vector, 'number', function(a, b){ return a['/'](b);}]
        ])
        /**
         * pow
         */
      , new Operator('^', true, 30, 1, 1, [
            ['number' , 'number', function(a, b){ return Math.pow(a, b); }]
          , [Vector, Vector, function(a, b){ return a['**'](b);}]
          , [Vector, 'number', function(a, b){ return a['**'](b);}]
        ])
        /**
         * vector constructor operator
         * Creates a vector from Cartesian coordinates
         * Consumes two numbers returns a Vector
         */
      , new Operator('Vector', false, 40, 0, 2, [
            ['number' , 'number', function(a, b){ return new Vector(a, b); }]
        ])
        /**
         * vector constructor operator
         * Creates a vector from polar coordinates => magnitude angle in radians
         * Consumes two numbers returns a Vector
         */
      , new Operator('Polar', false, 40, 0, 2, [
            ['number' , 'number', function(a, b){ return Vector.fromPolar(a, b); }]
        ])
        /**
         * Convert a number from degree to radians
         * This has higher precedence than "polar" because it makes writing:
         * "polar 100 deg 45" possible.
         */
      , new Operator('deg', false, 50, 0, 1, [
            ['number', function(a) {
                return a * Math.PI/180;
            }]
        ])
        /**
         * Print information about the input value to console.log
         * and return the value again.
         * This doesn't change the result of the calculation.
         */
      , new Operator('_print', false, Infinity, 0, 1, function(arg) {
            console.log('cps _print: "' +arg +'" typeof', typeof arg
                                                    , 'object: ', arg);
            return arg;
        })
        /**
         * Constructor for a scaling transformation matrix
         */
      , new Operator('Scaling', false, 0, 0, 2, [
          ['number', 'number', function(x, y) {
              return transform.Scale(x, y);
          }]
        ])
      , new Operator('Translation', false, 0, 0, 2, [
            ['number', 'number', function(x, y) {
                return transform.Offset(x, y);
            }]
        ])
      , new Operator('Skew', false, 0, 0, 2, [
            ['number', 'number', function(x, y) {
                return transform.Identity.skew(x, y);
            }]
        ])
      , new Operator('Rotation', false, 0, 0, 1, [
            ['number', function(angle) {
                return transform.Identity.rotate(angle);
            }]
        ])
      , new Operator('Transformation', false, 0, 0, 6, [
            ['number', 'number', 'number', 'number', 'number', 'number'
            , function(xx, xy, yx, yy, dx, dy) {
                return new Transformation(xx, xy, yx, yy, dx, dy);
            }]
        ])
        /**
         * Return the identity transformation
         */
      , new Operator('Identity', false, 0, 0, 0, function(){
                                            return transform.Identity;})
    );

    /**
     * FIXME: I'm not sure where to put this functionality. Also, note
     * that OperatorToken._convertTokenToValue does something similar.
     *
     * This method is passed from Parser to new Stack and then run in
     * Stack.execute, with the result of the stack execution.
     */
    engine.setFinalizeMethod(function(result, getAPI) {
        if(result instanceof NameToken)
            return getAPI(result.getValue());
        else if(result instanceof SelectorToken)
            return getAPI('this').multivers.query(result.getValue());
        else if(result instanceof StringToken || result instanceof NumberToken)
            return result.getValue();
        else if(result instanceof _Token)
            // maybe one day we allow stuff like operators as first class
            // values, but not now.
            throw new CPSFormulaError('It is not allowed for a stack to '
                + 'resolve into a _Token, but this Stack did: ' + result);
        return result;
    });
    engine.setBracketOperator('[', '__get__');
    engine.setNegateOperator('-', 'negate');
    return engine;
});
