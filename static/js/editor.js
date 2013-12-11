/**
    @authors Vitaly Volkov (hash.3g@gmail.com)
    @version 0.1
**/

var AXES_PAIRS = [['A', 'B'], ['C', 'D'], ['E', 'F']];

var slider_template = '<div style="margin-bottom: 16px;" class="row">' + 
                      '  <div class="col-md-2" style="text-align: center; font-size: 21pt;">{0}</div>' + 
                      '  <div class="col-md-8" style="text-align: center; padding-top: 8pt;">' + 
                      '    <input class="slider slider-{2}" slider-label="{2}" type="text" value=""' + 
                      '         data-slider-min="-3" data-slider-max="3" data-slider-step="0.1"'  + 
                      '         data-slider-value="0" data-slider-orientation="horizontal"' + 
                      '         data-slider-selection="after" data-slider-tooltip="show"' + 
                      '         data-slider-handle="square" />' + 
                      '  </div>' + 
                      '  <div class="col-md-2" style="text-align: center; font-size: 21pt;">{1}</div>' + 
                      '</div>';

function Editor(mode) {
    this.editorAxes = $('.editor-axes');
    this.mode = mode;
    this.metapCanvas = new Canvas('canvas-m');
    this.init();
}


Editor.prototype.init = function() {
    this.axes = [];
    this.project_id = 0;
    this.selectOptionMasters = [];
    this.editorglyph = 0;
    this.canvases = [];
}

Editor.prototype.onCreateMasterFromInstanceClick = function(e) {
    $(e.target).off('click').attr('disabled', 'disabled');
    $.post('/editor/create-master/', {
        project_id: this.project_id,
        masters: $('select.version option:selected').map(function(e, k){return $(k).val()}).toArray().join(),
        glyphname: this.editorglyph
    }).success(function(response) {
        var data = $.parseJSON(response);
        
        $('select.version').attr('master-id', data.master_id);
        this.create_select_versions(data.versions);

        $('select.version').trigger('change');
        $(e.target).on('click', this.onCreateMasterFromInstanceClick.bind(this)).removeAttr('disabled');
    }.bind(this)).error(function(response) {
        $(e.target).on('click', this.onCreateMasterFromInstanceClick.bind(this)).removeAttr('disabled');
        alert($.parseJSON(response.responseText).error);
    }.bind(this));
}


Editor.prototype.onCreateInstanceClick = function(e) {
    $(e.target).off('click').attr('disabled', 'disabled');
    $.post('/editor/create-instance/', {
        project_id: this.project_id,
        masters: $('select.version option:selected').map(function(e, k){return $(k).val()}).toArray().join()
    }).success(function(response) {
        $(e.target).on('click', this.onCreateInstanceClick.bind(this)).removeAttr('disabled');
        window.open('/specimen/' + this.project_id + '/');
    }.bind(this)).error(function() {
        $(e.target).on('click', this.onCreateInstanceClick.bind(this)).removeAttr('disabled');
    }.bind(this));
}

Editor.prototype.addAxes = function() {
    var axes = $(this.editorAxes[0].outerHTML);
    $('.editor-container').append(axes);

    if (!this.axes.length) {
        var metaxes = $('<div id="metapolation">' +
                        '  <h4>Metapolation</h4>' +
                        '  <a href="javascript:;" id="btn-master-from-instance" class="btn btn-xs btn-success">Create master</a>' +
                        '  <a href="javascript:;" id="btn-instance" class="btn btn-xs btn-success">Create instance</a>' +
                        '  <canvas width="350" height="600" id="canvas-m"></canvas>' + 
                        '</div>');
        axes.find('div[axis-position=middle]').append(metaxes);
        metaxes.find('#btn-master-from-instance').on('click', this.onCreateMasterFromInstanceClick.bind(this));
        metaxes.find('#btn-instance').on('click', this.onCreateInstanceClick.bind(this));
    }

    axes.find('.axis[axis-position=left]').attr('axis-label', AXES_PAIRS[this.axes.length][0]);
    axes.find('.axis[axis-position=right]').attr('axis-label', AXES_PAIRS[this.axes.length][1]);

    axes.removeClass('fade');
    this.axes.push(axes);

    if (this.mode != 'controlpoints' || this.axes.length > 1) {
        $('#btn-add-axes').hide();
    }

    this.initializeDropzone(axes);

    return axes;
}

