$(function() {
    $info = $('.customerInfo');
    //Create a form with inputs in the place of spans.
    $form = $('<form>').attr({action: '/editprofile', method: 'post'}).addClass('customerInfo').
        html($info.html().replace(/<span id="([_a-z]+)">(.+?)<\/span>/g, '<input type="text" name="$1" value="$2">')).
        append('<input type="submit" value="Apply Changes">');
    $('#logout').click(function(){
        window.location.href = '/logout';
    });
    $('#edit').click(function() {
        if ($.contains(document, $info[0])) {
            console.log('hi');
            $info.replaceWith($form);
            this.innerHTML = 'Cancel';
        } else {
            console.log('bye');
            $form.replaceWith($info);
            this.innerHTML = 'Edit Profile';
        }
    });
});