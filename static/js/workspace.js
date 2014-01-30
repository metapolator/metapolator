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

    var storage_ns = $.initNamespaceStorage('metapolator');
    this.storage = storage_ns.localStorage;

    this.glyphlist = [];
    this.versions = [];

    $('#btn-add-axes').on('click', this.createEmptyAxes.bind(this));

    $(window).hashchange(this.hashchanged.bind(this));
}


Workspace.prototype = {

    hashchanged: function() {
        var d = dict_from_locationhash();
        if (this.urldata && this.urldata.project != d.project) {
            this.glyphlist = [];
            this.versions = [];
            $('#glyph-switcher').empty();
        };

        this.metapolationView = null;
        this.htmldoc = new WorkspaceDocument(window.MFPARSER);

        this.urldata = dict_from_locationhash();
        $('#workspace').hide();
        $('#loading').show();

        $('#workspace').empty();
        $('#workspace').html($('#empty-workspace').html());

        $('#btn-add-axes').on('click', this.createEmptyAxes.bind(this));

        this.loadprojectdata();
    },

    /*
     * Send request about zpoint changes to server and save result
     * into local storage
     */
    onzpointchange: function(glyph, zpoint) {
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

            glyph.toggleFaintPaths(glyph.graph.faint, true);

            glyph.render(data.R[0].contours);

            glyph.toggleCenterline(true);
            console.log(data);
            glyph.renderZPoints(data.R[0].zpoints.points);
            this.metapolationView.glyph.render(data.M[0].contours);
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
            data: {project: this.urldata.project,
                   glyph: this.urldata.glyph || ''}
        }).done(this.setWorkspaceConfiguration.bind(this));
    },

    setWorkspaceConfiguration: function(data) {
        this.run($.parseJSON(data));

        this.requestGlyphList();
    },

    requestGlyphList: function() {
        // start request to retrive complete list of glyph data
        $.ajax({
            url: '/editor/glyphs/',
            type: 'GET',
            data: {project: this.urldata.project}
        })
        .done(function(response) {
            this.saveDataToStorage($.parseJSON(response));
        }.bind(this));
    },

    saveDataToStorage: function(response) {
        this.updateGlyphList(response.glyphs);
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

        for (var k = 0; k < data.masters.length; k += 2) {
            var axes = this.htmldoc.getOrCreateAxes(data.masters[k].label);
            axes.find('.axis').each(function(index, axis_element){
                if (!this.versions.length) {
                    this.versions = data.versions;
                }
                this.createView(axis_element, data.mode, data.masters[k + index]);
            }.bind(this));
            this.addInterpolationSlider(axes);
        }

        this.metapolationView = this.htmldoc.createMetapolationView();
        this.htmldoc.appendAxisSingleCanvas(this.metapolationView.getElement());

        var glyphdata = this.getGlyphData(data.metaglyphs);
        this.metapolationView.attachGlyph(glyphdata);
        this.metapolationView.glyph.render(glyphdata.contours);
        this.metapolationView.appendActionButtons({
            onInstanceCreated: this.onInstanceCreated.bind(this),
            onMasterCreated: this.onMasterCreated.bind(this)
        });

        $('#loading').hide();

    },

    appendCopyMasterBtn: function(view) {
        if (view.getMaster()) {
            var btnCopyMaster = $('<button>');
            btnCopyMaster.css({'margin-right': '16px'}).text('Copy master');
            btnCopyMaster.addClass('btn btn-success btn-xs').on('click', function(){
                $.post('/editor/copy-master/', {master_id: view.getMaster(),
                                                glyphname: this.glyphname,
                                                axislabel: view.getLabel()})
                .done(function(response){
                    var data = $.parseJSON(response);
                    this.reloadView(view, {
                        master_id: data.master_id,
                        glyphname: this.glyphname,
                        label: view.getLabel()
                    })

                }.bind(this));
            }.bind(this));

            view.getElement().prepend(btnCopyMaster);
        }
    },

    appendVersions: function(view) {
        if (!this.versions.length)
            return;

        versionselect = $('<select>').addClass('versions').css('margin-bottom', '16px');
        versionselect.on('change', function(e) {
            var $element = view.getElement();
            $element.removeClass('dropzone');

            if (!$(e.target).val()) {
                $element.empty();

                this.createEmptyView($element);
                return;
            }

            $.post('/editor/reload/', {
                'master_id': $(e.target).val(),
                'glyphname': this.glyphname,
                'axislabel': view.getLabel()
                }
            ).done(function(response){
                var data = $.parseJSON(response);
                this.onGlyphChanged(view, data);
            }.bind(this));
        }.bind(this));

        versionselect.find('option').remove();

        var createNewMasterOption = $('<option>', {
            value: "",
            text: "Upload new master"
        });
        versionselect.append(createNewMasterOption);

        for (var k = 0; k < this.versions.length; k++) {
            var optionMaster = $('<option>', {
                value: this.versions[k].master_id,
                text: this.versions[k].name + ' ' + this.versions[k].version
            });
            if (this.versions[k].master_id == view.master_id) {
                optionMaster.attr('selected', 'true');
            }
            versionselect.append(optionMaster);
        }

        view.getElement().prepend(versionselect);
    },

    createEmptyView: function(axis) {
        var $axis = $(axis);

        var view = this.htmldoc.createView($axis, this.urldata.project);
        view.onfileuploaded = this.onMasterUploaded.bind(this);

        this.appendVersions(view);

        $axis.addClass('dropzone');
    },

    createView: function(axis, mode, data) {
        var $axis = $(axis);

        var view = this.htmldoc.createView($axis, this.urldata.project, data.master_id);
        view.onfileuploaded = this.onMasterUploaded.bind(this);

        if (mode == 'pen') {
            this.htmldoc.appendAxisTabNavigation($axis);
        } else {
            this.htmldoc.appendAxisSingleCanvas($axis);
        }

        view.attachForms();

        this.appendVersions(view);
        this.appendCopyMasterBtn(view);

        var glyphdata = this.getGlyphData(data.glyphs);
        view.attachGlyph(glyphdata);
        view.glyph.render(glyphdata.contours);
        view.glyph.renderZPoints(glyphdata.zpoints.points);
        view.onzpointdatachanged = this.onzpointchange.bind(this);
        view.onGlyphChanged = this.reloadView.bind(this);
        return view;
    },

    onGlyphChanged: function(view, data) {
        var $element = view.getElement();
        $element.empty();

        this.createView($element, this.htmldoc.getMode(), data);
        this.metapolationView.glyph.render(data.metaglyphs[0].contours);
    },

    /*
     * Fires when file has been uploaded to server
     * Arguments:
     * view - View instance (see view.js)
     * response - response from server
     */
    onMasterUploaded: function(view, response) {
        this.startLoadingMasterProgress(response.project_id, response.master_id, response.task_id);

        if (!this.project_id) {
            location.hash = '#project/' + response.project_id;
            this.project_id = response.project_id;
            return;
        }

        this.reloadView(view, response);

    },

    reloadView: function(view, data) {
        console.log(view, data);
        view.glyph.toggleFaintPaths(view.glyph.graph.faint, true);
        view.glyph.render(data.R[0].contours);
        view.glyph.toggleCenterline(true);
        this.metapolationView.glyph.render(data.M[0].contours);
    },

    onMasterCreated: function(donecallback) {
        $.post('/editor/create-master/', {
            project_id: this.project_id,
            glyphname: this.glyphname
        }).done(function(response) {
            donecallback();
            this.versions = $.parseJSON(response).versions;
            this.hashchanged();
        }.bind(this)).fail(function() {
            donecallback();
        }.bind(this));
    },

    startLoadingMasterProgress: function(project_id, master_id, task_id) {
        var args = {'master_id': master_id, 'project_id': project_id, 'task_id': task_id || ''};
        $.ajax({url: "/a/master/loading", type: "POST", dataType: "text",
                data: $.param(args)})
        .done(function(response){
            var data = $.parseJSON(response);
            if (!data.done) {
                this.requestGlyphList();
                window.setTimeout(this.startLoadingMasterProgress.bind(this, project_id, master_id, data.task_id), 3000);
            } else {
                this.requestGlyphList();
            }
        }.bind(this));
    },

    createEmptyAxes: function() {
        var $axes = this.htmldoc.addAxes();
        this.addInterpolationSlider($axes);

        $axes.find('.axis').each(function(index, axis) {
            this.createEmptyView(axis);
        }.bind(this));
    },

    onInstanceCreated: function(donecallback) {
        $.post('/editor/create-instance/', {project_id: this.project_id})
        .done(function(response) {
            donecallback();
            window.open('/specimen/' + this.project_id + '/');
        }.bind(this))
        .fail(function() {
            donecallback();
        }.bind(this));
    },

    addInterpolationSlider: function(axes) {
        if (!this.project_id)
            return;
        var slider_template = '<div class="well"><b style="padding-right: 32px;">{0}</b> ' +
                      '<input class="span2 slider-{2}" slider-label="{2}" type="text" value=""' +
                      '         data-slider-min="-2" data-slider-max="2" data-slider-step="0.01"'  +
                      '         data-slider-value="0" data-slider-orientation="horizontal"' +
                      '         data-slider-selection="after" data-slider-tooltip="show"' +
                      '         data-slider-handle="round" />' +
                      ' <b style="padding-left: 32px;">{1}</b></div>';

        var metap = axes.find('[axis-label]').map(function(i, el){
            return $(el).attr('axis-label');
        });

        metap = metap.get().join("");

        if (!$('#interpolations').find('.slider-' + metap).length) {
            var slider = $(String.format(slider_template, metap[0], metap[1], metap));
            $('#interpolations').append(slider);

            function formatter(value) {
                return value.toFixed(2);
            }

            slider.find('input').slider({formater: formatter}).on('slideStop', function(e){
                $.post('/editor/save-metap/', {
                    project_id: this.project_id,
                    glyphname: this.glyphname,
                    label: $(e.target).attr('slider-label'),
                    value: e.value
                })
                .done(function(response){
                    var data = $.parseJSON(response);
                    this.metapolationView.glyph.render(data.M[0].contours);
                }.bind(this))
                .fail(function(){ alert('Could not change metapolation value') });
            }.bind(this));
            $('#interpolations').show();
        }
    },

    getGlyphData: function(glyphs) {
        var $glyph = this.urldata.glyph;

        if (!this.urldata.glyph) {
            this.glyphname = glyphs[0].name;
            return glyphs[0];
        }

        result = glyphs.filter(function(el){
            return el.name == $glyph;
        });

        if (!result.length) {
            this.glyphname = glyphs[0].name;
            return glyphs[0];
        };

        this.glyphname = result[0].name;
        return result[0];
    },

    updateGlyphList: function(glyphs) {
        for (var k = 0; k < glyphs.length; k++) {
            if (this.glyphlist.indexOf(glyphs[k]) < 0) {
                this.glyphlist.push(glyphs[k]);

                var span = $('<span>');
                span.append(
                    $('<a>', {href: '#project/' + this.project_id + '/glyph/' + glyphs[k]}).html(MFLIST[glyphs[k] - 1])
                );
                $('#glyph-switcher').append(span);
                $('#glyph-switcher').append(" ");
            }
            $('#btn-show-glyphs').show();
        }
    },

    /*
     * Build html document with a single dropzone to upload UFO
     */
    cleanrun: function() {
        $('#loading').fadeOut(220, this.createEmptyAxes.bind(this));
    }
}

