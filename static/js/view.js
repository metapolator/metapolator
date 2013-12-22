var AXES_PAIRS = [['A', 'B'], ['C', 'D'], ['E', 'F']];

function View(mode) {
    var templates = $('#templates');
    
    this.workspace = $('#workspace');
    
    this.tmplAxes = templates.find('.editor-axes');
    
    this.metapolationCell = templates.find('.metapolation');

    this.startpage = $('#startpage');

    this.tmplTabs = $($('#view').html());

    this.axes = [];
    
    this.mode = mode;
}


View.prototype = {
    
    /*
     * Put to the page new row with axes
     */
    addAxes: function() {
        var axes = this.tmplAxes.clone().css('display', 'block');
        this.workspace.append(axes);

        if (!this.axes.length) {
            axes.find('div[axis-position=middle]').append(this.metapolationCell);
        }

        if (this.mode != 'controlpoints' || this.axes.length > 1) {
            $('#btn-add-axes').hide();
        }

        leftaxis = this.assignPositionedAxisLabel(axes, 'left');
        rightaxis = this.assignPositionedAxisLabel(axes, 'right');

        if (this.mode != 'controlpoints') {
            this.appendAxisTabNavigation(leftaxis);
            this.appendAxisTabNavigation(rightaxis);
        } else {
            this.appendAxisSingleCanvas(leftaxis);
            this.appendAxisSingleCanvas(rightaxis);
        }

        this.startpage.css('display', 'none');
        $('#workspace').show();

        this.axes.push(axes);
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

    /*
     * Assign axis-label to positioned axis
     */
    assignPositionedAxisLabel: function(axes, position) {
        var axis = axes.find('.axis[axis-position=' + position + ']');
        var index = position == 'left' ? 0 : 1;
        return axis.attr('axis-label', AXES_PAIRS[this.axes.length][index]);
    }

}