Editor.prototype.initializeDropzone = function(axes) {
    var dropzones = axes.find('.filedrop');
    dropzones.filedrop({
        fallback_id: 'upload_button',
        url: '/upload/',
        paramname: 'ufofile',
        withCredentials: true,
        data: {
            project_id: function() {return this.project_id}.bind(this),
            masters: function() {return $('select.version option:selected').map(function(e, k){return $(k).val()}).toArray().join()},
            label: function() {return this.dropzone_label}.bind(this)
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
            this.dropzone_label = $(e.target).parents('.axis').attr('axis-label');
        }.bind(this),

        error: function(err, file) {
            $('.filedrop').css('background', '#fff');
        }.bind(this),

        uploadFinished: function(i, file, response, time) {
            if (!this.project_id) {
                location.hash = '#project/' + response.project_id;
            } else {
                var exists = $(this.canvases).filter(function(){return this.canvasid == 'canvas-' + response.label});
                if (!exists.length){
                    this.initializeWorkspace(response);
                } else {
                    $.post('/editor/reload/', 
                           {project_id: response.project_id,
                            master_id: response.master_id,
                            glyphname: this.editorglyph,
                            masters: $('select.version option:selected').map(function(e, k){return $(k).val()}).toArray().join()
                    }).success(function(masterdata, response){
                        for (var k = 0; k < this.canvases.length; k++) {
                            if (this.canvases[k].canvasid == 'canvas-' + masterdata.label) {
                                this.canvases[k].reloadCanvas(response);
                                var select = $('#canvas-' + masterdata.label).parents('.axis').find('select.version')
                                select.attr('master-id', masterdata.master_id);
                                break;
                            }
                        }
                        this.create_select_versions(masterdata.versions);
                    }.bind(this, response));
                }
            }
        }.bind(this)
    });
}


Editor.prototype.create_select_versions = function(versions, $axis) {
    $('select.version').empty();
    for (var k = 0; k < versions.length; k++) {
        var optionMaster = $('<option>', {
            value: versions[k].master_id,
            text: 'Load master ' + versions[k].version
        })
        $('select.version').each(function() {
            var option = $(optionMaster.clone());
            var $this = $(this);
            if (option.val() == $(this).attr('master-id')) {
                option.attr('selected', 'true');
            }
            $this.append(option);
        });
    }
}


Editor.prototype.initializeWorkspace = function(response) {
    this.project_id = response.project_id;
    if (!this.editorglyph) {
        this.editorglyph = response.glyphname;
    }

    var axis = $('div.axis[axis-label=' + response.label + ']');
    var label = response.label;
    var pointform_html = $('#templateform').html();
    var settings_html = $('#settings').html();

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

    if (this.mode == 'controlpoints') {
        $(axis_htmltemplate[0]).css('display', 'none');
    }
    axis_htmltemplate.find('canvas').attr('glyph-project-id', response.project_id)
        .attr('glyph-master-id', response.master_id);

    var header = $('<h4>').text(label);
    axis.find('.dropzone').hide();
    axis.append(header);

    var select = $('<select>').attr('master-id', response.master_id).addClass('version');
    axis.append(select);

    this.create_select_versions(response.versions, axis);

    axis.append(axis_htmltemplate);

    $.post('/editor/reload/', {project_id: response.project_id,
                               master_id: response.master_id,
                               glyphname: this.editorglyph,
                               masters: $('select.version option:selected').map(function(e, k){return $(k).val()}).toArray().join()
    })
    .success(this.onCanvasDataReceived.bind(this, label, response.metapolation))
    .error(function(){ alert('Could not receive data from server'); });
}

Editor.prototype.onCanvasVersionChanged = function(canvas, e) {
    var newmasterid = $(e.target).val();
    $(e.target).attr('master-id', newmasterid);
    
    $.post('/editor/reload/',{
        project_id: this.project_id,
        master_id: newmasterid,
        glyphname: this.editorglyph,
        masters: $('select.version option:selected').map(function(e, k){return $(k).val()}).toArray().join()
    }).success(canvas.reloadCanvas.bind(canvas));
}

Editor.prototype.onCanvasDataReceived = function(canvaslabel, sliderlabel, response) {
    var data = $.parseJSON(response);
    var canvas = new Canvas('canvas-' + canvaslabel, 'a');
    canvas.initialize()
    canvas.renderGlyph(data.R);
    canvas.setZpoints(data.zpoints);
    canvas.showbox();
    canvas.onGlyphLoaded = this.metapCanvas.redrawglyph.bind(this.metapCanvas);
    canvas.draw();

    this.canvases.push(canvas);

    this.metapCanvas.initialize();
    this.metapCanvas.redrawglyph(response);

    $('div.axis[axis-label=' + canvaslabel + ']').find('select').on('change',this.onCanvasVersionChanged.bind(this, canvas));

    if (!$('#metapolation').find('.slider-' + sliderlabel).length) {
        var slider = $(String.format(slider_template, sliderlabel[0], sliderlabel[1], sliderlabel));
        $('#metapolation').append(slider);
        slider.find('.slider').slider().on('slideStop', function(e){
            $.post('/editor/save-metap/', {
                project_id: this.project_id,
                glyphname: this.editorglyph,
                label: $(e.target).attr('slider-label'),
                masters: $('select.version option:selected').map(function(e, k){return $(k).val()}).toArray().join(),
                value: e.value
            })
            .success(this.metapCanvas.redrawglyph.bind(this.metapCanvas))
            .error(function(){ alert('Could not change metapolation value') });
        }.bind(this));
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
