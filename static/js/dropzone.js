;(function($) {

    $.fn.dropzone = function(data) {

        var that = this;

        that.attr('drop', 'drop');

        that.filedrop({
            fallback_id: 'upload_button',
            url: '/upload/',
            paramname: 'ufofile',
            withCredentials: true,

            data: data,

            dragOver: function(e) {
                if ($(e.target).find('.dropzone').length || $(e.target).parents('[drop]').find('.dropzone').length || $(e.target).hasClass('dropzone'))
                    return;
                var div = $('<div>').css({
                    'padding': '32px',
                    'font-size': '22px',
                    'color': '#ccc',
                    'border': 'dashed 2px #ccc',
                    'background': '#eee',
                    'text-align': 'center',
                    'position': 'absolute',
                    'top': '0',
                    'left': '0',
                    'z-index': 100,
                    'width': that.outerWidth() + 'px',
                    'height': that.outerHeight() + 'px'
                }).addClass('dropzone');
                that.append(div);
                that.attr('dropzone', 'dropzone');
            },

            dragLeave: function(e) {
                if (!$(e.target).hasClass('dropzone'))
                    return;
                that.removeAttr('dropzone');
                that.find('.dropzone').remove();
            },

            drop: function(){
                NProgress.configure({
                    appendTo: that
                });
                NProgress.start();
            },

            error: function(err, file) {
                NProgress.done();
                that.find('.dropzone').remove();
                that.removeAttr('dropzone');
            },

            uploadFinished: function(i, file, response, time) {
                NProgress.done();
                that.find('.dropzone').remove();
                that.removeAttr('dropzone');

                that.trigger('upload', [response]);
            }
        });

    }

})(jQuery);