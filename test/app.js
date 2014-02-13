function createCanvas(el, x, y) {
    // x = x + 50;
    var x = 900,
        y = 130;
    var canvas = $('<canvas></canvas>').attr({width:x, height:y});
    $(el).attr({width:x, height:y}).append(
        $('<div class="wrapper"></div>').append(canvas))

    return canvas[0].getContext('2d');
}


function Instances(fontslist, config) {

    return $.extend(config, {
        fontSize: 76,
        counter: 0,
        fonts: new Array(fontslist.length),
        interpolationValueAB: 0.2,
        interpolationValueAC: 0.2,
        interpolationValueAD: 0.2,

        add: function(index, font) {
            this.fonts[index] = font;
            this.counter++;
        },

        interpolate: function() {
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
                    maxX = Math.max(maxX, pathA.commands[i].x);

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

        getPath: function(font, word) {
            if (typeof word == 'undefined') {
                word = this.text;
            }
            return font.getPath(word, 50, 90, this.fontSize);
        },

        loaded: function() {
            return this.counter >= this.fonts.length;
        }
    });
}


function SimpleInstances(fontslist, config) {

    return $.extend(Instances(fontslist, config), {

        interpolate: function() {
            // debugger;
            $(this.canvas).html('');
            var pathA = this.getPath(this.fonts[0]),
                pathB = this.getPath(this.fonts[1]);

            var maxX = 0,
                maxY = 0;

            // console.log(this.interpolationValueAD);

            for (var i = 0; i < pathA.commands.length; i++) {
                var B_command = pathB.commands[i] || pathA.commands[i];
                if (pathA.commands[i].x) {
                    maxX = Math.max(maxX, pathA.commands[i].x);

                    pathA.commands[i].x = this.interpolateValue(
                        pathA.commands[i].x, B_command.x);
                }
                if (pathA.commands[i].x1) {
                    pathA.commands[i].x1 = this.interpolateValue(
                        pathA.commands[i].x1, B_command.x1);
                }
                if (pathA.commands[i].y1) {
                    maxY = Math.max(maxY, pathA.commands[i].y1);
                    pathA.commands[i].y1 = this.interpolateValue(
                        pathA.commands[i].y1, B_command.y1);
                }
                if (pathA.commands[i].x2) {
                    pathA.commands[i].x2 = this.interpolateValue(
                        pathA.commands[i].x2, B_command.x2);
                }
                if (pathA.commands[i].y2) {
                    pathA.commands[i].y2 = this.interpolateValue(
                        pathA.commands[i].y2, B_command.y2);
                }
                if (pathA.commands[i].y) {
                    pathA.commands[i].y = this.interpolateValue(
                        pathA.commands[i].y, B_command.y);
                }
            }
            ctx = createCanvas(this.canvas, maxX, maxY);
            pathA.draw(ctx);
        }
    });
}
