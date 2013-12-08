function ControlPoints(dataPoints, canvasid) {
  this.dataPoints = dataPoints;
  this.pointform = $("#tab-point-" + canvasid).find('form.extended');
  this.paths = [];
  this.texts = [];
}


ControlPoints.prototype.drawOn = function(canvas) {
  for (var k = 0; k < this.paths.length; k++) {
    this.paths[k].gpath.remove();
    this.texts[k].remove();
  }
  this.paths = [];
  this.texts = [];
  for (var i = 0; i < this.dataPoints.points.length; i++) {
    var datapoint = this.dataPoints.points[i];
    if (!datapoint.iszpoint) {
      continue;
    }

    pp = canvas.getPoint(Number(datapoint.x), Number(datapoint.y));
    ppr = canvas.restore_original_coords(pp);
    console.log("{x: " + datapoint.x + ", y:" + datapoint.y + "}" + ' - ' + pp + ' - ' + "{x: " + ppr.x + ", y:" + ppr.y + "}");
    var point = canvas.getPoint(Number(datapoint.x), 500 - Number(datapoint.y));
    point.y += +200;

    var gpath = canvas.paper.Path.Rectangle(point, 1);
    gpath.strokeColor = 'green';
    gpath.closed = true;
    gpath.selected = true;

    var text = new canvas.paper.PointText(point);
    text.justification = 'center';
    text.fillColor = 'black';
    // text.content = datapoint.data.glyphoutline_id + ' = ' + datapoint.data.pointname + " (" + datapoint.x + ", " + datapoint.y +")";
    text.content = datapoint.data.pointname;
    this.texts.push(text);

    datapoint.data.x = point.x;
    datapoint.data.y = point.y;
    this.paths.push({gpath: gpath, point: point, data: datapoint.data});

    this.pointform
      .find('select')
      .append($('<option>', {value: datapoint.data.pointname,
                              text: datapoint.data.pointname}));
  }
}


function GlyphOrigin(dataGlyph) {
  this.dataGlyph = dataGlyph;
  this.paths = [];
}

GlyphOrigin.prototype.delete = function() {
  for (var k = 0; k < this.paths.length; k++) {
    this.paths[k].remove();
  }
}

GlyphOrigin.prototype.drawOn = function(canvas) {
  canvas.paper.activate();
  this.delete();

  this.paths = [];
  for (var i = 0; i < this.dataGlyph.length; i++) {
      for (var j = 0; j < this.dataGlyph[i].contours.length; j++) {
          var path = new canvas.paper.Path();
          var contours = this.dataGlyph[i].contours[j];
          for (var k = 0; k < contours.length; k++) { // contours.length
              contour = contours[k];

              var point = canvas.getPoint(Number(contour.x), 500 - Number(contour.y));
              point.y += +200;
              var handleIn = canvas.getPoint(Number(contour.controls[0].x) - Number(contour.x),
                                       Number(contour.y) - Number(contour.controls[0].y));
              var handleOut = canvas.getPoint(Number(contour.controls[1].x) - Number(contour.x),
                                        Number(contour.y) - Number(contour.controls[1].y));
              var segment = new canvas.paper.Segment(point, handleIn, handleOut);

              path.add(segment);
          }
          path.fillColor = {
              hue: 360 * Math.random(),
              saturation: 1,
              brightness: 1,
              alpha: 0.5
          };
          path.closed = true;
          path.strokeColor = new canvas.paper.Color(0.5, 0, 0.5);
          this.paths.push(path);
      }
  }

  canvas.draw();
}


function resize(canvas, x, y, width, height, newwidth, newheight) {
    var ratio = width / height;
    var w, h, nx, ny;

      // w = newwidth;
      // h = w / ratio;
    if (canvas.width > canvas.height) {
      w = newwidth;
      h = w / ratio;
    } else {
      h = newheight;
      w = h * ratio;
    }
    console.log(w + '*' + x + '/' + width);
    nx = w * x / width;
    ny = h * y / height;
    return {x: nx, y: ny}
}

function Canvas(canvasid, width, height, source) {
  this.canvasid = canvasid;
  this.paper = new paper.PaperScope();
  this.paper.setup(canvasid);

  this.width = Number(width);
  this.height = Number(height);
  this.source = source;

  this.tool = new this.paper.Tool();

  if (this.source) {
    this.tool.onMouseDown = this.onMouseDown.bind(this);
    this.tool.onMouseUp = this.onMouseUp.bind(this);
    this.tool.onMouseDrag = this.onMouseDrag.bind(this);
  }
}

Canvas.prototype.getPoint = function(x, y) {
  var r = resize(this, x, y, this.width, this.height, 350 - 100, 350 - 100);
  return new this.paper.Point(r.x, r.y);
}

Canvas.prototype.restore_original_coords = function(point) {
  return resize(this, point.x, point.y, 350 - 100, 350 - 100, this.width, this.height);
}

Canvas.prototype.renderGlyph = function(edges) {
  this.paper.activate();
  this.glyphorigin = new GlyphOrigin(edges);
  this.glyphorigin.drawOn(this);
}

Canvas.prototype.onMouseDown = function(event) {
  this.currentpath = null;
  for (var k = 0; k < this.controlpoints.paths.length; k++) {
    var p = this.controlpoints.paths[k].gpath.segments[0].point;
    if (p.getDistance(event.point) < 5) {
      this.currentpath = this.controlpoints.paths[k];
      this.box.position = event.point;
      this.isdragged = false;
      return;
    };
  }
}

