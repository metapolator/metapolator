/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 */

define(['./errors'], function(errors) {
    "use strict";
    var ValueError = errors.Value,
        TypeError = errors.Type;
   
    /**
     * enhance helps with class building
     * FIXME: put description in here
     */
    var enhance =  function(constructor, blueprint)
    {
        for(var i in blueprint)
        {
            //TODO:
            // use Object.getOwnPropertyDescriptor and Object.defineProperty
            // instead of __lookup(S/G)etter__ and __define(S/G)etter__
            // its the future
            var getter = blueprint.__lookupGetter__(i),
                setter = blueprint.__lookupSetter__(i);
            if ( getter || setter ) {
                if ( getter )
                    constructor.prototype.__defineGetter__(i, getter);
                if ( setter )
                    constructor.prototype.__defineSetter__(i, setter);
            } else
                constructor.prototype[i] = blueprint[i];
        };
    };
    
    /**
     * check whether val is a number and not NaN
     */
    function isNumber(n) {
        return typeof n === 'number' && isFinite(n);
    };
    
    /**
     * check whether val is an integer
     */
    function isInt (n) {
        // n === n NaN will return false
        // n|0 rounds
        return typeof n === 'number' && n === n && n === (n|0);
    }
    
    /**
     * check whether val is a float
     */
    function isFloat (n) {
        // n === n NaN will return false
        // n|0 rounds
        return typeof n === 'number' && isFinite(n) && n !== (n|0);
    }
    
    /**
     * check whether the string is made out of digits only
     */
    var _isDigitsTest = /^[0-9]+$/;
    function isDigits(str){
        if( typeof str != 'string') return false;
        return _isDigitsTest.test(str);
    }
    /**
     * check whether the string is formatted like a propper int
     */
    var _isIntStringTest = /^[+-]?[0-9]+$/;
    function isIntString(str){
        if( typeof str != 'string') return false;
        return _isIntStringTest.test(str);
    }
    
    /**
     * check whether the string is formatted like a propper float
     */
    var _isFloatStringTest = /^([+-]?(((\d+(\.)?)|(\d*\.\d+))([eE][+-]?\d+)?))$/;
    function isFloatString(str) {
        if( typeof str != 'string') return false;
        return _isFloatStringTest.test(str);
    }
    
    
   /**
    * this is used like the python range method
    * 
    * examples:
    * for(var i in range(10)){
    *     console.log(i)
    *     //0 1 2 3 4 5 6 7 8 9
    * }
    * for(var i in range(10)){
    *     console.log(i)
    *     //0 1 2 3 4 5 6 7 8 9
    * }
    * for(var i in range(5, 15, 3)) {
    *     console.log(i)
    *     //5 8 11 14
    * }
    **/
    var range = function (/*[start], stop, [step]*/)
    {
        //here comes alot of input validation
        //to mimic what python does
        var start = 0,
            step = 1,
            stop, condition;
        if (arguments.length < 1) {
            throw new TypeError(
                'range() expected at least 1 arguments, got 0 '
                + arguments.length
            );
        } else if (arguments.length > 3) {
            throw new TypeError(
                'range() expected at most 3 arguments, got '
                + arguments.length
            );
        } else if (arguments.length == 1) {
            stop = arguments[0];
        } else if(arguments.length >= 2 ) {
            start = arguments[0];
            stop = arguments[1];
            if(arguments.length == 3)
                step = arguments[2];
        }
        var vals = [ ['start', start], ['stop', stop], ['step', step] ];
        for (var i in vals) {
            var val = vals[i];
            if (!isInt(val[1])) {
                var type = typeof val[1];
                if(type === 'number') type = 'float';
                throw new TypeError(
                    'range() integer ' + val[0]
                    + ' argument expected, got ' + type);
            }
        }
        if(step === 0)
            throw new ValueError('range() step argument must not be zero');
            
        //now the important stuff
        if (step > 0)
            condition = function(i) { return i < stop };
        else
            condition = function(i) { return i > stop };
        
        var list = {};//list is an object because the array prototype might be extended
        for (var i = start; condition(i); i += step) {
            //yield i;//oh future looking forward to hearing from you
            list[i] = i;
        }
        return list;
    }
    /**
     * Rounds val. If factor is specified then
     * new-val = Math.round(factor*old-val)/factor.
     * Fontforge defines a similar method.
     * Its good to compare values that potentially have some floating
     * point rounding errors
     * 
     * FIXME: I believe that a decimal factor (10, 100, 1000) is enough
     * so it might be faster to use something like this, just specifying
     * the precision instead of a factor.
     * 
     * -(-val).toPrecision(digits);
     * 
     * > -(-5.0123456789).toFixed(5);
     * > 5.01235
     */
    var round = function(val, factor)
    {
        if(!factor)
            return Math.round(val);
        return Math.round( factor * val ) / factor;
    }
    
    /**
     * returns a function that rounds to a precision of factor recursively
     * all items of type number in all items that are instances of array
     * and returns the result
     */
    var roundRecursiveFunc = function(factor){
        // the function existing in this closure is important, so the
        // function can call itself. just saying that we can't return the
        // function directly
        var roundRecursive = function(item) {
            if(item instanceof Array)
                return item.map(roundRecursive);
            if(typeof item === 'number')
                return round(item, factor);
            return item;
        };
        return roundRecursive;
    }
    
    /**
     * rounds to a precision of factor recursively all items of type
     * number in all items that are instances of array and returns the
     * result
     */
    var roundRecursive = function(item, factor) {
        var roundRecursive = roundRecursiveFunc(factor);
        return roundRecursive(item);
    };
    
    
    /**
    * parseDate came with the following header. I just tailored it in here.
    * it returns a timestamp indicating the milliseconds since the Unix Epoch
    * 
    * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
    * © 2011 Colin Snover <http://zetafleet.com>
    * Released under MIT license.
    */
    var origParse = Date.parse, numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ],
        parseDate = function (date) {
        var timestamp, struct, minutesOffset = 0;
        // ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
        // before falling back to any implementation-specific date parsing, so that’s what we do, even if native
        // implementations could be faster
        // 1 YYYY 2 MM 3 DD 4 HH 5 mm 6 ss 7 msec 8 Z 9 ± 10 tzHH 11 tzmm
        if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
            // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
            for (var i = 0, k; (k = numericKeys[i]); ++i) {
                struct[k] = +struct[k] || 0;
            }
            
            // allow undefined days and months
            struct[2] = (+struct[2] || 1) - 1;
            struct[3] = +struct[3] || 1;

            if (struct[8] !== 'Z' && struct[9] !== undefined) {
                minutesOffset = struct[10] * 60 + struct[11];

                if (struct[9] === '+') {
                    minutesOffset = 0 - minutesOffset;
                }
            }

            timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
        } else {
            timestamp = origParse ? origParse(date) : NaN;
        }

        return timestamp;
    };
    
    /**
     * This is a wrapper around typof and instanceof
     * it's there to make me type less and loosely inspired by the python
     * builtin instanceof.
     */
    var isInstance = function(
        value,
        types /* function or typeof string or a list of these */
    ) {
        if(arguments.length < 2)
            throw new TypeError(
                'isInstance() expects 2 arguments, got ' + arguments.length
            );
        var types = (types instanceof Array) ? types : [types],
            typeOfType, i;
        for(i = 0; i < types.length; i++) {
            typeOfType = typeof types[i];
            if( typeOfType === 'function' && value instanceof types[i]
                || types[i] === 'int' && isInt(value)
                || types[i] === 'float' && isFloat(value)
                || types[i] === 'NaN' && isNaN(value)
                || types[i] === 'Infinity' && value === Number.POSITIVE_INFINITY
                || types[i] === '-Infinity' && value === Number.NEGATIVE_INFINITY
                || typeOfType === 'string'
                    && typeof value === types[i]
                    && value === value /*not true for NaN*/
            )
                return true;
        }
        return false;
    };
    
    
    /**
     * String.prototype.charCodeAt is broken , so mdn provides fixes.
     * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/charCodeAt
     * 
     * Example 2: Fixing charCodeAt to handle non-Basic-Multilingual-Plane
     * characters if their presence earlier in the string is unknown
     * 
     * this version might be used in for loops and the like when it is
     * unknown whether non-BMP characters exist before the specified index
     * position.
     */
    function fixedCharCodeAt (str, idx) {
        // ex. fixedCharCodeAt ('\uD800\uDC00', 0); // 65536
        // ex. fixedCharCodeAt ('\uD800\uDC00', 1); // 65536
        idx = idx || 0;
        var code = str.charCodeAt(idx);
        var hi, low;
        if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
            hi = code;
            low = str.charCodeAt(idx+1);
            if (isNaN(low)) {
                throw 'High surrogate not followed by low surrogate in fixedCharCodeAt()';
            }
            return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
        }
        if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
            // We return false to allow loops to skip this iteration since should have already handled high surrogate above in the previous iteration
            return false;
            /*hi = str.charCodeAt(idx-1);
            low = code;
            return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;*/
        }
        return code;
    }
    
    // make out of a list of strings an object with those strings as keys
    // for easy membership testing with the "in" keyword
    function setLike(list, fill /* default true*/) {
        if(fill === undefined) fill = true;
        var setLike = {};
        for(var i=0; i<list.length; i++)
            setLike[list[i]] = true;
        return setLike;
    }
    
    
    return {
        enhance: enhance,
        range: range,
        round: round,
        roundRecursiveFunc: roundRecursiveFunc,
        roundRecursive: roundRecursive,
        isNumber: isNumber,
        isInt: isInt,
        isFloat: isFloat,
        isDigits: isDigits,
        isIntString: isIntString,
        isFloatString: isFloatString,
        parseDate: parseDate,
        isInstance: isInstance,
        fixedCharCodeAt: fixedCharCodeAt,
        setLike: setLike
    }
});
