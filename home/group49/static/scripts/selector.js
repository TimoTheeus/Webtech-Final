$(function() {
    var page = 1;
    let mainCategory = location.pathname.split('/')[1];
    var categories = [mainCategory];
    var brands = [];

    $( ".category" ).click(function(e) {
        categories.push(e.target.name);
        var url = '/'+mainCategory+'/browse?categories=' +JSON.stringify(categories)+'&brands='+JSON.stringify(brands)+'&page='+page;
        $.get( url, function( data ) {
            alert( "Data Loaded: " + data );
        });
    });
});