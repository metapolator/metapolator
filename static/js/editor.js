/**
    @authors Vitaly Volkov (hash.3g@gmail.com)
    @version 0.1
**/

var AXES_PAIRS = [['A', 'B'], ['C', 'D'], ['E', 'F']]

function Editor() {
    this.editorAxes = $('.editor-axes');
    this.axes = [];
    this.project_id = 0;
}

Editor.prototype.addAxes = function() {
    var axes = $(this.editorAxes[0].outerHTML);
    $('.editor-container').append(axes);

    var dropzones = axes.find('.dropzone');
    dropzones.filedrop({
        fallback_id: 'upload_button',
        url: '/upload/',
        paramname: 'ufofile',
        withCredentials: true,
        data: {
            project_id: function() {return this.project_id}.bind(this)
        },

        dragOver: function(e) {
            var target = e.target;
            $(target).css('background', '#eee');
        },

        dragLeave: function(e) {
            var target = e.target;
            $(target).css('background', '#fff');
        },

        drop: function(e) {
            this.targetdrop = $(e.target);
        }.bind(this),

        error: function(err, file) {
            $('.dropzone').css('background', '#fff');
        }.bind(this),

        uploadFinished: function(i, file, response, time) {
            this.project_id = response.project_id;

            var axis = this.targetdrop.parent('div.axis');
            var position = axis.attr('axis-position');
            var pointform_html = $('#templateform').html();
            var settings_html = $('#settings').html();

            var dom_canvas_id = 'canvas-' + AXES_PAIRS[this.axes.length][position == 'left'? 0 : 1];
            axis_htmltemplate = $(String.format('<ul class="nav nav-tabs" style="clear: both;">' + 
                                                '  <li class="active"><a href="#tab-view-canvas-{0}" data-toggle="tab">View</a></li>' +
                                                '  <li><a href="#tab-point-canvas-{0}" data-toggle="tab">Point</a></li>' +
                                                '  <li><a href="#tab-settings-canvas-{0}" data-toggle="tab">Settings</a></li>' +
                                                '</ul>' +
                                                '<div class="tab-content">' +
                                                '  <div class="tab-pane active" id="tab-view-canvas-{0}">' +
                                                '    <canvas id="canvas-{0}" width="350" height="600"></canvas>' +
                                                '    <div class="canvas-{0}" style="display: none;">' +
                                                '      <a href="javascript:;" command="apply" class="btn btn-success">Apply</a>' +
                                                '      <a href="javascript:;" command="cancel" class="btn btn-danger">Cancel</a>' +
                                                '    </div>' +
                                                '  </div>' +
                                                '  <div class="tab-pane fade" id="tab-point-canvas-{0}">' + pointform_html + '</div>' + 
                                                '  <div class="tab-pane fade" id="tab-settings-canvas-{0}">' + settings_html + '</div>' + 
                                                '</div>', AXES_PAIRS[this.axes.length][position == 'left'? 0 : 1]));

            var header = $('<h4>').text('Font ' + AXES_PAIRS[this.axes.length][position == 'left'? 0 : 1]);
            axis.append(header);
            axis.append(axis_htmltemplate);

            var canvas = new Canvas(dom_canvas_id, response.data.R.width, response.data.R.height, 'a');
            canvas.setZpoints(response.data.zpoints);
            canvas.renderGlyph(response.data.R.edges);
            canvas.showbox();
            // A_canvas.onGlyphLoaded = M_canvas.redrawglyph.bind(M_canvas);
            canvas.draw();

            this.targetdrop.hide();
        }.bind(this)
    });
    axes.removeClass('fade');

    return axes;
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