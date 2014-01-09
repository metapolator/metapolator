var AXES_PAIRS = [['A', 'B'], ['C', 'D'], ['E', 'F']];


function BaseView(element) {
    this.element = $(element);
}

BaseView.prototype = {
    attachGlyph: function(glyphdata) {
        this.glyph = new Glyph(this, {width: glyphdata.width, height: glyphdata.height});
        this.glyphname = glyphdata.name;
    },

    getElement: function() {
        return this.element;
    },

    getDrawing: function() {
        return this.element.find('canvas')[0];
    }
}


function View(element, master_id) {
    this.element = $(element);
    this.setMaster(master_id);

    this.element.on('upload', function() {
        // alert('ok');
    });
    this.element.dropzone({master_id: master_id,
                           label: this.element.attr('axis-label')});
}


View.prototype = {

    attachForms: function() {
        this.pointform = this.element.find('form.pointform');
        this.zpointdropdown = this.pointform.find('select#zpoint');
        this.settingsform = this.element.find('.localparamform');

        this.zpointdropdown.on('change', this.onzpointselected.bind(this));
        this.pointform.on('keydown', this.onpointformsubmit.bind(this));
    },

    attachGlyph: function(glyphdata) {
        this.glyph = new Glyph(this, {width: glyphdata.width, height: glyphdata.height});
        this.glyph.onZPointChanged = this.onzpointchange.bind(this);
        this.glyphname = glyphdata.name;
    },

    onzpointchange: function(glyph, zpoint) {
        this.onzpointdatachanged && this.onzpointdatachanged(glyph, zpoint);
    },

    getMaster: function() {
        return this.master_id;
    },

    setMaster: function(master_id) {
        this.master_id = master_id;
    },

    appendLocalParameters: function() {
        var form = new LocalParamForm(this.settingsform);

        var sw1 = new LocalParamSwitcher({
            source: $(this.settingsform.find('select#idlocal')),
            listener: form,
            data: {
                master_id: function() {return this.getMaster();}.bind(this), 
                glyph: function() {return this.glyphname;}.bind(this),
                axislabel: this.getLabel()
            },
            onFormSubmitted: this.onlocalparam_formsubmit.bind(this)
        });
    },

    /*
     * Put to metapolation cell buttons to create master from instance
     * and create instance.
     */
    appendActionButtons: function(handlers) {
        var div = $('<div>').addClass('action-buttons');
        div.append($('#metapolation-buttons').html());

        div.find('#btn-instance').on('click', function(e){
            $(e.target).attr('disabled', 'disabled');
            handlers.onInstanceCreated(function(){
                $(e.target).removeAttr('disabled');
            });
        }.bind(this));

        div.find('#btn-master-from-instance').on('click', function(e){
            $(e.target).attr('disabled', 'disabled');
            handlers.onMasterCreated(function(){
                $(e.target).removeAttr('disabled');
            });
        }.bind(this));

        this.getElement().prepend(div);
    },

    appendVersions: function(versions) {
        this.versionselect = $('<select>').addClass('version').css('margin-bottom', '16px');
        for (var k = 0; k < versions.length; k++) {
            var optionMaster = $('<option>', {
                value: versions[k].master_id,
                text: versions[k].name + ' ' + versions[k].version
            });
            if (versions[k].master_id == this.master_id) {
                optionMaster.attr('selected', 'true');
            }
            this.versionselect.append(optionMaster);
        }

        this.versionselect.on('change', function(e) {
            $.post('/editor/reload/', {
                'master_id': $(e.target).val(),
                'glyphname': this.glyphname,
                'axislabel': this.getLabel()
                }
            ).done(function(response){
                var data = $.parseJSON(response);
                this.onGlyphChanged && this.onGlyphChanged(this, data);
            }.bind(this));
        }.bind(this));

        this.getElement().prepend(this.versionselect);
    },

    getGlyph: function(glyphdata) {
        return this.glyph;
    },

    onlocalparam_formsubmit: function(response) {
        this.onGlyphChanged && this.onGlyphChanged(this, response);
    },

    getElement: function() {
        return this.element;
    },

    getLabel: function() {
        return this.element.attr('axis-label');
    },

    getDrawing: function() {
        return this.element.find('canvas')[0];
    },

    updatePointOption: function(zpoint) {
        var option = this.pointform.find('select option:selected');
        option.attr('point-params', JSON.stringify(zpoint));
    },

    addPointToOption: function(zpoint) {
        if (!this.pointform.length)
            return;

        var dropdown = this.pointform.find('select');
        var option = $('<option>').text(zpoint.data.pointname).val(zpoint.data.pointname);

        option.attr('point-params', JSON.stringify(zpoint));
        dropdown.append(option);
    },

    onpointformsubmit: function(e) {
        if (e.which != 13) {
            return true;
        }

        if (!this.zpointdropdown.val()) {
            return false;
        }
        var option = this.pointform.find('option:selected');
        var data = $.parseJSON(option.attr('point-params'));

        var obj = this.pointform.serializeObject();


        $.extend(data.data, obj);
        var data = {
            x: obj.x,
            y: obj.y,
            data: data.data
        };

        delete data.data.x;
        delete data.data.y;
        this.onPointParamSubmit && this.onPointParamSubmit(data);
    },

    onzpointselected: function(e) {
        var option = $(e.target).find('option:selected');
        var data = $.parseJSON(option.attr('point-params'))
        this.setPointFormValues(data);

        this.afterPointChanged && this.afterPointChanged(data);
    },

    setPointFormValues: function(data) {
        this.pointform.find('select option:selected').removeAttr('selected');

        this.zpointdropdown.val(data.data.pointname);

        var inputs = this.pointform.find('input');
        for (var idx = 0; idx < inputs.length; idx++) {
            var input = $(inputs[idx]);
            if (input.attr('name') != 'x' && input.attr('name') != 'y') {
                input.val(data.data[input.attr('name')]);
            } else {
                input.val(data[input.attr('name')]);
            }
        }

        return;
    }

}


