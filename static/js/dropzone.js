;(function($) {

    $.fn.dropzone = function(data) {
        var that = this;

        this.off('drop').off('dragstart').off('dragenter').off('dragover').off('dragleave');
        $(document).off('drop').off('dragenter').off('dragover').off('dragleave');

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

            uploadFinished: function(i, file, response, time, xhr) {
                NProgress.done();
                that.removeClass('dragging dropzone');
                if (xhr.status != 200) {
                    alert('could not upload this file');
                } else {
                    that.trigger('upload', [response]);
                }
            }
        });
    }

})(jQuery);


