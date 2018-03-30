function move() {
    window.location.href = '/profile'
  }
  $( document ).ready(function() {
    $( "#profileButton" ).click(function() {
      move();
    });
});