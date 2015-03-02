define([
    'metapolator/errors'
  , './_Node'
  , './Combinator'
], function(
    errors
  , Parent
  , Combinator
) {
    "use strict";

    var CPSError = errors.CPS;
    /**
     * A ComplexSelector is a chain of one or more compound selectors
     * separated by combinators.
     *
     * TODO: we will need to extract the meaning of the elements
     *
     * so far, we extract:
     *
     * simple selectors:
     *          universal, type, id, class, id, pseudo-class pseudo-element
     *
     *
     * A selector may be invalid, which would mark its selectorList invalid
     * (and thus all selectors in that list)
     *
     *  reasons for invalid selectors:
     *      it's empty
     *      a child of it is invalid
     *      it has two consecutive combinators
     *          only possible for > at the moment
     *          invalid: master>>penstroke
     *          valid: master>*>penstroke
     *
     * a compound selector is invalid if
     *      - it has more than one of universal or type selector
     *      - a universal or type selector occurs not as first
     */
    function ComplexSelector(value, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._value = value;
        this._specificity = null;

        var i, l, item, invalid = false, message;
        if(!this._value.length) {
            invalid = true;
            message =  'A selector must not be empty';
        }
        else if(this._value[this._value.length-1] instanceof Combinator) {
                invalid = true;
                message ='The last item of a selector must not '
                                +'be a combinator, found: '
                                + this._value[this._value.length-1].value;
        } else for(i=0,l=this._value.length;i<l;i++) {
            item = value[i];
            if(item instanceof Combinator) {
                if(i === 0) {
                    invalid = true;
                    message = 'The first item in a selector must '
                                                +'not be a combinator';
                }
                else if(!(item.type in this._combinators)) {
                    invalid = true;
                    message = 'The combinator type "'+ item.type
                                                    +'" is alien to us';
                }
                // if this is a combinator and the last item in values
                // is a combinator, too, this is inavlid
                else if(this._value[this._value.length-1] instanceof Combinator) {
                    invalid = true;
                    message = ['Two subsequent combinators in a'
                                    , 'selector are not valid. Found:'
                                    , this._value[this._value.length-1].value
                                    , 'followed by:' + item.value
                                    ].join(' ');
                }
            }
            else if(item.invalid) {
               invalid = true;
               message = item.message;
            }

            if (invalid) break;
        }

        Object.defineProperties(this, {
            'selects': {
                value: !invalid
              , enumerable: true
            }
          , 'invalid': {
                value: invalid
              , enumerable: true
            }
          , 'message': {
                value: message
              , enumerable: true
            }
        });
    }

    ComplexSelector.add = function(a, b) {
        var value = a.value;
        value.push(new Combinator(' ', a.source, a.lineNo));
        Array.prototype.push.apply(value, b._value);
        return new ComplexSelector(value, a.source, a.lineNo);
    };

    var _p = ComplexSelector.prototype = Object.create(Parent.prototype);
    _p.constructor = ComplexSelector;

    _p.toString = function() {
        return this._value.join('');
    };

    _p._combinators = {
        // the child combinator
        'child' : true
      , 'descendant': true
    };

    Object.defineProperty(_p, 'value', {
        get: function() {
            // if _value is truthy return a copy of the _value array
            // if value is falsy, return its falsy value (probably undefiend)
            return this._value && this._value.slice();}
    });

    Object.defineProperty(_p, 'specificity', {
        get: function() {
            var a, b, c, i=0, specificity;
            a = b = c = 0;
            if(!this._specificity) {
                for(;i<this._value.length;i++) {
                    if(this._value[i] instanceof Combinator)
                        continue;
                    specificity = this._value[i].specificity;
                    a += specificity[0];
                    b += specificity[1];
                    c += specificity[2];
                }
                this._specificity = [a, b, c];
            }
            return this._specificity;
        }
    });

    _p.add = function(complexSelector) {
        return this.constructor.add(this, complexSelector);
    };

    return ComplexSelector;
});
