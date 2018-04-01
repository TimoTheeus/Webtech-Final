function login(){  
        var email,pass;
        email=$("#email").val();
        pass=$("#password").val();
        /*
        * Perform some validation here.
        */
        $.get( "/login",{email:email,pass:pass}, function( data ) {
            if(data == 'login success'){
                window.location.href = '/profile';
            }
        });
};