function WorkspaceDocument(mode) {
    this.workspace = $('#workspace');
    
    var templates = $('#templates');
    this.tmplAxes = templates.find('.editor-axes');
    this.tmplTabs = $($('#view').html());
    this.axes = [];
    this.mode = mode;
    this.interpolationsliders = $('#interpolations');
}


WorkspaceDocument.prototype = {

    setMode: function(mode) {
        this.mode = mode;
    },

    getMode: function() {
        return this.mode;
    },

    getOrCreateAxes: function(label) {
        var axis = $('.axis[axis-label=' + label + ']');
        if (!axis.length) {
            return this.addAxes();
        }
        return $(axis.parents('.editor-axes'));
    },
    
    /*
     * Put to the page new row with axes
     */
    addAxes: function() {
        var axes = this.tmplAxes.clone().css('display', 'block');
        this.workspace.find('.editor').append(axes);

        this.assignPositionedAxisLabel(axes, 'left');
        this.assignPositionedAxisLabel(axes, 'right');

        this.axes.push(axes);

        if (this.mode != 'controlpoints' || this.axes.length > 1) {
            $('#btn-add-axes').hide();
        }

        $(this.workspace).show();

        return axes;
    },

    getViewLabel: function (axis) {
        return axis.attr('axis-label');
    },

    /*
     * Put to axis view with tabs navigation or single canvas
     */
    addView: function(axes, glyphdata, position) {
        var axis = this.findPositionedAxis(axes, position);

        if (this.mode != 'controlpoints' && position != 'middle') {
            this.appendAxisTabNavigation(axis);
        } else {
            this.appendAxisSingleCanvas(axis);
        }

        $(this.workspace).show();
        $(this.interpolationsliders).show();

        return new View(axis, glyphdata);
    },

    createView: function(axis, master_id) {
        return new View(axis, master_id);
    },

    createMetapolationView: function() {
        if (!this.axes.length)
            return;
        var axis = this.axes[0].find('div[axis-position=middle]')
        return new BaseView(axis);
    },

    /*
     * Append to axis single canvas. This method related to active 
     * tab on template as it make a copy of this one.
     */
    appendAxisSingleCanvas: function(axis) {
        var canvas = $(this.tmplTabs.find('.tab-pane.active').html());
        axis.append(canvas);
    },

    /*
     * Append to axis tab navigation. Each tab has unique label 
     * that used to make tabs unique in page with several axis.
     */
    appendAxisTabNavigation: function(axis) {
        var domtab = this.tmplTabs.clone();
        var tabs = domtab.find('a[data-toggle=tab]');

        $(tabs[0]).attr('href', '#glyph-' + axis.attr('axis-label'));
        $(tabs[1]).attr('href', '#point-' + axis.attr('axis-label'));
        $(tabs[2]).attr('href', '#param-' + axis.attr('axis-label'));

        var panes = domtab.find('.tab-pane');
        $(panes[0]).attr('id', 'glyph-' + axis.attr('axis-label'));
        $(panes[1]).attr('id', 'point-' + axis.attr('axis-label'));
        $(panes[2]).attr('id', 'param-' + axis.attr('axis-label'));

        axis.append(domtab);
    },

    findPositionedAxis: function(axes, position) {
        return axes.find('div[axis-position=' + position + ']')
    },

    /*
     * Assign axis-label to positioned axis
     */
    assignPositionedAxisLabel: function(axes, position) {
        var axis = this.findPositionedAxis(axes, position);
        var index = position == 'left' ? 0 : 1;
        return axis.attr('axis-label', AXES_PAIRS[this.axes.length][index]);
    }

}


$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};