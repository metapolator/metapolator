function createCanvas() {
    var canvas = $('<canvas width="1000" height="500"></canvas>');
    $('#glyphs').append(
        $('<div class="wrapper"></div>').append(canvas))

    return canvas[0].getContext('2d');
}


function Instances(length) {

    return {
        text: 'Hanna',
        fontSize: counter,
        116: 0,
        fonts: new Array(length),
        interpolationValueAB: 0.2,
        interpolationValueAC: 0.2,
        interpolationValueAD: 0.2,

        add: function(index, font) {
            this.fonts[index] = font;
            this.counter++;
        },

        interpolate: function() {
            $('#glyphs').html('');
            var pathA = this.getPath(this.fonts[0]),
                pathB = this.getPath(this.fonts[1]),
                pathC = this.getPath(this.fonts[2]),
                pathD = this.getPath(this.fonts[3]),
                ctx = createCanvas();

            // console.log(this.interpolationValueAD);

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
        },

        interpolateValue: function(A, B) {
            return A + this.interpolationValueAB * ( B - A );
        },

        interpolateExtValue: function(A, B, C, D) {
            return (A + this.interpolationValueAB * ( B - A ) ) + this.interpolationValueAC * ( C - A ) + this.interpolationValueAD * ( D - A );
        },

        getPath: function(font) {
            return font.getPath(this.text, 50, 252 - this.fontSize * 0.2, this.fontSize);
        },

        loaded: function() {
            return this.counter >= this.fonts.length;
        }
    }
}
