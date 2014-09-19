define(function() {
    "use strict";
    //metapolator errors
    var errors = {}

    /**
     * save three lines of coding for each error with this factory
     *
     * and observe that extending Error is uncool
     */
    var makeError = function(name, Constructor, prototype, namespace)
    {
        if(prototype === undefined)
            var prototype = new Error;

        if(Constructor === undefined) {
            var Constructor = function(message, stack) {
                if(message !== undefined) {
                    this.name = name + 'Error';
                    this.message = message || "(no error message)";
                }

                if(!stack && typeof Error.captureStackTrace === 'function')
                    Error.captureStackTrace(this, Constructor);
                else {
                    stack = stack || (new Error).stack || '(no stack available)'
                    this.stack = [this.name+': ', this.message, '\n'
                                                    , stack].join('');
                }
            };
        };
        Constructor.prototype = prototype;
        Constructor.prototype.constructor = Constructor;
        if(namespace === undefined)
            namespace = errors;
        namespace[name] = Constructor;
    }
    errors.makeError = makeError;
    /**
     * the definitions go here
     */
    makeError('Error');
    makeError('Assertion', undefined , new errors.Error);
    makeError('CommandLine', undefined , new errors.Error);
    makeError('Value', undefined , new RangeError);
    makeError('MOM', undefined , new errors.Error);
    makeError('NotImplemented', undefined , new errors.Error);
    makeError('Deprecated', undefined , new errors.Error);
    makeError('CPS', undefined , new errors.Error);
    makeError('Key', undefined , new errors.Error);
    makeError('CPSRegistryKey', undefined , new errors.Key);
    makeError('CPSKeyNotFound', undefined , new errors.Key);
    makeError('CPSRecursion', undefined , new errors.CPS);
    makeError('CPSFormula', undefined , new errors.CPS);
    // deprecated, CPSFormula superseeds this
    makeError('CPSAlgebra', undefined , new errors.CPSFormula);
    makeError('Project', undefined , new errors.CPS);
    makeError('PointPen', undefined , new errors.CPS);
    makeError('CPSParser', undefined , new errors.CPS);

    /**
     * if expression is false, throw an Assertion
     * pass a message to explain yourself
     **/
    errors.assert = function(exp, message) {
        if (!exp) {
            throw new errors.Assertion(message);
        }
    };
    errors.warn = function(message) {
        if(typeof console !== 'undefined' && console.log)
            console.log('WARNING: ' + message);
    };

    return errors;
});
