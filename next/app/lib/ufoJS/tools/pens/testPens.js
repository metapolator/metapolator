/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * These pens are used within the unit tests. They store the last method
 * name and its arguments in an array at pen.commands so that we can assert
 * on the values of the call. Use pen.flush() to receive all previous
 * commands since the last pen.flush()
 */

define(
    [
        'ufojs'
      , 'ufojs/errors'
      , './AbstractPen'
      , './BasePen'
      , './BasePointToSegmentPen'
      , './AbstractPointPen'
    ],
    function(
        main
      , errors
      , AbstractPen
      , BasePen
      , BasePointToSegmentPen
      , AbstractPointPen
) {
    "use strict";
    var enhance = main.enhance;
    
    function _createStoreCommand(command) {
        this[command] = function(){
            this.commands.push([command].concat(Array.prototype.slice.call(arguments)))
        }
    }
    /**
     * return all commands since the last flush and reset this.commands
     */
    var _flush = function()
    {
        var commands = this.commands;
        this.commands = [];
        return commands;
    }
    function testPenMixin(proto, commands) {
        proto.flush = _flush;
        commands.forEach(_createStoreCommand, proto)
    }
    
    
    /*constructor*/
    function AbstractTestPen() {
        this.commands = [];
    };
    
    /*inheritance*/
    AbstractTestPen.prototype = Object.create(AbstractPen.prototype);
    
    /*definition*/
    testPenMixin(AbstractTestPen.prototype, ['moveTo', 'lineTo', 'curveTo',
                    'qCurveTo', 'closePath', 'endPath', 'addComponent'])
    
    
    /*constructor*/
    function BaseTestPen() {
        this.commands = [];
        BasePen.apply(this, arguments);
    };
    
    /*inheritance*/
    BaseTestPen.prototype = Object.create(BasePen.prototype);

    /*definition*/
    testPenMixin(BaseTestPen.prototype, ['_moveTo', '_lineTo',
                                '_curveToOne', '_closePath', '_endPath'])
    
    
    /*constructor*/
    function BasePointToSegmentTestPen() {
        this.commands = [];
        BasePointToSegmentPen.apply(this, arguments);
    };
    
    /*inheritance*/
    BasePointToSegmentTestPen.prototype = Object.create(BasePointToSegmentPen.prototype);

    /*definition*/
    testPenMixin(BasePointToSegmentTestPen.prototype, ['_flushContour'])
    
    
    /*constructor*/
    function AbstractPointTestPen() {
        this.commands = [];
    }
    
    /*inheritance*/
    AbstractPointTestPen.prototype = Object.create(AbstractPointPen.prototype)
    
    /*definition*/
    testPenMixin(AbstractPointTestPen.prototype, ['beginPath', 'endPath',
                                            'addPoint', 'addComponent'])
    
    
    return {
        AbstractTestPen: AbstractTestPen
      , BaseTestPen: BaseTestPen
      , BasePointToSegmentTestPen: BasePointToSegmentTestPen
      , AbstractPointTestPen: AbstractPointTestPen
    };
});
