var Instance = function (config) {
    var createCanvas = function(el, x, y) {
        if (!x) {

            x = 100, y = 100;
        }
        var canvas = $('<canvas></canvas>').attr({width:x, height:y});
        $(el).attr({width:x, height:y}).append(
            $('<div class="wrapper"></div>').append(canvas))

        return canvas[0].getContext('2d');
    }
    if (config.lib === 'opentype') {
        var instance = $.extend({
            counter: 0,
            fonts: new Array(config.fontslist.length),
            interpolationValueAB: 0.2,
            interpolationValueAC: 0.2,
            interpolationValueAD: 0.2,

            add: function(index, font) {
                this.fonts[index] = font;
                this.counter++;
            },

            forEachGlyph: function (text, x, y, fontSize, options, callback) {
                var kerning, fontScale, glyphs, i, glyph, kerningValue;
                if (!this.fonts[0].supported) {
                    return;
                }
                x = x !== undefined ? x : 0;
                y = y !== undefined ? y : 0;
                fontSize = fontSize !== undefined ? fontSize : 72;
                options = options || {};
                kerning = options.kerning === undefined ? true : options.kerning;
                fontScale = 1 / this.fonts[0].unitsPerEm * fontSize;
                glyphs = this.fonts[0].stringToGlyphs(text);
                for (i = 0; i < glyphs.length; i += 1) {
                    glyph = glyphs[i];
                    value = callback(glyph, x, y, fontSize, options);
                    if (glyph.advanceWidth) {
                        x += value;
                    }
                    if (kerning && i < glyphs.length - 1) {
                        kerningValue = this.fonts[0].getKerningValue(glyph, glyphs[i + 1]);
                        x += kerningValue * fontScale;
                    }
                }
            },

            metrics: function(text) {
                var lines = [''];
                var i = 0, j = 0;
                var font = this.fonts[0];
                var $fonts = this.fonts;
                var $this = this;

                var $canvasWidth = parseInt($(this.canvas).find('canvas').attr('width'));
                this.forEachGlyph(text, 0, this.lineHeight, this.fontSize, {}, function (glyph, x, y, fontSize) {
                    var glyphB = $fonts[1].charToGlyph(text[j]);
                    var glyphC = $fonts[2].charToGlyph(text[j]);

                    var width = (glyph.advanceWidth *(1 / $fonts[0].unitsPerEm * fontSize));
                    var widthB = (glyphB.advanceWidth * (1/ $fonts[1].unitsPerEm * fontSize));
                    var widthC = (glyphC.advanceWidth * (1 / $fonts[2].unitsPerEm * fontSize));

                    var value = Math.max(width, widthB, widthC);
                    if ((x + value) >= $canvasWidth * lines.length) {
                        i = i + 1, lines[i] = '';
                    }
                    lines[i] = lines[i] + text[j];
                    j++;
                    return value;
                });
                return lines;
            },

            interpolatePara: function() {
                $(this.canvas).html('');
                var ctx = createCanvas(this.canvas, this.width, this.height);

                var lines = this.metrics(this.text);
                for (var k = 0; k < lines.length; k++) {
                    var pathA = this.getPath(this.fonts[0], lines[k], this.lineHeight + (k * this.lineHeight)),
                        pathB = this.getPath(this.fonts[1], lines[k], this.lineHeight + (k * this.lineHeight)),
                        pathC = this.getPath(this.fonts[2], lines[k], this.lineHeight + (k * this.lineHeight));

                    if (this.fonts.length > 3){
                        var pathD = this.getPath(this.fonts[3], lines[k], this.lineHeight + (k * this.lineHeight));
                    } else {
                        pathD = pathA;
                    }

                    for (var i = 0; i < pathA.commands.length; i++) {
                        var B_command = pathB.commands[i] || pathA.commands[i];
                        var C_command = pathC.commands[i] || pathA.commands[i];
                        var D_command = pathD.commands[i] || pathA.commands[i];
                        if (pathA.commands[i].x) {

                            pathA.commands[i].x = this.interpolateExtValue(
                                pathA.commands[i].x, B_command.x, C_command.x, D_command.x);
                        }
                        if (pathA.commands[i].x1) {
                            pathA.commands[i].x1 = this.interpolateExtValue(
                                pathA.commands[i].x1, B_command.x1, C_command.x1, D_command.x1);
                        }
                        if (pathA.commands[i].y1) {
                            pathA.commands[i].y1 = this.interpolateExtValue(
                                pathA.commands[i].y1, B_command.y1, C_command.y1, D_command.y1);
                        }
                        if (pathA.commands[i].x2) {
                            pathA.commands[i].x2 = this.interpolateExtValue(
                                pathA.commands[i].x2, B_command.x2, C_command.x2, D_command.x2);
                        }
                        if (pathA.commands[i].y2) {
                            pathA.commands[i].y2 = this.interpolateExtValue(
                                pathA.commands[i].y2, B_command.y2, C_command.y2, D_command.y2);
                        }
                        if (pathA.commands[i].y) {
                            pathA.commands[i].y = this.interpolateExtValue(
                                pathA.commands[i].y, B_command.y, C_command.y, D_command.y);
                        }
                    }
                    pathA.draw(ctx);
                }
            },

            interpolate: function() {
                if (this.linebreaks) {
                    this.interpolatePara();
                    return;
                }
                $(this.canvas).html('');

                var pathA = this.getPath(this.fonts[0]),
                    pathB = this.getPath(this.fonts[1]),
                    pathC = this.getPath(this.fonts[2]);//,
                // pathD = this.getPath(this.fonts[3]);
                var maxX = 0,
                    maxY = 0;

                for (var i = 0; i < pathA.commands.length; i++) {
                    var B_command = pathB.commands[i] || pathA.commands[i];
                    var C_command = pathC.commands[i] || pathA.commands[i];
                    var D_command = pathA.commands[i];// pathD.commands[i] || pathA.commands[i];
                    if (pathA.commands[i].x) {

                        pathA.commands[i].x = this.interpolateExtValue(
                            pathA.commands[i].x, B_command.x, C_command.x, D_command.x);
                    }
                    if (pathA.commands[i].x1) {
                        pathA.commands[i].x1 = this.interpolateExtValue(
                            pathA.commands[i].x1, B_command.x1, C_command.x1, D_command.x1);
                    }
                    if (pathA.commands[i].y1) {
                        maxY = Math.max(maxY, pathA.commands[i].y1);
                        pathA.commands[i].y1 = this.interpolateExtValue(
                            pathA.commands[i].y1, B_command.y1, C_command.y1, D_command.y1);
                    }
                    if (pathA.commands[i].x2) {
                        maxX = Math.max(maxX, pathA.commands[i].x);
                        pathA.commands[i].x2 = this.interpolateExtValue(
                            pathA.commands[i].x2, B_command.x2, C_command.x2, D_command.x2);
                    }
                    if (pathA.commands[i].y2) {
                        pathA.commands[i].y2 = this.interpolateExtValue(
                            pathA.commands[i].y2, B_command.y2, C_command.y2, D_command.y2);
                    }
                    if (pathA.commands[i].y) {
                        pathA.commands[i].y = this.interpolateExtValue(
                            pathA.commands[i].y, B_command.y, C_command.y, D_command.y);
                    }
                }
                ctx = createCanvas(this.canvas, maxX+40, maxY+20);
                pathA.draw(ctx);
            },

            interpolateValue: function(A, B) {
                return A + this.interpolationValueAB * ( B - A );
            },

            interpolateExtValue: function(A, B, C, D) {
                return (A + this.interpolationValueAB * ( B - A ) ) + this.interpolationValueAC * ( C - A ) + this.interpolationValueAD * ( D - A );
            },

            getPath: function(font, word, y_offset) {
                if (typeof word == 'undefined') {
                    word = this.text;
                }
                if (typeof y_offset !== 'undefined') {
                    return font.getPath(word, 0, y_offset, this.fontSize);
                }
                return font.getPath(word, 0, this.lineHeight, this.fontSize);
            },

            loaded: function() {
                return this.counter >= this.fonts.length;
            }
        }, config);

        function onload(index, err, font) {
            if (err) {
                this.failed = true
            } else {
                this.add(index, font);
                if (this.loaded() && !this.failed)
                    this.interpolate();
            }
        }

        for (var i = 0; i < config.fontslist.length; i++) {
            opentype.load(config.fontslist[i], onload.bind(instance, i));
        }
    } else if (config.lib === 'paperjs') {
        var instance = $.extend({
            interpolationValueAB: 1,
            interpolationValueAC: 0.2,
            interpolationValueAD: 0.2,
            interpolateValue : function(A, B) {
                return A + this.interpolationValueAB * ( B - A );
            },
            interpolate : function() {
                $(this.canvas).html('');
                var context = createCanvas(instance.canvas, 260, 260);
                paper.setup(context.canvas);
                var tmp_points = [];
                var glyph_size = 5.19;

                for (var j = 0; j < this.glyphJSON[0].points.length; j++) {
                    var path = new paper.Path();
                    path.strokeColor = 'black';
                    path.fillColor = 'black';
                    path.closed = true;
                    var contour = this.glyphJSON[0].points[j];
                    var interpolationContour = this.glyphJSON[1].points[j];
                    for (var i = 0; i < contour.length; i++){
                        var point = contour[i];

                        /* From this point starts mathematical code for interpolation.
                        Done maximally straight. Sorry for wall of code */

                        if (point.type) {
                            var handleIn, handleOut,
                                handleInX, handleOutX,
                                handleInY, handleOutY;
                            if (i == 0) {
                                handleInX = contour[contour.length - 1].x - point.x;
                                handleInY = point.y - contour[contour.length - 1].y;
                                var interpolationBx = interpolationContour[interpolationContour.length - 1].x - interpolationContour[i].x;
                                var interpolationBy = interpolationContour[i].y - interpolationContour[interpolationContour.length - 1].y;
                                handleInX = this.interpolateValue(handleInX, interpolationBx);
                                handleInY = this.interpolateValue(handleInY, interpolationBy);
                            } else {
                                handleInX = contour[i - 1].x - point.x;
                                handleInY = point.y - contour[i - 1].y;
                                var interpolationBx = interpolationContour[i - 1].x - interpolationContour[i].x;
                                var interpolationBy = interpolationContour[i].y - interpolationContour[i - 1].y;
                                handleInX = this.interpolateValue(handleInX, interpolationBx);
                                handleInY = this.interpolateValue(handleInY, interpolationBy);
                            }

                            handleOutX = contour[i + 1].x - point.x;
                            handleOutY = point.y - contour[i + 1].y;
                            var interpolationBx = interpolationContour[i + 1].x - interpolationContour[i].x;
                            var interpolationBy = interpolationContour[i].y - interpolationContour[i + 1].y;
                            handleOutX = this.interpolateValue(handleOutX, interpolationBx);
                            handleOutY = this.interpolateValue(handleOutY, interpolationBy);

                            handleIn = new paper.Point(handleInX/glyph_size, handleInY/glyph_size);
                            handleOut = new paper.Point(handleOutX/glyph_size, handleOutY/glyph_size);

                            var interpolationPoint = interpolationContour[i];
                            var interX = (point.x + this.interpolationValueAB * (interpolationPoint.x - point.x));
                            var interY = (point.y + this.interpolationValueAB * (interpolationPoint.y - point.y));
                            currentPoint = new paper.Point(interX/glyph_size, 240-interY/glyph_size);
                            path.add(new paper.Segment(currentPoint, handleIn, handleOut));
                        }
                }
            }
            paper.view.draw();
            return this;
            },
            loaded : function () {
                return this;
            }
        }, config);
        // var instance = 4;
    } else if (config.lib == 'twojs') {
        var instance = $.extend({
            interpolationValueAB: 0.2,
            interpolationValueAC: 0.2,
            interpolationValueAD: 0.2,
            interpolateValue : function(A, B) {
                return A + this.interpolationValueAB * ( B - A );
            },
            interpolate : function () {
                $(this.canvas).html('');
                var canvasWrapper = document.getElementById((config.canvas).replace('#',''));
                var params = {
                    width: 400,
                    height: 400,
                    autostart: true,
                }
                var glyph_size = 5.19;
                var two = new Two(params).appendTo(canvasWrapper);


                for (var j = 0; j < this.glyphJSON[0].points.length; j++) {
                        var contour = this.glyphJSON[0].points[j];
                        var interpolationContour = this.glyphJSON[1].points[j];
                        var anchors = [];
                        for (var i = 0; i < contour.length; i++){
                            var point = contour[i];

                            /* From this point starts mathematical code for interpolation.
                            Done maximally straight. Sorry for wall of code */

                            if (point.type) {
                                var handleIn, handleOut,
                                    handleInX, handleOutX,
                                    handleInY, handleOutY;

                                var pointType = Two.Commands.curve;
                                var closePoint = contour.filter(function(p){
                                        return (p.type)?true:false;
                                });

                                if (i == 0) {
                                    handleInX = contour[contour.length - 1].x;
                                    handleInY = contour[contour.length - 1].y;
                                } else {
                                    handleInX = contour[i - 1].x;
                                    handleInY = contour[i - 1].y;
                                }

                                handleOutX = contour[i + 1].x;
                                handleOutY = contour[i + 1].y;

                                if (point.startp) {
                                    pointType = Two.Commands.move;
                                } else if (point['point-name'] == closePoint[closePoint.length - 1]['point-name']) {
                                    pointType = Two.Commands.close;
                                }
                                var anchor = new Two.Anchor(point.x/glyph_size, 400-point.y/glyph_size,
                                     handleInX/glyph_size, handleInY/glyph_size,
                                     handleOutX/glyph_size, handleOutY/glyph_size, pointType);

                                anchors.push(anchor);
                            }

                    }
                    var ppoly = new Two.Polygon(anchors, true, true, true);
                    ppoly.stroke = '#2b2b2b';
                    two.add(ppoly);
                }

                two.render();
            },
            loaded : function() {

            }
        }, config);

    }
    return instance;
};
