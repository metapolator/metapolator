;(function($) {

    $.fn.dropzone = function(data) {
        var that = this;

        that.on('mouse over', function(){
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

            div.filedrop({
                fallback_id: 'upload_button',
                url: '/upload/',
                paramname: 'ufofile',
                withCredentials: true,

                data: data,

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

            that.append(div);
        })
        .mouseleave(function(){
            that.find('.dropzone').remove();
        });
    }

})(jQuery);


