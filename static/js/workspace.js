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
    this.htmldoc = new WorkspaceDocument(window.MFPARSER);
    this.urldata = dict_from_locationhash();

    $('#btn-add-axes').on('click', function() {
        var axes = this.htmldoc.addAxes();

        new Dropzone(axes.find('.axis'), {
            project_id: function() {return this.project_id || 0;}.bind(this)
        }, this.dataUploaded.bind(this));
    }.bind(this));
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

            this.metapolationView.glyph.render(data.M.edges[0].contours);
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
        if (!label) {
            return 'middle';
        }
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
        this.htmldoc.setMode(data.mode);

        for (var k = 0; k < data.projects.length; k++) {
            var axes = this.htmldoc.getOrCreateAxes(data.projects[k].label);
            if (!this.metapolationView) {
                this.metapolationView = this.addView(axes, data.metaglyphs);
            }
            this.addView(axes, data.projects[k].glyphs, data.projects[k].master_id, data.versions, data.projects[k].label);
        }


        new Dropzone($('.axis'), {
            project_id: function() {return this.project_id || 0;}.bind(this)
        }, this.dataUploaded.bind(this));

        $('#loading').hide();
    },

    dataUploaded: function(data) {
        location.hash = '#project/' + data.project_id;
        this.project_id = data.project_id;

        var axes = this.htmldoc.getOrCreateAxes(data.label);
        axes.find('div[axis-label=' + data.label + ']').empty();
        var view = this.addView(axes, data.glyphs, data.master_id, data.versions, data.label);
        view.getElement().removeClass('dropzone');

        if (!this.metapolationView) {
            this.metapolationView = this.addView(axes, data.metaglyphs);
        }
        this.metapolationView.glyph.render(data.metaglyphs.edges[0].contours);
    },

    addView: function(axes, data, master_id, versions, label) {
        var view = this.htmldoc.addView(axes, data.edges[0], this.getPositionByLabel(label));

        view.glyph.render(data.edges[0].contours);

        if (versions) {
            view.setMaster(master_id);
            view.appendVersions(versions);
            view.appendLocalParameters();
            view.glyph.renderZPoints(data.edges[0].zpoints.points);
            view.onzpointdatachanged = this.onzpointchange.bind(this);
        }

        view.onGlyphChanged = function(view, data) {
            view.element.empty();
            this.addView(axes, data.glyphs, data.master_id, versions, view.getLabel());
            this.metapolationView.glyph.render(data.metaglyphs.edges[0].contours);
        }.bind(this);
        return view;
    },

    /*
     * Build html document with a single dropzone to upload UFO
     */
    cleanrun: function() {
        $('#loading').fadeOut(220, function(){
            var axes = this.htmldoc.addAxes();

            new Dropzone(axes.find('.axis'), {
                project_id: function() {return this.project_id || 0;}.bind(this)
            }, this.dataUploaded.bind(this));
        }.bind(this));
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

