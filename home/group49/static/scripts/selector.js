$(function() {
    var page = 1;
    let mainCategory = location.pathname.split('/')[1];
    var categories = [mainCategory];
    var brands = [];

    $( '.category').click(function(e) {
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
            $('.catList').find('input[type=checkbox]:checked').removeAttr('checked');
            e.target.parentNode.children[0].checked = true;
            categories = [mainCategory];
            categories.push(e.target.name);
        }
        var url = '/'+mainCategory+'/browse?categories=' +JSON.stringify(categories)+'&brands='+JSON.stringify(brands)+'&page='+page;
        $.get( url, function( data ) {
            alert( "Data Loaded: " + data );
        });
    });
    $( '.brand').click(function(e) {
        //add a brand to brand array
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
            alert( "Data Loaded: " + data );
        });
    });
});
function deleteFromArray(value,array){
    let index = array.indexOf(value);
    if(index>=0){
        array.splice(index,1);
    }
    
}