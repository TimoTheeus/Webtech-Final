$(function() {
    var page = 1;
    let mainCategory = location.pathname.split('/')[1];
    var categories = [mainCategory];
    var brands = [];
    var products = [];
    $('.ctgryList').find('input[type=checkbox]:checked').removeAttr('checked');
    $('.brandList').find('input[type=checkbox]:checked').removeAttr('checked');
    $('#showMore').click(function(e){
        page++;
        showProducts(page,products,false);
    });
    $( '.category').click(function(e) {
        page = 1;
        //add a category to category array
        if(e.target.type == 'checkbox'){    
            if(e.target.checked)
                categories.push(e.target.name);
            //remove a selected category from the category array
            else{
                deleteFromArray(e.target.name,categories);
            }
        }
        else{
            //Select a single category
            $('.ctgryList').find('input[type=checkbox]:checked').removeAttr('checked');
            e.target.parentNode.children[0].checked = true;
            categories = [mainCategory];
            categories.push(e.target.name);
        }
        var url = '/'+mainCategory+'/browse?categories=' +JSON.stringify(categories)+'&brands='+JSON.stringify(brands)+'&page='+page;
        $.get( url, function( data ) {
            products = JSON.parse(data);
                showProducts(page,products,true);
            });
        
        
    });
    $( '.brand').click(function(e) {
        //add a brand to brand array
        page = 1;
        if(e.target.type == 'checkbox'){    
            if(e.target.checked)
                brands.push(e.target.name);
            //remove a selected brand from the brands array
            else{
                deleteFromArray(e.target.name,brands);
            }
        }
        else{
            //Select a single brand
            $('.brandList').find('input[type=checkbox]:checked').removeAttr('checked');
            e.target.parentNode.children[0].checked = true;
            brands = [e.target.name];
        }
        var url = '/'+mainCategory+'/browse?categories=' +JSON.stringify(categories)+'&brands='+JSON.stringify(brands)+'&page='+page;
        $.get( url, function( data ) {
            products = JSON.parse(data);
            showProducts(page,products,true);
        });
    });
});
function deleteFromArray(value,array){
    let index = array.indexOf(value);
    if(index>=0){
        array.splice(index,1);
    }
    
}
function showProducts(page,products,clearAll){
    if(clearAll){
        document.getElementById('productsContainer').innerHTML = "";
    }
    for(i=(page-1)*6;i<page*6;i++)
    {
        if(i==(page-1)*6&&!products[i]){
            alert('no more products to show for this selection');
            return;
        }
        if(products[i])var prod = products[i];
        else return;
        var prodObject = $('<div class = "product"><a href=/product?id='+prod.id+'><img class ="productImg" src=images/products/'+prod.image+'></a><br><a class = "title" href =/product/' +prod.id+'>'+prod.title+'</a><p class ="price">'+prod.price+'€</p></div>');
        prodObject.appendTo($('#productsContainer'));
    }
}