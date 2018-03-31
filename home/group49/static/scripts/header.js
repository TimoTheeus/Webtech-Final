$(function() {
  $('a[href="/' + location.pathname.split('/').pop() + '"]').addClass('active');
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
