;(function($) {

    $.fn.dropzone = function(data) {
        var that = this;

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


