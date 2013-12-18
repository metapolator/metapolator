/*
 * Author: Vitaly Volkov
 *
 * Email: hash.3g@gmail.com
 *
 * Project home:
 *   http://www.github.com/metapolator/metapolator
 *
 * Version: 0.1
 *
 * Description:
 *
 *   Interface to use form based on several set of values. In common case
 *   you can have sets with several related values:
 *
 *     Set 1: px = 0, skeleton = -1
 *     Set 2: px = 1, skeleton = 0
 *
 *   Getting list of local parameters
 *
 *     Request URL: http://domain.ltd/editor/locals/
 *     Request Method: POST
 *     Response: [{"selected": true, "idx": 1, "val": 1},
 *                {"idx": 2, "val": 2},
 *                {"idx": 3, "val": 3}]
 *
 *   Getting values for selected set from dropdown
 *     
 *     Request URL: http://domain.ltd/editor/locals/?local_id=1
 *     Request Method: GET
 *     Response: {"descender": -2.0, "over": 0.1, "user_id": 1, 
 *                "skeleton": -1.0, "space": 0.0, "px": 0.0, 
 *                "ascender": 6.0, "width": 1.0, "xheight": 5.0,
 *                "capital": 6.0, "id": 1}
 *
 *   Put new values for selected set, to create new local parameter set
 *   use local_id=0
 *
 *     Request URL: http://domain.ltd/editor/locals/
 *     Request Method: PUT
 *     Response: [{"selected": true, "idx": 3, "val": 2}]
 *
 * Usage:
 *
 *  `sample.js`
 *
 *  var form = new LocalParamForm(jQuery('form'));
 *  var switcher = new LocalParamSwitcher({
 *       source: jQuery('select'),
 *       listener: form,
 *       data: {arg1: value1, arg2: value2},
 *       onFormSubmitted: function(){alert('form submitted');}
 *  });
 *
 *  `sample.html`
 *  
 *  <form>
 *    <select name="idlocal"></select>
 *    <input type="text" name="examplename" />
 *  </form>
 */

function LocalParamForm(form) {
    this.form = form;
}


LocalParamForm.prototype.echo = function(data) {
    var inputs = this.form.find('input');
    for (var k = 0; k < inputs.length; k++) {
        var input = $(inputs[k]);
        $.map(data, function(value, key) {
            if (key == input.attr('name')) 
                input.val(data[key]);
        });
    }
}


function LocalParamSwitcher(config) {
    this.config = config;
    this.config.source.on('change', this.sendRequest.bind(this));
    this.config.listener.form.on('submit', this.sendLocalParamRequest.bind(this));

    this.config.source.append($('<option>', {val: 0, text: 'Create new locals ...'}));

    $.post('/editor/locals/', config.data)
    .success(this.listLocalParamsReceived.bind(this));
}


LocalParamSwitcher.prototype.listLocalParamsReceived = function (response) {
    var data = $.parseJSON(response);
    if (data.length) {
        $(this.config.source.find('option:selected')).removeAttr('selected');
    }
    for (var k=0; k < data.length; k++) {
        var option = $('<option>', {
            value: data[k].val,
            text: 'Local parameters ' + data[k].idx
        });
        if (data[k].selected) {
            option.attr('selected', 'true');
        }
        this.config.source.append(option);
    }
    if (this.config.source.find('option:selected').length) {
        this.config.source.trigger('change');
    }
}


LocalParamSwitcher.prototype.sendRequest = function (e) {
    $.get('/editor/locals/', {'local_id': $(e.target).val()})
    .success(this.localParamDataReceived.bind(this))
    .error(function(response){
        if (response.status != 404)
            alert('Unable to retrieve local parameters');
    });
}


LocalParamSwitcher.prototype.sendLocalParamRequest = function(e) {
    e.preventDefault();
    var data = this.config.listener.form.serializeObject();
    data = $.extend(data, this.config.data);
    $.ajax({url: '/editor/locals/', type: 'PUT', data: data})
    .success(this.listLocalParamsReceived.bind(this));
}


LocalParamSwitcher.prototype.localParamDataReceived = function(response) {
    var data = $.parseJSON(response);
    if ($.isEmptyObject(data)) {
        this.config.listener.echo({
            px: 0,
            width: 1,
            space: 0,
            xheight: 5,
            capital: 6,
            ascender: 6,
            descender: -2,
            skeleton: 0,
            over: 0.1
        });
        return;
    }
    this.config.listener.echo(data);
    if (this.config.onFormSubmitted)
        this.config.onFormSubmitted();
}
