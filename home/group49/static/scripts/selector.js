$(function() {
    var page = 1;
    var categories = ['men'];
    var brands = [];
    var gender = window.location.pathname.split('/')[1];

    $( ".category" ).click(function(e) {
        categories.push(e.target.name);
        $.get( url, function( data ) {
            alert( "Data Loaded: " + data );
        });
    });
});
function url(){
    return '/men/?categories=' +JSON.stringify(categories)+'&brands='+JSON.stringify(brands)+'&page='+page;
}