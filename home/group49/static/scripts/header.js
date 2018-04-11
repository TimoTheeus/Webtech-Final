$(function() {
  $('a[href="/' + location.pathname.split('/')[1] + '"]').addClass('active');
  $( "#homeButton" ).click(function() {
    window.location.href = '/'
  });
    $( "#profileButton" ).click(function() {
      window.location.href = '/profile'
    });
    $( "#cartButton" ).click(function() {
      window.location.href = '/cart'
    });
});
