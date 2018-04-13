function addToCart(id){
    $.post('/addToCart',{id:id},function(response){
        alert(response);
    });
}