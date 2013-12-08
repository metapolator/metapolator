/**
    @authors Vitaly Volkov (hash.3g@gmail.com)
    @version 0.1
**/

var AXES_PAIRS = [['A', 'B'], ['C', 'D'], ['E', 'F']]

function Editor(mode) {
    this.editorAxes = $('.editor-axes');
    this.axes = [];
    this.project_id = 0;
    this.mode = mode;
}

var slider_template = '<div style="margin-bottom: 16px;" class="row">' + 
                      '  <div class="col-md-2" style="text-align: center; font-size: 21pt;">{0}</div>' + 
                      '  <div class="col-md-8" style="text-align: center; padding-top: 8pt;">' + 
                      '    <input class="slider slider-{2}" slider-label="{2}" type="text" value=""' + 
                      '         data-slider-min="0" data-slider-max="1" data-slider-step="0.1"'  + 
                      '         data-slider-value="0" data-slider-orientation="horizontal"' + 
                      '         data-slider-selection="after" data-slider-tooltip="show"' + 
                      '         data-slider-handle="square" />' + 
                      '  </div>' + 
                      '  <div class="col-md-2" style="text-align: center; font-size: 21pt;">{1}</div>' + 
                      '</div>';

Editor.prototype.addAxes = function() {
    var axes = $(this.editorAxes[0].outerHTML);
    $('.editor-container').append(axes);

    if (!this.axes.length) {
        var metaxes = $('<div id="metapolation">' +
                        '  <h4>Metapolation</h4>' +
                        '  <a href="javascript:;" class="btn btn-large btn-success">Create master from instance</a>' +
                        '  <canvas width="350" height="600" id="canvas-m"></canvas>' + 
                        '</div>').css('display', 'none');
        axes.find('div[axis-position=middle]').append(metaxes);
    }

    axes.find('.axis[axis-position=left]').attr('axis-label', AXES_PAIRS[this.axes.length][0]);
    axes.find('.axis[axis-position=right]').attr('axis-label', AXES_PAIRS[this.axes.length][1]);

    var dropzones = axes.find('.dropzone');
    dropzones.filedrop({
        fallback_id: 'upload_button',
        url: '/upload/',
        paramname: 'ufofile',
        withCredentials: true,
        data: {
            project_id: function() {return this.project_id}.bind(this),
            masters: function() {return $('canvas.paper').map(function(e, k){return $(k).attr('glyph-master-id')}).toArray().join()},
            label: function() {return this.targetdrop.parent().attr('axis-label')}.bind(this)
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
            if (!this.editorglyph) {
                this.editorglyph = response.glyphname;
            }

            var axis = $('div.axis[axis-label=' + response.label + ']');
            var label = response.label;
            var pointform_html = $('#templateform').html();
            var settings_html = $('#settings').html();
            var metapolation_label = response.metapolation;

            var dom_canvas_id = 'canvas-' + label;
            axis_htmltemplate = $(String.format('<ul class="nav nav-tabs" style="clear: both;">' + 
                                                '  <li class="active"><a href="#tab-view-canvas-{0}" data-toggle="tab">View</a></li>' +
                                                '  <li><a href="#tab-point-canvas-{0}" data-toggle="tab">Point</a></li>' +
                                                '  <li><a href="#tab-settings-canvas-{0}" data-toggle="tab">Settings</a></li>' +
                                                '</ul>' +
                                                '<div class="tab-content">' +
                                                '  <div class="tab-pane active" id="tab-view-canvas-{0}">' +
                                                '    <canvas id="canvas-{0}" width="350" height="600" class="paper"></canvas>' +
                                                '    <div class="canvas-{0}" style="display: none;">' +
                                                '      <a href="javascript:;" command="apply" class="btn btn-success">Apply</a>' +
                                                '      <a href="javascript:;" command="cancel" class="btn btn-danger">Cancel</a>' +
                                                '    </div>' +
                                                '  </div>' +
                                                '  <div class="tab-pane fade" id="tab-point-canvas-{0}">' + pointform_html + '</div>' + 
                                                '  <div class="tab-pane fade" id="tab-settings-canvas-{0}">' + settings_html + '</div>' + 
                                                '</div>', label));

            axis_htmltemplate.find('canvas').attr('glyph-project-id', response.project_id)
                .attr('glyph-master-id', response.master_id);

            var header = $('<h4>').text(label);
            axis.find('.dropzone').hide();

            axis.append(header);
            axis.append(axis_htmltemplate);

            $.post('/editor/reload/', {project_id: response.project_id,
                                       master_id: response.master_id,
                                       glyphname: this.editorglyph,
                                       masters: $('canvas.paper').map(function(e, k){return $(k).attr('glyph-master-id')}).toArray().join()})
                .success(function(response){
                    var data = $.parseJSON(response);
                    var canvas = new Canvas(dom_canvas_id, data.R.width, data.R.height, 'a');
                    canvas.setZpoints(data.zpoints);
                    canvas.renderGlyph(data.R.edges);
                    canvas.showbox();

                    if (!this.metapCanvas) {
                        this.metapCanvas = new Canvas('canvas-m', data.M.width, data.M.height);
                        this.metapCanvas.renderGlyph(data.M.edges);
                        this.metapCanvas.draw();
                        $('#metapolation').show();
                    }
                    canvas.onGlyphLoaded = this.metapCanvas.redrawglyph.bind(this.metapCanvas);
                    canvas.draw();

                    if (!$('#metapolation').find('.slider-' + metapolation_label).length) {
                        var slider = $(String.format(slider_template, metapolation_label[0], metapolation_label[1], metapolation_label));
                        $('#metapolation').append(slider);
                        slider.find('.slider').slider().on('slideStop', function(e){
                            $.post('/editor/save-metap/', {
                                project_id: this.project_id,
                                glyphname: this.editorglyph,
                                label: $(e.target).attr('slider-label'),
                                masters: $('canvas.paper').map(function(e, k){return $(k).attr('glyph-master-id')}).toArray().join(),
                                value: e.value
                            })
                            .success(function(response){
                                this.metapCanvas.redrawglyph(response);
                            }.bind(this));
                        }.bind(this));
                    }

                }.bind(this))

        }.bind(this)
    });
    axes.removeClass('fade');
    this.axes.push(axes);

    if (this.mode != 'controlpoints' || this.axes.length > 1) {
        $('#btn-add-axes').hide();
    }
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