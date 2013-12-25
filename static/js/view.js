var AXES_PAIRS = [['A', 'B'], ['C', 'D'], ['E', 'F']];


function View(element) {
    this.element = element;

    this.pointform = $(element).find('form.pointform');
    this.zpointdropdown = this.pointform.find('select#zpoint');

    this.zpointdropdown.on('change', this.onzpointchanged.bind(this));
    this.pointform.on('submit', this.onpointformsubmit.bind(this));
}


View.prototype = {

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
        e.preventDefault();
        if (!this.zpointdropdown.val()) {
            return;
        }
        var option = $(e.target).find('option:selected');
        var data = $.parseJSON(option.attr('point-params'));

        var obj = $(e.target).serializeObject();


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

    onzpointchanged: function(e) {
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
    var templates = $('#templates');
    
    this.workspace = $('#workspace');
    
    this.tmplAxes = templates.find('.editor-axes');

    this.startpage = $('#startpage');

    this.tmplTabs = $($('#view').html());

    this.axes = [];
    
    this.mode = mode;

    this.metaView = null;
}


WorkspaceDocument.prototype = {

    getOrCreateAxes: function(label) {
        var axis = $('.axis[axis-label=' + label + ']');
        if (!axis.length) {
            return this.addAxes();
        }
        return $(axis.parents('.editor-axes'));
    },

    getMetapolationView: function() {
        return this.metaView;
    },
    
    /*
     * Put to the page new row with axes
     */
    addAxes: function() {
        var axes = this.tmplAxes.clone().css('display', 'block');
        this.workspace.append(axes);

        if (!this.axes.length) {
            this.metaView = this.addView(axes, 'middle');
        }

        if (this.mode != 'controlpoints' || this.axes.length > 1) {
            $('#btn-add-axes').hide();
        }

        this.assignPositionedAxisLabel(axes, 'left');
        this.assignPositionedAxisLabel(axes, 'right');

        this.axes.push(axes);

        return axes;
    },

    getViewLabel: function (axis) {
        return axis.attr('axis-label');
    },

    /*
     * Put to axis view with tabs navigation or single canvas
     */
    addView: function(axes, position) {
        var axis = this.findPositionedAxis(axes, position);

        if (this.mode != 'controlpoints' && position != 'middle') {
            this.appendAxisTabNavigation(axis);
        } else {
            this.appendAxisSingleCanvas(axis);
        }

        $(this.startpage).hide();
        $(this.workspace).show();

        return new View(axis);
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