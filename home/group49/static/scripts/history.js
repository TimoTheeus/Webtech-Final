$(function(){
    $.get('/historyItems', function(data){
        var purchaseArray = JSON.parse(data);
        for(i=0;i<purchaseArray.length;i++){
            let id = purchaseArray[i].props.prodid;
            $.get('/prodData', {id:id},function(prodData){
                var prodObject =  $('<li class= "listedProdItem">'+prodData.title+'<span class = "listedPriceTag">'+prodData.price+'€'
                    +'</span><br><img class = "listedProdImg" src= images/products/'+prodData.image+'></li>');
                prodObject.appendTo($('#prodList'));
            });
        }
    });
});