define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";

    var CPSFormulaError = errors.CPSFormula;

    /**
     * An abstract item that is an element of a formula Stack.
     *
     * This is the base for formulae/parsing/OperatorToken and formulae/parsing/_ValueToken
     */
    function _Token(literal, preConsumes, postConsumes) {
        /*jshint validthis:true */
        this._literal = literal;
        this._setConsumption(preConsumes, postConsumes);
    }

    var _p = _Token.prototype;
    _p.constructor = _Token;
    _p.toString = function() {
        return ['<', this.constructor.name, ': ', this.literal, '>'].join('');
    };

    // Currently every _Token is expected to leave exactly one
    // value on the stack after execution, this will probably not
    // change soon
    Object.defineProperty(_p, '_ejects', {
        value: 1
      , writable: false
    });

    _p._setConsumption = function(preConsumes, postConsumes){
        if(typeof preConsumes !== 'number')
            throw new CPSFormulaError('preConsumes must be a number, but is "'
                                + preConsumes +'" typeof: '+ typeof preConsumes);
        this._preConsumes = preConsumes;
        if(typeof postConsumes !== 'number')
            throw new CPSFormulaError('postConsumes must be a number, but is "'
                                + postConsumes +'" typeof: '+ typeof postConsumes);
        this._postConsumes = postConsumes;
    };

    /**
     * Return a child object which has `this` as prototype. The child
     * overides the values for preConsumes, postConsumes.
     *
     * Because operator instances are reused in all parsed formula,
     * it is not possile to fix the consumption values of an operator
     * directly where it appers. This would change the values everywhere
     * where it appears. Instead, we uitilize prototypical inheritance
     * and set the fixed values for the child.
     *
     * We use this behavior when an operator consumes 'Infinity' items
     * from the stack. This is needed for a list (Array) constructor.
     * The actually consumed amount of items can be determined when
     * parsing. Then the operator gets replaced with a version that
     * consumes a fixed amount of items, created by this method.
     */
    _p.fixedConsumptionFactory = function(preConsumes, postConsumes) {
        var child = Object.create(this);
        child._setConsumption(preConsumes, postConsumes);
        return child;
    };

    Object.defineProperty(_p, 'literal', {
        get: function(){ return this._literal; }
    });
    Object.defineProperty(_p, 'preConsumes', {
        get: function(){ return this._preConsumes;}
    });
    Object.defineProperty(_p, 'postConsumes', {
        get: function(){ return this._postConsumes;}
    });

     Object.defineProperty(_p, 'consumes', {
        get: function() {
            if(this.preConsumes === Infinity || this.postConsumes === Infinity)
                throw new CPSFormulaError('This item '+ this + ' '
                    + 'pre- or post-consumes "Infinity" items from the '
                    + 'stack, it is impossible to calculate the exact amount'
                    + 'of items in this method. See this.fixedConsumptionFactory '
                    + 'and its usage in the parser, where an exact amount '
                    + 'of consumption can be calculated.'
                );
            return this.preConsumes + this.postConsumes;
        }
    });

    Object.defineProperty(_p, 'ejects', {
        get: function(){ return this._ejects; }
    });

    return _Token;
});
