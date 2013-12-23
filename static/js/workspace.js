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
    this.htmldoc = new WorkspaceDocument('');
    this.urldata = dict_from_locationhash();
}


Workspace.prototype = {

    /*
     * Send request about zpoint changes to server and save result 
     * into local storage
     */
    onzpointchange: function(glyph, zpoint) {
        if (! (typeof DEMOEDGE == 'undefined') ) {
            glyph.render(DEMOEDGE.R.edges[0].contours);
            return;
        }

        $.ajax({
            type: 'post',
            data: {
                id: zpoint.data.glyphoutline_id,
                x: zpoint.x,
                y: zpoint.y
            },
            url: '/editor/save-point/',
            success: function(response) {
                var data = $.parseJSON(response);
                glyph.render(DEMOEDGE.R.edges[0].contours);
            }
        });
    },

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
                this.buildView(DEMOEDGES);
                return;
            }

            var data = {'label': 'a'};
            new Dropzone(startpage.find('.dropzone'), data, this.buildView.bind(this));
        }.bind(this));
    },

    /*
     * Put view onto the workspace
     */
    buildView: function(data) {
        this.project_id = data.project_id;

        var axes = this.htmldoc.addAxes();
        var view = this.htmldoc.addView(axes, 'left');

        var metaview = this.htmldoc.getMetapolationView();

        glyphdata = data.glyphs.edges[0];
        var gl = new Glyph(metaview, {width: glyphdata.width, height: glyphdata.height});
        gl.render(glyphdata.contours);
        
        this.createViewGlyph(view, glyphdata);
    },

    /*
     * Put glyph onto the view
     *
     * Parameters:
     * view - view element on the page
     * glyphdata - json describing the glyph and zpoints
     */
    createViewGlyph: function(view, glyphdata) {
        var glyph = new Glyph(view, {width: glyphdata.width, height: glyphdata.height});
        glyph.onZPointChanged = this.onzpointchange.bind(this);

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

$(function() {
    var workspace = new Workspace();
    workspace.loadprojectdata();
});

