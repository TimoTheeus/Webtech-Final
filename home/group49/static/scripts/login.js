function login(){  
        var email,pass;
        email=$("#email").val();
        pass=$("#password").val();
        /*
        * Perform some validation here.
        */
        $.post( "/login",{email:email,pass:pass}, function( data ) {
            if(data == 'success'){
                window.location.href = '/profile';
            }
            else if(data == 'failure'){
                $('#errorMsg').addClass('show');
            }
        });
};