function createCanvas(el, x, y) {
    if (!x) {
        x = 100, y = 100;
    }
    var canvas = $('<canvas></canvas>').attr({width:x, height:y});
    $(el).attr({width:x, height:y}).append(
        $('<div class="wrapper"></div>').append(canvas))

    return canvas[0].getContext('2d');
}

function onload(index, err, font) {
    if (err) {
        this.failed = true
    } else {
        this.add(index, font);
        if (this.loaded() && !this.failed)
            this.interpolate();
    }
}

function Instances(fontslist, config) {

    var instances = $.extend(config, {
        counter: 0,
        fonts: new Array(fontslist.length),
        interpolationValueAB: 0.2,
        interpolationValueAC: 0.2,
        interpolationValueAD: 0.2,

        add: function(index, font) {
            this.fonts[index] = font;
            this.counter++;
        },

        metrics: function(text) {
            var lines = [''];
            var i = 0, j = 0;
            var font = this.fonts[0];

            var $canvasWidth = $(this.canvas).find('canvas').attr('width');
            this.fonts[0].forEachGlyph(text, 0, this.lineHeight, this.fontSize, {}, function (glyph, x, y, fontSize) {
                var width = x + (glyph.advanceWidth * 1 / font.unitsPerEm * fontSize);
                if (width > (parseInt($canvasWidth) * lines.length)) {
                    i = i + 1, lines[i] = '';
                }
                lines[i] = lines[i] + text[j];
                j++;
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
            ctx = createCanvas(this.canvas, maxX, maxY);
            pathA.draw(ctx);

        },

        interpolateValue: function(A, B) {
            return A + this.interpolationValueAB * ( B - A );
        },

        interpolateExtValue: function(A, B, C, D) {
            return (A + this.interpolationValueAB * ( B - A ) ) + this.interpolationValueAC * ( C - A );// + this.interpolationValueAD * ( D - A );
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
    });

    for (var i = 0; i < fontslist.length; i++) {
        opentype.load(fontslist[i], onload.bind(instances, i));
    }

    return instances;
}
