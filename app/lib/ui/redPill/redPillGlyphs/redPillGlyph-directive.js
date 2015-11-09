define([], function() {
    "use strict";

    function redPillGlyphDirective(glyphUIService) {
        function link(scope, element, attrs, controller) {
            var glyph = scope.mtkGlyphElement
              , glyphInterface
              , domElement = element[0]
              ;
            function changeHandler(_ownData, _channel, viewBox) {
                // Set the newly calculated width to element
                // This should be done automatically by the browser, but
                // the viewBox change is ignored by Firefox and Chromium
                // and not propagated to the parent elements.
                // FIXME: This is a pesky workaround. In fact anything that triggers
                // element recalculating its width would work here, setting
                // an explicit height is a bit too much; see also An issue raised by
                // this behavior:
                // https://github.com/metapolator/metapolator/issues/416#issuecomment-95145551
                // The width should automatically adapt when element changes
                // its height, but it does not when width is set via css
                // of course.

                // Used to be: svg.getBoundingClientRect().width + 'px' but it seems
                // that calculating this by hand is more reliable, Firefox
                // had problems to return reliably an updated width for changes of
                // the 'space' characters (i.e. without any contour content)
                var calculatedWidth = viewBox[2]/viewBox[3] * domElement.clientHeight;
                domElement.style.width = calculatedWidth + 'px';
            }

            function selectMomHandler(_ownData, _channel, momNode) {
                scope.$emit('echo-request', {name: 'drilldown-mom', data: momNode});
            }
            //
            glyphInterface = glyphUIService.get(glyph, {showControls: scope.mtkGlyphControlsVisible});
            glyphInterface.on('viewBox-change', changeHandler);
            glyphInterface.on('select-mom', selectMomHandler);

            scope.$on('show-glyph-controls', function(event, show){
                if(show)
                    glyphInterface.showControls();
                else
                    glyphInterface.hideControls();
            });

            element.append(glyphInterface.element);

            element.on('$destroy', function() {
                glyphInterface.destroy();
            });
        }
        return {
            restrict: 'E'
          , link: link
          , scope: { mtkGlyphElement: '=', mtkGlyphControlsVisible: '='}
        };
    }

    redPillGlyphDirective.$inject = ['glyphUIService'];
    return redPillGlyphDirective;
});
