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
    $.post('/editor/locals/', {master_id: config.master_id})
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
    data.master_id = this.config.master_id;
    $.ajax({url: '/editor/locals/', type: 'PUT', data: data})
    .success(this.listLocalParamsReceived.bind(this));
}


LocalParamSwitcher.prototype.localParamDataReceived = function(response) {
    var data = $.parseJSON(response);
    if (!data) {
        this.config.listener.echo({
            px: 1,
            width: 2,
            space: 3,
            xheight: 4.5,
            capital: 1,
            ascender: 4,
            descender: 2,
            skeleton: -1,
            over: 12
        });
        return;
    }
    this.config.listener.echo(data);
}


// $(function(){
//     var form = LocalParamForm($('form#local-param-form-1'));

//     var sw1 = new LocalParamSwitcher({
//         source: $('select#local-param-switcher-1'),
//         listener: form
//     });
// });