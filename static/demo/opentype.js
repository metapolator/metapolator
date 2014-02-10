function createGlyphCanvas(glyph, size) {
    var canvasId, html, glyphsDiv, wrap, canvas, ctx;

    var canvas = $('<canvas width="' + size + '" height="' + size + '"></canvas>');
    $('#glyphs').append(
        $('<div class="wrapper"></div>').append(canvas))

    return canvas[0].getContext('2d');
}

function getFontInstance(fontinstance) {

    return {
        font: fontinstance,
        glyphIndex: 49,
        fontSize: 72,
        interpolationValue: 0,

        interpolate: function(instance) {
            $('#glyphs').html('');
            var glyph = this.font.glyphs[this.glyphIndex],
                ctx = createGlyphCanvas(glyph, 300),

                pathA = this.getPath(),
                pathB = instance.getPath();

            console.log(JSON.stringify(pathA.commands));

            for (var i = 0; i < pathA.commands.length; i++) {
                if (pathA.commands[i].x) {
                    pathA.commands[i].x = this.interpolateValue(pathA.commands[i].x, (pathB.commands[i] || pathA.commands[i]).x);
                }
                if (pathA.commands[i].x1) {
                    pathA.commands[i].x1 = this.interpolateValue(pathA.commands[i].x1, (pathB.commands[i] || pathA.commands[i]).x1);
                }
                if (pathA.commands[i].y1) {
                    pathA.commands[i].y1 = this.interpolateValue(pathA.commands[i].x1, (pathB.commands[i] || pathA.commands[i]).y1);
                }
                if (pathA.commands[i].y) {
                    pathA.commands[i].y = this.interpolateValue(pathA.commands[i].y, (pathB.commands[i] || pathA.commands[i]).y);
                }
            }

            console.log(JSON.stringify(pathA.commands));
            pathA.draw(ctx);
        },

        interpolateValue: function(A, B) {
            return parseInt(A + this.interpolationValue * ( B - A ));
        },

        getPath: function() {
            return this.font.glyphs[this.glyphIndex].getPath(50, 120, this.fontSize);
        }
    }
}

var instances = [];


function funStart() {
    instances[0].interpolate(instances[1]);
}
