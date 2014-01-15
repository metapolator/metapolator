;(function($) {

    $.fn.dropzone = function(data) {
        var that = this;

        // var $div = $('<div>').css({
        //     'padding': '32px',
        //     'font-size': '22px',
        //     'color': '#ccc',
        //     'border': 'dashed 2px #ccc',
        //     'background': '#eee',
        //     'text-align': 'center',
        //     'position': 'absolute',
        //     'top': '0',
        //     'left': '0',
        //     'z-index': 100,
        //     'width': that.outerWidth() + 'px',
        //     'height': that.outerHeight() + 'px'
        // }).addClass('dropzone').attr('drop', 'drop');

        that.filedrop({
            fallback_id: 'upload_button',
            url: '/upload/',
            paramname: 'ufofile',
            withCredentials: true,

            data: data,

            dragEnter: function() {
                that.addClass('dragging dropzone');
            },

            dragLeave: function() {
                that.removeClass('dragging dropzone');
            },

            drop: function(){
                NProgress.configure({
                    appendTo: that
                });
                NProgress.start();
            },

            error: function(err, file) {
                NProgress.done();
                that.removeClass('dragging dropzone');
            },

            uploadFinished: function(i, file, response, time) {
                NProgress.done();
                that.removeClass('dragging dropzone');
                that.trigger('upload', [response]);
            }
        });
    }

})(jQuery);


