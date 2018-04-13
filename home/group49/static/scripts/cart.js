$(function(){
    $.get('/cartItems', function(data){
        data.forEach(function(id){
            $.get('/prodData', {id:id},function(prodData){    
                console.log(prodData);
                var removeAction = 'remove('+id+',this); ';
                var prodObject =  $('<li class= "cartItem">'+prodData.title+'<span class = "cartPriceTag">'+prodData.price+'€'  
                +'</span><br><img class = "cartImg" src= images/products/'+prodData.image+'><button onclick = '+removeAction+'class = "removeButton">Delete</button></li>');
                prodObject.appendTo($('#prodList'));
            });
        });
    });
    $('#order').click(function(){
        if(confirm("Buy products?")){
            //add cart products to user history
        }
    });
});
function remove(id,object){
    object.parentNode.parentNode.removeChild(object.parentNode);
    $.post('/removeFromCart',{id:id},function(response){
        alert('product removed from cart');
    });
}