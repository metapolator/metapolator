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
    this.glyphlist = [];

    $('#btn-add-axes').on('click', function() {
        var axes = this.htmldoc.addAxes();

        new Dropzone(axes.find('.axis'), {
            project_id: function() {return this.project_id || 0;}.bind(this)
        }, this.dataUploaded.bind(this));
    }.bind(this));

    $(window).hashchange(this.hashchanged.bind(this));
}


Workspace.prototype = {

    hashchanged: function() {
        var d = dict_from_locationhash();
        if (this.urldata && this.urldata.project != d.project) {
            this.glyphlist = [];
            $('#glyph-switcher').empty();
        };

        this.metapolationView = null;
        this.htmldoc = new WorkspaceDocument(window.MFPARSER);

        this.urldata = dict_from_locationhash();
        $('#workspace').hide();
        $('#loading').show();

        $('#workspace').empty();
        $('#workspace').html($('#empty-workspace').html());

        $('#btn-add-axes').on('click', function() {
            var axes = this.htmldoc.addAxes();

            new Dropzone(axes.find('.axis'), {
                project_id: function() {return this.project_id || 0;}.bind(this)
            }, this.dataUploaded.bind(this));
        }.bind(this));

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
        if (!this.project_id) {
            location.hash = '#project/' + data.project_id;
            this.project_id = data.project_id;
        }

        var axes = this.htmldoc.getOrCreateAxes(data.label);
        axes.find('div[axis-label=' + data.label + ']').empty();
        var view = this.addView(axes, data.glyphs, data.master_id, data.versions, data.label);

        if (!this.metapolationView) {
            this.metapolationView = this.addView(axes, data.metaglyphs);
        }
        this.metapolationView.glyph.render(this.getEdgeData(data.metaglyphs.edges).contours);
    },

    addInterpolationSlider: function(axes) {
        var slider_template = '<div class="well"><b style="padding-right: 32px;">{0}</b> ' + 
                      '<input class="span2 slider-{2}" slider-label="{2}" type="text" value=""' + 
                      '         data-slider-min="-3" data-slider-max="3" data-slider-step="0.2"'  + 
                      '         data-slider-value="0" data-slider-orientation="horizontal"' + 
                      '         data-slider-selection="after" data-slider-tooltip="show"' + 
                      '         data-slider-handle="square" />' +
                      ' <b style="padding-left: 32px;">{1}</b></div>';

        var metap = axes.find('[axis-label]').map(function(i, el){
            return $(el).attr('axis-label');
        });

        metap = metap.get().join("");

        if (!$('#interpolations').find('.slider-' + metap).length) {
            var slider = $(String.format(slider_template, metap[0], metap[1], metap));
            $('#interpolations').append(slider);

            slider.find('input').slider().on('slideStop', function(e){
                $.post('/editor/save-metap/', {
                    project_id: this.project_id,
                    glyphname: this.glyphname,
                    label: $(e.target).attr('slider-label'),
                    value: e.value
                })
                .done(function(response){
                    var data = $.parseJSON(response);
                    this.metapolationView.element.empty();
                    var axes = this.htmldoc.getOrCreateAxes('A');
                    this.metapolationView = this.addView(axes, data.M);
                }.bind(this))
                .fail(function(){ alert('Could not change metapolation value') });
            }.bind(this));
            $('#interpolations').show();
        }
    },

    getEdgeData: function(edges) {
        var $glyph = this.urldata.glyph;

        if (!this.urldata.glyph) {
            this.glyphname = edges[0].glyph;
            return edges[0];
        }

        result = edges.filter(function(el){
            return el.glyph == $glyph;
        });

        if (!result.length) {
            this.glyphname = edges[0].glyph;
            return edges[0];
        };

        this.glyphname = result[0].glyph;
        return result[0];
    },

    addView: function(axes, data, master_id, versions, label) {
        this.addInterpolationSlider(axes);

        for (var k = 0; k < data.edges.length; k++) {
            if (this.glyphlist.indexOf(data.edges[k].glyph) < 0) {
                this.glyphlist.push(data.edges[k].glyph);

                var span = $('<span>');
                span.append(
                    $('<a>', {href: '#project/' + this.project_id + '/glyph/' + data.edges[k].glyph}).html(MFLIST[data.edges[k].glyph])
                );
                $('#glyph-switcher').append(span);
            }
            $('#btn-show-glyphs').show();
        }

        var edgedata = this.getEdgeData(data.edges);

        var view = this.htmldoc.addView(axes, edgedata, this.getPositionByLabel(label));

        view.glyph.render(edgedata.contours);

        if (versions) {
            view.setMaster(master_id);
            view.appendVersions(versions);
            view.appendLocalParameters();
            view.glyph.renderZPoints(edgedata.zpoints.points);
            view.onzpointdatachanged = this.onzpointchange.bind(this);
        }

        view.onGlyphChanged = function(view, data) {
            view.element.empty();
            this.addView(axes, data.glyphs, data.master_id, versions, view.getLabel());
            this.metapolationView.glyph.render(this.getEdgeData(data.metaglyphs.edges).contours);
        }.bind(this);

        view.getElement().removeClass('dropzone');

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
