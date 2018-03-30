$(document).ready(function(){
    var email,pass;
    $("#loginButton").click(function(){
        email=$("#email").val();
        pass=$("#password").val();
        /*
        * Perform some validation here.
        */
        $.post("/login",{email:email,pass:pass},function(data){
            if(data==='login success')
            {
                window.location.href="/profile";
            }
            else if(data === 'login failure'){
                //do something
            }
        });
    });
});