if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

$(function() {
    var workspace = new Workspace();
    workspace.loadprojectdata();
});

var MFLIST = ['A', 'Agrave', 'Aacute', 'Acircumflex', 'Atilde', 'Adieresis', 'Aring', 'Amacron', 'Abreve', 'Aogonek',
          'B', 'uni1E02', 'C', 'Ccedilla', 'Cacute', 'Ccircumflex', 'Cdotaccent', 'Ccaron', 'D', 'Dcaron', 'uni1E0A',
          'E', 'Egrave', 'Eacute', 'Ecircumflex', 'Edieresis', 'Emacron', 'Edotaccent', 'Eogonek', 'Ecaron',
          'F', 'uni1E1E', 'G', 'Gcircumflex', 'Gbreve', 'Gdotaccent', 'Gcommaaccent', 'H', 'Hcircumflex',
          'I', 'Igrave', 'Iacute', 'Icircumflex', 'Idieresis', 'Itilde', 'Imacron', 'Iogonek', 'Idotaccent',
          'J', 'Jcircumflex', 'K', 'Kcommaaccent', 'L', 'Lacute', 'Lcommaaccent', 'Lcaron', 'M', 'uni1E40',
          'N', 'Ntilde', 'Nacute', 'Ncommaaccent', 'Ncaron', 'O', 'Ograve', 'Oacute', 'Ocircumflex', 'Otilde', 'Odieresis',
          'Omacron', 'Ohungarumlaut', 'P', 'uni1E56', 'Q', 'R', 'Racute', 'Rcommaaccent', 'Rcaron', 'S', 'Sacute',
          'Scircumflex', 'Scedilla', 'Scaron', 'uni1E60', 'T', 'Tcommaaccent', 'Tcaron', 'uni1E6A', 'U', 'Ugrave',
          'Uacute', 'Ucircumflex', 'Udieresis', 'Utilde', 'Umacron', 'Ubreve', 'Uring', 'Uhungarumlaut', 'Uogonek',
          'V', 'W', 'Wcircumflex', 'Wgrave', 'Wacute', 'Wdieresis', 'X', 'Y', 'Yacute', 'Ycircumflex', 'Ydieresis', 'Ygrave',
          'Z', 'Zacute', 'Zdotaccent', 'Zcaron', 'AE', 'Eth', 'Oslash', 'Thorn', 'Dcroat', 'Hbar', 'Lslash', 'Eng', 'OE',
          'Tbar', 'M.salt', 'uni1E40.salt', 'N.salt', 'Ntilde.salt', 'Nacute.salt', 'Ncommaaccent.salt', 'Ncaron.salt',
          'X.salt', 'Idotaccent.smcp', 'uni03A9', 'mu', 'afii61289', 'a', 'agrave', 'aacute', 'acircumflex', 'atilde',
          'adieresis', 'aring', 'amacron', 'abreve', 'aogonek', 'b', 'uni1E03', 'c', 'ccedilla', 'cacute', 'ccircumflex',
          'cdotaccent', 'ccaron', 'c_h', 'c_k', 'c_t', 'd', 'dcaron', 'uni1E0B', 'e', 'egrave', 'eacute', 'ecircumflex',
          'edieresis', 'emacron', 'edotaccent', 'eogonek', 'ecaron', 'f', 'uni1E1F', 'f_t', 'f_y', 'g', 'gcircumflex',
          'gbreve', 'gdotaccent', 'gcommaaccent', 'h', 'hcircumflex', 'i', 'igrave', 'iacute', 'icircumflex', 'idieresis',
          'itilde', 'imacron', 'iogonek', 'j', 'jcircumflex', 'k', 'kcommaaccent', 'l', 'lacute', 'lcommaaccent', 'lcaron',
          'm', 'uni1E41', 'n', 'ntilde', 'nacute', 'ncommaaccent', 'ncaron', 'o', 'ograve', 'oacute', 'ocircumflex', 'otilde',
          'odieresis', 'omacron', 'ohungarumlaut', 'p', 'uni1E57', 'q', 'r', 'racute', 'rcommaaccent', 'rcaron', 's', 'sacute',
          'scircumflex', 'scedilla', 'scaron', 'uni1E61', 't', 'tcommaaccent', 'tcaron', 'uni1E6B', 't_t', 't_y', 'u', 'ugrave',
          'uacute', 'ucircumflex', 'udieresis', 'utilde', 'umacron', 'ubreve', 'uring', 'uhungarumlaut', 'uogonek', 'v', 'w',
          'wcircumflex', 'wgrave', 'wacute', 'wdieresis', 'x', 'y', 'yacute', 'ydieresis', 'ycircumflex', 'ygrave', 'z', 'zacute',
          'zdotaccent', 'zcaron', 'ordfeminine', 'ordmasculine', 'germandbls', 'ae', 'eth', 'oslash', 'thorn', 'dcroat', 'hbar',
          'dotlessi', 'kgreenlandic', 'lslash', 'eng', 'oe', 'tbar', 'florin', 'uniFB00', 'uniFB01', 'uniFB02', 'uniFB03', 'uniFB04',
          'uniFB06', 'a.salt', 'agrave.salt', 'aacute.salt', 'acircumflex.salt', 'atilde.salt', 'adieresis.salt', 'aring.salt',
          'amacron.salt', 'abreve.salt', 'aogonek.salt', 'b.salt', 'uni1E03.salt', 'd.salt', 'dcaron.salt', 'uni1E0B.salt', 'f.salt',
          'uni1E1F.salt', 'g.salt', 'gcircumflex.salt', 'gbreve.salt', 'gdotaccent.salt', 'gcommaaccent.salt', 'm.salt', 'uni1E41.salt',
          'n.salt', 'ntilde.salt', 'nacute.salt', 'ncommaaccent.salt', 'ncaron.salt', 'p.salt', 'uni1E57.salt', 'r.salt', 'racute.salt',
          'rcommaaccent.salt', 'rcaron.salt', 't.salt', 'tcommaaccent.salt', 'tcaron.salt', 'u.salt', 'ugrave.salt', 'uacute.salt',
          'ucircumflex.salt', 'udieresis.salt', 'utilde.salt', 'umacron.salt', 'ubreve.salt', 'uring.salt', 'uhungarumlaut.salt',
          'uogonek.salt', 'x.salt', 'dcroat.salt', 'tbar.salt', 'a.smcp', 'agrave.smcp', 'aacute.smcp', 'acircumflex.smcp',
          'atilde.smcp', 'adieresis.smcp', 'aring.smcp', 'amacron.smcp', 'abreve.smcp', 'aogonek.smcp', 'b.smcp', 'uni1E03.smcp',
          'c.smcp', 'ccedilla.smcp', 'cacute.smcp', 'ccircumflex.smcp', 'cdotaccent.smcp', 'ccaron.smcp', 'd.smcp', 'dcaron.smcp',
          'uni1E0B.smcp', 'e.smcp', 'egrave.smcp', 'eacute.smcp', 'ecircumflex.smcp', 'edieresis.smcp', 'emacron.smcp', 'edotaccent.smcp',
          'eogonek.smcp', 'ecaron.smcp', 'f.smcp', 'uni1E1F.smcp', 'g.smcp', 'gcircumflex.smcp', 'gbreve.smcp', 'gdotaccent.smcp',
          'gcommaaccent.smcp', 'h.smcp', 'hcircumflex.smcp', 'i.smcp', 'igrave.smcp', 'iacute.smcp', 'icircumflex.smcp', 'idieresis.smcp',
          'itilde.smcp', 'imacron.smcp', 'iogonek.smcp', 'j.smcp', 'jcircumflex.smcp', 'k.smcp', 'kcommaaccent.smcp', 'l.smcp', 'lacute.smcp',
          'lcommaaccent.smcp', 'lcaron.smcp', 'm.smcp', 'uni1E41.smcp', 'n.smcp', 'ntilde.smcp', 'nacute.smcp', 'ncommaaccent.smcp',
          'ncaron.smcp', 'o.smcp', 'ograve.smcp', 'oacute.smcp', 'ocircumflex.smcp', 'otilde.smcp', 'odieresis.smcp', 'omacron.smcp',
          'ohungarumlaut.smcp', 'p.smcp', 'uni1E57.smcp', 'q.smcp', 'r.smcp', 'racute.smcp', 'rcommaaccent.smcp', 'rcaron.smcp', 's.smcp',
          'sacute.smcp', 'scircumflex.smcp', 'scedilla.smcp', 'scaron.smcp', 'uni1E61.smcp', 't.smcp', 'tcommaaccent.smcp', 'tcaron.smcp',
          'uni1E6B.smcp', 'u.smcp', 'ugrave.smcp', 'uacute.smcp', 'ucircumflex.smcp', 'udieresis.smcp', 'utilde.smcp', 'umacron.smcp',
          'ubreve.smcp', 'uring.smcp', 'uhungarumlaut.smcp', 'uogonek.smcp', 'v.smcp', 'w.smcp', 'wcircumflex.smcp', 'wgrave.smcp',
          'wacute.smcp', 'wdieresis.smcp', 'x.smcp', 'y.smcp', 'yacute.smcp', 'ydieresis.smcp', 'ycircumflex.smcp', 'ygrave.smcp',
          'z.smcp', 'zacute.smcp', 'zdotaccent.smcp', 'zcaron.smcp', 'ordfeminine.smcp', 'ordmasculine.smcp', 'germandbls.smcp',
          'ae.smcp', 'eth.smcp', 'oslash.smcp', 'thorn.smcp', 'dcroat.smcp', 'hbar.smcp', 'lslash.smcp', 'eng.smcp', 'oe.smcp',
          'tbar.smcp', 'a.superior', 'b.superior', 'c.superior', 'd.superior', 'e.superior', 'f.superior', 'g.superior',
          'h.superior', 'i.superior', 'j.superior', 'k.superior', 'l.superior', 'm.superior', 'n.superior', 'o.superior',
          'p.superior', 'q.superior', 'r.superior', 's.superior', 't.superior', 'u.superior', 'v.superior', 'w.superior',
          'x.superior', 'y.superior', 'z.superior', 'pi', 'circumflex', 'caron', 'circumflex.smcp', 'caron.smcp', 'uni0338',
          'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'zero.denominator',
          'one.denominator', 'two.denominator', 'three.denominator', 'four.denominator', 'five.denominator',
          'six.denominator', 'seven.denominator', 'eight.denominator', 'nine.denominator', 'zero.numerator',
          'one.numerator', 'two.numerator', 'three.numerator', 'four.numerator', 'five.numerator', 'six.numerator',
          'seven.numerator', 'eight.numerator', 'nine.numerator', 'zero.oldstyle', 'one.oldstyle', 'two.oldstyle',
          'three.oldstyle', 'four.oldstyle', 'five.oldstyle', 'six.oldstyle', 'seven.oldstyle', 'eight.oldstyle',
          'nine.oldstyle', 'zero.smcp', 'one.smcp', 'two.smcp', 'three.smcp', 'four.smcp', 'five.smcp', 'six.smcp',
          'seven.smcp', 'eight.smcp', 'nine.smcp', 'zero.tnum', 'one.tnum', 'two.tnum', 'three.tnum', 'four.tnum',
          'five.tnum', 'six.tnum', 'seven.tnum', 'eight.tnum', 'nine.tnum', 'zero.tosf', 'one.tosf', 'two.tosf',
          'three.tosf', 'four.tosf', 'five.tosf', 'six.tosf', 'seven.tosf', 'eight.tosf', 'nine.tosf', 'uni00B2',
          'uni00B3', 'uni00B9', 'onequarter', 'onehalf', 'threequarters', 'uni2070', 'uni2074', 'uni2075', 'uni2076',
          'uni2077', 'uni2078','uni2079', 'uni2080', 'uni2081', 'uni2082', 'uni2083', 'uni2084', 'uni2085', 'uni2086',
          'uni2087', 'uni2088', 'uni2089', 'underscore', 'hyphen', 'endash', 'emdash', 'hyphen.alt', 'endash.alt',
          'emdash.alt', 'hyphen.smcp', 'endash.smcp', 'emdash.smcp', 'parenleft', 'bracketleft', 'braceleft', 'quotesinglbase',
          'quotedblbase', 'parenleft.alt', 'parenleft.smcp', 'quotesinglbase.smcp', 'quotedblbase.smcp', 'parenright',
          'bracketright', 'braceright', 'parenright.alt', 'parenright.smcp', 'guillemotleft', 'quoteleft', 'quotedblleft',
          'guilsinglleft', 'quoteleft.smcp', 'quotedblleft.smcp', 'guillemotright', 'quoteright', 'quotedblright',
          'guilsinglright', 'quoteright.smcp', 'quotedblright.smcp', 'exclam', 'quotedbl', 'numbersign', 'percent',
          'ampersand', 'quotesingle', 'asterisk', 'comma', 'period', 'slash', 'colon', 'semicolon', 'question', 'at',
          'backslash', 'exclamdown', 'periodcentered', 'questiondown', 'dagger', 'daggerdbl', 'bullet', 'ellipsis', 'perthousand',
          'at.alt', 'exclamdown.alt', 'questiondown.alt', 'ampersand.salt', 'exclam.smcp', 'quotedbl.smcp', 'numbersign.smcp',
          'percent.smcp', 'ampersand.smcp', 'quotesingle.smcp', 'asterisk.smcp', 'question.smcp', 'at.smcp', 'exclamdown.smcp',
          'periodcentered.smcp', 'questiondown.smcp', 'bullet.smcp', 'perthousand.smcp', 'plus', 'less', 'equal', 'greater',
          'bar', 'asciitilde', 'logicalnot', 'plusminus', 'multiply', 'divide', 'fraction', 'partialdiff', 'Delta', 'product',
          'summation', 'minus', 'radical', 'infinity', 'integral', 'approxequal', 'notequal', 'lessequal', 'greaterequal',
          'dollar', 'cent', 'sterling', 'currency', 'yen', 'Euro', 'dollar.smcp', 'sterling.smcp', 'yen.smcp', 'Euro.smcp',
          'asciicircum', 'grave', 'dieresis', 'macron', 'acute', 'cedilla', 'breve', 'dotaccent', 'ring', 'ogonek', 'tilde',
          'hungarumlaut', 'grave.smcp', 'dieresis.smcp', 'macron.smcp', 'acute.smcp', 'ring.smcp', 'tilde.smcp', 'brokenbar',
          'section', 'copyright', 'registered', 'degree', 'paragraph', 'afii61352', 'trademark', 'estimated', 'lozenge',
          'degree.smcp', 'space', '.notdef', 'uni000D', 'uni00AD', 'uni00AD.alt', 'uni00AD.smcp', 'onesuperior', 'threesuperior',
          'twosuperior']
