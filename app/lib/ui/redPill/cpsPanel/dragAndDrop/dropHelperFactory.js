define([
    'angular'
    ], function(
    angular
) {
    "use strict";


    // This was not touched, but it is very application specific
    // note the angularJS usage and the expectation of `index` at the isolateScope!
    // MAYBE we could set index to a neutral place, like "data-index" attribute?
    // right now every directives scope has `index`, so, that may be OK so far
    function getTargetIndex(event, target) {
        var targetIndex = angular.element(target).isolateScope().index
          , insertBefore = true
          , elementBBox = target.getBoundingClientRect()
          , elementHeight = elementBBox.bottom - elementBBox.top
          , tippingPointY =  elementBBox.top + elementHeight / 2
          ;

        if (event.clientY > tippingPointY)
            insertBefore = false;
        return [targetIndex, insertBefore];
    }

    function getTargetData(findElement, element, event) {
        var target = findElement(event.target, element) || null
          , targetIndexData
          , index = null
          , insertPosition = null
          ;
        if(target) {
            targetIndexData = getTargetIndex(event, target);
            index = targetIndexData[0];
            insertPosition = targetIndexData[1] ? 'before' : 'after';
        }
        return {
            index: index
          , insertPosition: insertPosition
          , element: target
        };
    }

    function dropHelperFactory(dragDataService, dragIndicatorService) {
        function DropHelper(
            findElement // fn (element, parentLimit)
          , getIndicatorReference // fn (boolean:empty, element, parentLimit)
          , dataTypes // array, e.g. ['cps/property', 'cps/comment']
          , indicatorId // dragIndicatorService id
          , controller // provides: property bool empty, fn acceptMoveCPSElement and fn moveCPSElement
          , element // DOM-Element
          , container // DOM-Element
        ) {
            this._findElement = findElement;
            this._getIndicatorReference = getIndicatorReference;
            this._dataTypes = dataTypes;
            this._indicatorId = indicatorId;
            this._controller = controller;
            this._element = element;
            this._container = container;
        }

        var _p = DropHelper.prototype;

        Object.defineProperty(_p, 'dragoverHandler', {
            get: function(){ return this.dragover.bind(this); }
        });

        Object.defineProperty(_p, 'dropHandler', {
            get: function(){ return this.drop.bind(this);}
        });

        _p.dragover = function(event) {
            var findElement = this._findElement
              , getIndicatorReference = this._getIndicatorReference
              , dataTypes = this._dataTypes
              , indicatorId = this._indicatorId
              , controller = this._controller
              , element = this._element
              , container = this._container
              , dataEntry
              , data
              , target
              , indicatorReference
              , indicatorInsertPosition
              , i, l
              ;

            if(event.defaultPrevented)
                // someone below already accepted the drag
                return;

            dataEntry = dragDataService.getFirst(dataTypes);

            if(!dataEntry) {
                dragIndicatorService.hideIndicator(indicatorId);
                return;
            }

            // figure out where to drop and move an indicator to there
            data = dataEntry.payload;

            if(!controller.empty)
                target = getTargetData(findElement, element, event);
            else
                target = {
                    index: 0
                  , insertPosition: 'before'
                  , element: container
                };



            if(!target.insertPosition
                    || !controller.acceptMoveCPSElement(data[0], data[1], target.index, target.insertPosition)) {

                if(controller.isIdentityMoveCPSElement(data[0], data[1], target.index, target.insertPosition))
                    // accept this so parent is not asked
                    event.preventDefault();

                // hide the indicator if this is an identity-dragover...
                dragIndicatorService.hideIndicator(indicatorId);
                return;
            }

            // place the indicator:
            indicatorReference = target.element;

            indicatorReference = getIndicatorReference(controller.empty, target.element, container);
            indicatorInsertPosition = controller.empty
                ? 'append'
                : target.insertPosition
                ;
            // indicatorInsertPosition is "before" or "after" or "append"
            dragIndicatorService.insertIndicator(indicatorId, indicatorReference, indicatorInsertPosition);

            // accepted
            event.preventDefault();//important
            event.dataTransfer.dropEffect = 'move';
        };

        _p.drop = function(event) {
            var findElement = this._findElement
              , dataTypes = this._dataTypes
              , controller = this._controller
              , element = this._element
              , dataEntry
              , data
              , sourcePropertyDict
              , sourceIndex
              , target
              ;

            if(event.defaultPrevented)
                // someone below already accepted the drop
                return;

            dataEntry = dragDataService.getFirst(dataTypes)

            if(!dataEntry)
                return;

            data = dataEntry.payload;

            if(!controller.empty)
                target = getTargetData(findElement, element, event);
            else
                target = {
                    index: 0
                  , insertPosition: 'before'
                };

            if(!target.insertPosition
                    || !controller.acceptMoveCPSElement(data[0], data[1], target.index, target.insertPosition)) {

                if(controller.isIdentityMoveCPSElement(data[0], data[1], target.index, target.insertPosition))
                    // accept if this is an identity-drop but do nothing
                    event.preventDefault();

                return;
            }

            event.preventDefault();
            sourcePropertyDict = data[0];
            sourceIndex = data[1];

            // If the drag item is removed from the DOM by this drop
            // (it is for moves), we don't get a dragend event. So
            // this needs to clean up as well.
            // Making the execution of the move async would also help.
            dragDataService.remove(dataEntry.type);

            controller.moveCPSElement(sourcePropertyDict, sourceIndex, target.index, target.insertPosition);
        };

        return DropHelper;
    }

    dropHelperFactory.$inject = ['dragDataService', 'dragIndicatorService'];
    return dropHelperFactory;
});
