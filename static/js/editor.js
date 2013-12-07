/**
    @authors Vitaly Volkov (hash.3g@gmail.com)
    @version 0.1
**/

function Editor() {
    this.editorAxis = $('.editor-axis');
}

Editor.prototype.addAxis = function() {
    var axis = $(this.editorAxis[0].outerHTML);
    $('.editor-container').append(axis);

    var dropzones = axis.find('.dropzone');
    dropzones.filedrop({
        fallback_id: 'upload_button',
        url: 'upload.php',
        paramname: 'userfile',
        withCredentials: true,
        dragOver: function(e) {
            var target = e.target;
            $('.dropzone').css('background', '#eee');
        },
        dragLeave: function(e) {
            $('.dropzone').css('background', '#ccc');
        }
    });
    axis.removeClass('fade');

    return axis;
}