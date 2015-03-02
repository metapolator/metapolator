define([
    './_Node'
  , './Master'
], function(
    Parent
  , Master
) {
    "use strict";
    /**
     * This Element is the container of all masters of a metapolator superfamily.
     * It only contains children of type MOM Master
     */
    function Univers() {
        Parent.call(this);
    }
    var _p = Univers.prototype = Object.create(Parent.prototype);
    _p.constructor = Univers;

    Object.defineProperty(_p, 'MOMType', {
        value: 'MOM Univers'
    });

    Object.defineProperty(_p, 'type', {
        /* this is used for CPS selectors*/
        value: 'univers'
    });

    _p._acceptedChildren = [Master];

    return Univers;
});