Canvas.prototype.onMouseDrag = function(event) {
  if (!this.currentpath) {
    return;
  }
  this.box.position = event.point;
  this.currentpath.gpath.position = event.point;
  this.isdragged = true;
};


Canvas.prototype.onMouseUp = function(event) {
  if (this.currentpath) {
    if (this.isdragged) {
      var x = event.point.x;
      var y = event.point.y - 200;
      var xycoord = this.restore_original_coords(new paper.Point(x, y));
      $.ajax({
          type: 'post',
          data: {id: this.currentpath.data.glyphoutline_id,
                   x: xycoord.x,
                   y: 500 - xycoord.y,
                   project_id: $('#' + this.canvasid).attr('glyph-project-id'),
                   master_id: $('#' + this.canvasid).attr('glyph-master-id'),
                   masters: $('canvas.paper').map(function(e, k){return $(k).attr('glyph-master-id')}).toArray().join()
          },
          url: 'save-point/',
          success: function(data) {
              this.controlpoints.dataPoints = $.parseJSON(data).zpoints;
              this.controlpoints.drawOn(this);

              this.glyphorigin.dataGlyph = $.parseJSON(data).R.edges;
              this.glyphorigin.drawOn(this);

              if (this.onGlyphLoaded) {
                this.onGlyphLoaded(data);
              }
          }.bind(this)
      });
    } else {
      var e = event.event;
      
      var zpointname = this.currentpath.data.pointname;
      var inputs = this.controlpoints.pointform.find('input');
      this.controlpoints.pointform.find('select')
          .find('option:selected', 'select[name="options"]')
          .removeAttr('selected');
      this.controlpoints.pointform.find('select').val(zpointname);

      for (var idx = 0; idx < inputs.length; idx++) {
        var input = $(inputs[idx]);
        input.val(this.currentpath.data[input.attr('name')]);
      }
    };
  };
};


Canvas.prototype.saveParamRequest = function(data, successhandler) {
  data.id = this.currentpath.data.id;
  var x = Number(data.x);
  var y = Number(data.y) - 200;
  var xycoord = this.restore_original_coords(new paper.Point(x, y));
  data.x = xycoord.x;
  data.y = 500 - xycoord.y;
  data.project_id = $('#' + this.canvasid).attr('glyph-project-id');
  data.master_id = $('#' + this.canvasid).attr('glyph-master-id');
  $.post('save-param/', data)
        .fail(this.saveParamException.bind(this))
        .success(successhandler || this.saveParamSuccess.bind(this));
}

Canvas.prototype.saveParamException = function() {
    var val = this.controlpoints.pointform.find('input[type=text]').val();
    alert("updating parameter has been failed");
}

Canvas.prototype.saveParamCanceled = function(data) {}

Canvas.prototype.saveParamSuccess = function(data) {
    var glyphpreview = new GlyphOrigin($.parseJSON(data).R.edges);
    glyphpreview.drawOn(this);

    var buttons = $('.' + this.canvasid);
    buttons.css('display', 'block');

    buttons.find('a').off('click').on('click', function(e){
      glyphpreview.delete();
      buttons.css('display', 'none');
      this.draw();

      if ($(e.target).attr('command') == 'cancel') {
        this.saveParamRequest(this.currentpath.data, this.saveParamCanceled.bind(this));
      } else {
        this.controlpoints.dataPoints = $.parseJSON(data).zpoints;
        this.controlpoints.drawOn(this);
        
        this.glyphorigin.dataGlyph = $.parseJSON(data).R.edges;
        this.glyphorigin.drawOn(this);
      }

      if (this.onGlyphLoaded) {
        this.onGlyphLoaded(data);
      }
    }.bind(this));
}

Canvas.prototype.setZpoints = function(json) {
  this.controlpoints = new ControlPoints(json, this.canvasid);
  this.controlpoints.drawOn(this);

  this.controlpoints.pointform.find('select')
    .on('change', function(e) {
      
      var zpointname = $(e.target).val();
      if (!zpointname) {
        this.controlpoints.pointform.find('input').val('');
        this.currentpath = null;
      }
      for (var k = 0; k < this.controlpoints.paths.length; k++) {
        if (this.controlpoints.paths[k].data.pointname == zpointname) {
          this.currentpath = this.controlpoints.paths[k];
          this.box.position = this.currentpath.gpath.segments[0].point;

          var inputs = this.controlpoints.pointform.find('input');
          for (var idx = 0; idx < inputs.length; idx++) {
            var input = $(inputs[idx]);
            input.val(this.currentpath.data[input.attr('name')]);
          }

          return;
        }
      }

    }.bind(this))

    this.controlpoints.pointform.on('submit', function(e){
      e.preventDefault();
      var zpointname = $(e.target).find('select').val();
      for (var k = 0; k < this.controlpoints.paths.length; k++) {
        if (this.controlpoints.paths[k].data.pointname == zpointname) {
          this.currentpath = this.controlpoints.paths[k];
          break;
        }
      }

      this.saveParamRequest($(e.target).serializeObject());
    }.bind(this))
};

Canvas.prototype.showbox = function() {
  this.box = new this.paper.Path.Rectangle(new this.paper.Point(50, 50),
                                           new this.paper.Size(50, 50));
  this.box.style = {
      strokeColor: 'red',
      strokeWidth: '5'
  };
};

Canvas.prototype.draw = function() {
  this.paper.view.viewSize.height = 500;
  this.paper.view.viewSize.width = 400;
  this.paper.view.draw();
};


Canvas.prototype.redrawglyph = function(data) {
  this.paper.activate();
  this.glyphorigin.dataGlyph = $.parseJSON(data).M.edges;
  this.glyphorigin.drawOn(this);
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
