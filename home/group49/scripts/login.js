$(document).ready(function(){
    var user,pass;
    $("#submit").click(function(){
        user=$("#user").val();
        pass=$("#password").val();
        $.post("/login",{user: user,password: pass}, function(data){
            if(data==='done')
            {
                alert("login success");
            }
        });
    });
});