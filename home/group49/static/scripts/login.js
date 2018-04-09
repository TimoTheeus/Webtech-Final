$(function() {
    $('#loginForm').submit(function(){
        $.ajax({
            url: '/login',
            type: 'POST',
            data : $('#loginForm').serialize(),
            success: function(response){
                if(response == 'success'){
                    window.location.href = '/profile';
                }
                else if(response == 'failure'){
                    $('#errorMsg').addClass('show');
                }
            }
        });
        return false;
    });
});