$(function(){
    $.get('/cartItems', function(data){
        for(i=0;i<data.length;i++){
            var id = data[i];
            $.get('/prodData', {id:id},function(prodData){
                console.log(prodData);
                var removeAction = 'remove('+prodData.id+',this); ';
                var prodObject =  $('<li class= "listedProdItem">'+prodData.title+'<span class = "listedPriceTag">'+prodData.price+'€'
                    +'</span><br><img class = "listedProdImg" src= images/products/'+prodData.image+'><button onclick = '+removeAction+'class = "removeButton">Delete</button></li>');
                prodObject.appendTo($('#prodList'));
            });
        }
    });
    $('#order').click(function(){
        if(confirm("Buy products?")){
            $.post('/buyProducts',function(response){
                if(response=='success'){
                    alert('products bought!');
                }
                else alert(response);
            });
        }
    });
});
function remove(id,object){
    alert(id);
    object.parentNode.parentNode.removeChild(object.parentNode);
    $.post('/removeFromCart',{id:id},function(response){
        alert('product removed from cart');
    });
}