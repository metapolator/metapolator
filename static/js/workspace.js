function dict_from_locationhash() {
    var r = location.hash.replace('#', '');
    var parts = r.split('/');
    var dict = {};
    for (var k = 0; k < parts.length; k += 2) {
        dict[parts[k]] = parts[k + 1];
    }
    return dict;
}


var Workspace = function() {
    // Events:
    this.onzpointchange = null; // values of zpoint have been changed
    this.onlparamchange = null; // values of lparam have been changed

    this.htmldoc = new View('');

    this.urldata = dict_from_locationhash();
}


Workspace.prototype = {

    /*
     * Send request about zpoint changes to server and save result 
     * into local storage
     */
    onzpointchange: function(zpoint) {},

    /*
     * Load completed project data. It includes all list of 
     * available glyphs, data for zpoints and glyph contours
     * of all project masters.
     */
    loadprojectdata: function() {
        if (!this.urldata.project) {
            this.cleanrun();
            return;
        }

        $.ajax({
            url: '/editor/project/',
            type: 'GET',
            data: {project: this.urldata.project, glyph: this.urldata.glyph || ''},
            dataType: 'jsonp',
        }).done(this.setWorkspaceConfiguration.bind(this));
    },

    setWorkspaceConfiguration: function(data) {
        this.run();
    },

    /*
     * Build html document with editor based on received data
     */
    run: function() {
        if (!this.urldata.project) {
            this.cleanrun();
            return;
        }
    },

    /*
     * Build html document with a single dropzone to upload UFO
     */
    cleanrun: function() {
        $('#loading').fadeOut(220, function(){
            var startpage = $('#startpage');
            startpage.show();

            if (! (typeof DEMOEDGES == 'undefined') ) {
                this.htmldoc.addAxes();
                this.createAxisGlyph('A', DEMOEDGES.glyphs.edges[2]);
                return;
            }
            else {
                var data = {'label': 'a'};
                new Dropzone(startpage.find('.dropzone'), data, function(response) {
                    this.htmldoc.addAxes();
                    this.createAxisGlyph('A', response.glyphs.edges[0]);
                }.bind(this));
            }
        }.bind(this));
    },

    createAxisGlyph: function(axislabel, glyphdata) {
        var axis = $('div[axis-label=' + axislabel + ']');
        var glyph = new Glyph(axis.find('canvas')[0],
                              {width: glyphdata.width, height: glyphdata.height});
        glyph.render(glyphdata.contours);
        glyph.renderZPoints(glyphdata.zpoints.points);
    }
}


var Dropzone = function(element, data, uploadFinished) {
    $(element).filedrop({
        fallback_id: 'upload_button',
        url: '/upload/',
        paramname: 'ufofile',
        withCredentials: true,

        data: data,

        dragOver: function(e) {
            var target = e.target;
            $(target).css('background', '#eee');
        },

        dragLeave: function(e) {
            var target = e.target;
            $(target).css('background', '#fff');
        },

        error: function(err, file) {
            $('.dropzone').css('background', '#fff');
        },

        uploadFinished: function(i, file, response, time) {
            uploadFinished(response);
        }
    });
}


var ZPoint = function() {
    this.params = {};
}

ZPoint.prototype = {

    /*
     * Called when user changed zpoint parameter
     */
    onchanged: function() {

    },

    /*
     * Put point to new position
     */
    move: function(x, y) {
        this.params.x = x;
        this.params.y = y;
        this.onchanged();
    }
}

$(function() {
    var workspace = new Workspace();
    workspace.loadprojectdata();
});

