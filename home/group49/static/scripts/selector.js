$(function() {
    var gender = window.location.pathname.split('/')[1];
    var brndSplit = window.location.pathname.split( '/brands/' );
    var catSplit = window.location.pathname.split( '/categories/' );
    var categories = '';
    var brands = '';
    if(catSplit.length>1){
        categories = catSplit[1];
    }
    if(brndSplit.length>1){
        brands = brndSplit[1];
    }
    alert('categories: ' + categories);
    alert('brands: ' + brands);
    //load the objects here already on page loaded
    //$.get(....)

    $( ".category" ).click(function(e) {
        if(categories!=''){
            categories+= '&&'+e.target.id;
        }
        else categories+=e.target.id;
        var url ='';
        if(brands ==''){
            url = '/men/categories/'+categories
        }
        else url = '/men/categories/'+categories+'/brands/'+brands;
        $.get( url, function( data ) {
            alert( "Data Loaded: " + data );
        });
    });
});