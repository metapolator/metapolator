define([
    'metapolator/webAPI/document'
  , 'metapolator/rendering/glyphBasics'
  , 'ufojs/tools/pens/PointToSegmentPen'
  , 'ufojs/tools/pens/SVGPen'
  , 'ufojs/tools/pens/TransformPen'
  , 'ufojs/main'
    ], function(
    document
  , glyphBasics
  , PointToSegmentPen
  , SVGPen
  , TransformPen
  , main
) {
    "use strict";

    /*global clearTimeout: true*/
    /*global setTimeout: true*/
    /*global console:true*/

    var svgns = 'http://www.w3.org/2000/svg'
        , enhance = main.enhance
        ;

    function svgPenFactory(layer) {
        var pathElement = document.createElementNS(svgns, 'path')
          , svgPen = new SVGPen(pathElement, {})
          ;
        // make empty
        while (layer.firstChild)
            layer.removeChild(layer.firstChild);
        layer.appendChild(pathElement);

        return svgPen;
    }

    function getSVG(element) {
        var svg = element[0].getElementsByTagName('svg')[0];
        if(!svg) {
            svg = document.createElementNS(svgns, 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('viewBox', '0 0 1200 1200');
            element.append(svg);
        }
        return svg;
    }

    function getSVGLayer(svg, name) {
        // Use classnames, because ids are available from the host document
        // as well, and thus they could create unwanted situations.
        // Classes are also available from the host document, but they don't
        // need to be unique.
        // These classes should be unique within this svg document.
        var uniqueClass = 'layer-'+name
          , layer = svg.getElementsByClassName(uniqueClass)[0];
        if(!layer) {
            layer = document.createElementNS(svgns, 'g');
            layer.setAttribute('transform', 'matrix(1, 0, 0, -1, 0, 900)');
            layer.setAttribute('class', uniqueClass);
            svg.appendChild(layer);
        }
        return layer;
    }

    function iterateGenerator(gen) {
        var done = false;
        try {
            done = gen.next().done;
        }
        catch(error) {
            if(error.message === "Generator has already finished")
                done = true;
            else
                throw error;
        }
        // clear this from the list
        return done;
    }

    function RenderController(svg, model, momMaster) {
        this._jobs = [];
        this._timeoutId = undefined;
        this._svg = svg;
        this._momMaster = momMaster;
        this._model = model;
    }
    var _p = RenderController.prototype;

    _p.get = function(glyphName) {
        return this._momMaster.findGlyph(glyphName);
    };

    _p.addLayer = function(glyph, layername, renderer, renderComponents) {
        var layer = getSVGLayer(this._svg, layername)
        , componentPath = [glyph.particulars]
        , svgPen = svgPenFactory(layer)
        ;

        //
        // Monkey patch the addComponentHandler onto the svgPen.
        //
        if(renderComponents)
            svgPen.addComponent = this.addComponent.bind(this, renderer, componentPath, layer);
        else
            svgPen.addComponent = function(){};
        this._addJob(renderer, glyph, svgPen);
    };

    /**
     * When a component is discovered during the rendering of a glyph
     * this method is called. We have to lookup the referenced glyph
     * and perform a render of that glyph with the desired
     * tranformation. Note that this can be recursive, in that the
     * referred to glyph may itself have componenets which will need
     * to be rendered.
     */
    _p.addComponent = function(renderer, parentComponents, parentNode, glyphName, transform) {
        var glyph = this.get(glyphName)
          , layer = document.createElementNS(svgns, 'g')
          , svgPen = svgPenFactory(layer)
          , transformPen = new TransformPen(svgPen, transform)
          , circularKey, i=0, componentPath
          ;
        if(!glyph) {
            console.warn('Not found: glyph with name "'+ glyphName
                                                +'" for a component.');
            return;
        }
        // detect recursion here
        circularKey = glyph.particulars;
        for(;i<parentComponents.length;i++)
            if(parentComponents[i] === circularKey) {
                console.warn('Circular component reference detected in font at "'
                    + glyphName + '" in: ' + parentComponents.join('/'));
                return;
            }
        componentPath = parentComponents.slice();
        componentPath.push(glyph.particulars);

        layer.setAttribute('class', 'component');
        // Keep this here as a reminder: Alternatively to the usage
        // of TransformPen, we can also apply the transformation
        // directly on the container, using the svg transform attribute:
        // layer.setAttribute('transform', 'matrix('+transform.toString()+')');
        parentNode.appendChild(layer);

        //
        // Monkey patch the addComponentHandler onto the svgPen.
        //
        svgPen.addComponent = this.addComponent.bind(this, renderer, componentPath, layer);
        this._addJob(renderer, glyph, transformPen);
    };

    _p._addJob = function(renderer, glyph, segmentPen) {
        var pen = new PointToSegmentPen(segmentPen)
          , generator = glyphBasics.drawGlyphToPointPenGenerator(
                renderer,
                this._model,
                glyph,
                pen
            )
          ;
        this._jobs.push(generator);
    };

    _p.abort = function() {
        if(this._timeoutId)
            clearTimeout(this._timeoutId);
        this._jobs = [];
    };

    _p.run = function() {
        var layerCtrl = function () {
            // execute
            var done = this._jobs.map(iterateGenerator);
            // remove finished generators from back to front, so the
            // indexes in `done` stay valid
            for(var i=done.length-1;i>=0;i--) {
                if(!done[i]) continue;
                this._jobs.splice(i, 1);
            }
            if(this._jobs.length)
                this._timeoutId = setTimeout(layerCtrl, 0);
        }.bind(this);
        this._timeoutId = setTimeout(layerCtrl, 0);
    };

    /**
     *
     * @param glyph is a MOM glyph object
     */
    function render(scope, element, glyph, model) {
        var svg = getSVG(element)
          , renderer = scope.renderer
          ;
        if(!renderer)
            renderer = scope.renderer = new RenderController(svg, model, glyph.parent);

        renderer.abort();
        renderer.addLayer(glyph, 'outline', {
            penstroke: glyphBasics.renderPenstrokeOutline
          , contour: glyphBasics.renderContour
        }, true);
        renderer.addLayer(glyph, 'centerline', {
            penstroke: glyphBasics.renderPenstrokeCenterline
        }, false);
        renderer.run();
    }

    function redPillGlyphDirective(model) {
        function link(scope, element, attrs) {
            render(scope, element, scope.mtkGlyphElement, model);
            scope.$on('cpsUpdate', render.bind(null, scope, element, scope.mtkGlyphElement, model));
            element.on('$destroy', function() {
                var renderer = scope.renderer;
                if(renderer)
                    renderer.abort();
            });
        }
        return {
            restrict: 'E'
          , link: link
          , scope: { mtkGlyphElement: '=' }
        };
    }

    redPillGlyphDirective.$inject = ['ModelController'];
    return redPillGlyphDirective;
});
