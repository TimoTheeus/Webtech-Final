$(function() {
    $('#createForm').submit(function(){
        $.ajax({
            url: '/create',
            type: 'POST',
            data : $('#createForm').serialize(),
            success: function(response){
                //alert(response);
                if(response == 'success'){
                    window.location.href = '/profile';
                }
                else alert(response);
            }
        });
        return false;
    });
});