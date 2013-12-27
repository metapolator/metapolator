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

        var postdata = {
            id: zpoint.data.glyphoutline_id,
            x: zpoint.x,
            y: zpoint.y
        }

        $.extend(postdata, zpoint.data)

        $.ajax({
            type: 'post',
            data: postdata,
            url: '/editor/save-point/'
        })
        .done(function(response) {
            var data = $.parseJSON(response);
            glyph.render(data.R.edges[0].contours);
            this.metapolationGlyph.render(data.M.edges[0].contours);
        }.bind(this));
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
        this.run(data);
    },

    getPositionByLabel: function(label) {
        return ['A', 'C', 'E'].indexOf(label.toUpperCase()) >= 0 ? 'left': 'right';
    },

    /*
     * Build html document with editor based on received data
     */
    run: function(data) {
        if (!this.urldata.project) {
            this.cleanrun();
            return;
        }

        this.project_id = this.urldata.project;

        for (var k = 0; k < data.length; k++) {
            var axes = this.htmldoc.getOrCreateAxes(data[k].label);
            var view = this.addView(axes, data[k]);
            this.updateGlyphView(view, data[k]);
        }

        new Dropzone($('.axis'), {
            project_id: function() {return this.project_id || 0;}.bind(this)
        });

        $('#loading').hide();
    },

    addView: function(axes, data) {
        var view = this.htmldoc.addView(axes, data.master_id, this.getPositionByLabel(data.label));
        view.onLocalParamFormSubmit = function() {
            debugger;
        };
        return view;
    },

    /*
     * Build html document with a single dropzone to upload UFO
     */
    cleanrun: function() {
        $('#loading').fadeOut(220, function(){

            var axes = this.htmldoc.addAxes();

            if (! (typeof DEMOEDGES == 'undefined') ) {
                this.buildView(axes, DEMOEDGES);
                return;
            }

            new Dropzone(axes.find('.axis'), {
                project_id: function() {return this.project_id || 0;}.bind(this)
            }, this.buildView.bind(this, axes));
        }.bind(this));
    },


    /*
     * Put view onto the workspace
     */
    buildView: function(axes, data) {
        location.hash = '#project/' + data.project_id;

        this.project_id = data.project_id;

        var view = this.addView(axes, data);

        view.getElement().removeClass('dropzone');

        this.updateGlyphView(view, data);
    },

    /*
     * Put glyph to view
     * 
     * Parameters:
     * view - View instance
     * data - glyph data. See `Glyph Data Json`
     */
    updateGlyphView: function(view, data) {
        glyphdata = data.glyphs.edges[0];
        this.createViewGlyph(view, glyphdata);

        var metaview = this.htmldoc.getMetapolationView();
        var metaglyphdata = data.metaglyphs.edges[0];
        this.createViewGlyph(metaview, metaglyphdata);
    },

    /*
     * Put glyph onto the view
     *
     * Parameters:
     * view - view element on the page
     * glyphdata - json describing the glyph and zpoints
     */
    createViewGlyph: function(view, glyphdata) {
        glyph = view.getGlyph(glyphdata);
        glyph.render(glyphdata.contours);
        glyph.renderZPoints(glyphdata.zpoints.points);
        glyph.onZPointChanged = this.onzpointchange.bind(this);
    }
}


var Dropzone = function(element, data, uploadFinished) {
    $(element).each(function(i, element) {
        var el = $(element)
        if (!$.trim(el.html())) {
            el.addClass('dropzone');
        }
    });

    $.extend(data, {label: function(){
        return this.dropzone_label || 'a';
    }.bind(this)});

    $(element).filedrop({
        fallback_id: 'upload_button',
        url: '/upload/',
        paramname: 'ufofile',
        withCredentials: true,

        data: data,

        drop: function(e) {
            var target = $(e.target);
            if (!target.hasClass('axis')) { 
                this.dropzone_label = target.parents('.axis').attr('axis-label');
            } else {
                this.dropzone_label = target.attr('axis-label');
            }
        }.bind(this),

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
            uploadFinished && uploadFinished(response);
        }
    });
}

$(function() {
    var workspace = new Workspace();
    workspace.loadprojectdata();
});

