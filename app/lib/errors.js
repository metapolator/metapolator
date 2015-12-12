define(function() {
    "use strict";
    //metapolator errors
    var errors = {};

    /**
     * save three lines of coding for each error with this factory
     *
     * and observe that extending Error is uncool
     */
    var makeError = function(name, Constructor, Parent, namespace)
    {
        if(Parent === undefined)
            Parent = Error;

        if(Constructor === undefined) {
            Constructor = function(message, stack) {
                if(message !== undefined) {
                    this.name = name + 'Error';
                    this.message = message || "(no error message)";
                }

                if(!stack && typeof Error.captureStackTrace === 'function')
                    Error.captureStackTrace(this, Constructor);
                else {
                    this.stack = stack || (new Error()).stack || '(no stack available)';
                }
            };
        }
        Constructor.prototype = Object.create(Parent.prototype);
        Constructor.prototype.constructor = Constructor;

        if(namespace === undefined)
            namespace = errors;
        namespace[name] = Constructor;
    };
    errors.makeError = makeError;
    /**
     * the definitions go here
     */
    makeError('Error');
    makeError('Unhandled');
    makeError('Assertion', undefined, errors.Error);
    makeError('CommandLine', undefined, errors.Error);
    makeError('Value', undefined, RangeError);
    makeError('MOM', undefined, errors.Error);
    makeError('NotImplemented', undefined, errors.Error);
    makeError('Deprecated', undefined, errors.Error);
    makeError('AbstractInterface', undefined, errors.Error);
    makeError('CPS', undefined, errors.Error);
    makeError('Key', undefined, errors.Error);
    makeError('CPSRegistryKey', undefined, errors.Key);
    makeError('CPSKey', undefined, errors.Error);
    makeError('CPSRecursion', undefined, errors.CPS);
    makeError('CPSRecursionKey', undefined, errors.CPSKey);
    makeError('CPSFormula', undefined, errors.CPS);
    // deprecated, CPSFormula superseeds this
    makeError('CPSAlgebra', undefined, errors.CPSFormula);
    makeError('Project', undefined, errors.CPS);
    makeError('PointPen', undefined, errors.CPS);
    makeError('CPSParser', undefined, errors.CPS);
    makeError('Import', undefined, errors.CPS);
    makeError('ImportPenstroke', undefined, errors.Import);
    makeError('ImportContour', undefined, errors.Import);
    makeError('Event', undefined, errors.Error);
    makeError('Emitter', undefined, errors.Event);
    makeError('Receiver', undefined, errors.Event);
    // UI = user interface
    makeError('UI', undefined, errors.Event);
    makeError('UIInput', undefined, errors.UI);
    // When the ui-setup was done wrong
    makeError('UISetup', undefined, errors.UI);

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
        if(typeof console !== 'undefined' && console.warn)
            console.warn('WARNING: ' + message);
    };

    /**
     * ES6/Promises have the fundamental flaw, that, if there is no
     * Error handler attached, an unhandled error stays unnoticed and
     * just disappears.
     * Because handling all Errors always correctly is not possible at
     * any given time e.g. a program may still be under construction for
     * example, this is a default handler to mark a promise as unhandled.
     *
     * Using this error-handler at the very end of the promise chain
     * ensures that the unhandled Proxy exception is not just disappearing
     * unnoticed by the main program.
     */
    function unhandledPromise(originalError) {
        var error = new errors.Unhandled(originalError+'\n'+originalError.stack);
        error.originalError = originalError;
        // use setTimout to escape the catch all that es6/Promise applies
        // and that silences unhandled errors
        setTimeout(function unhandledError(){throw error;}, 0);
    }
    errors.unhandledPromise = unhandledPromise;

    return errors;
});
