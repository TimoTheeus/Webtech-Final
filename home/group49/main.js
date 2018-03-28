var express = require('express');
var path = require('path');

var app = express(); 

app.set('views', path.join(__dirname, 'views'));
var staticPath = path.resolve(__dirname, "static");
app.use(express.static(staticPath));
app.set('view engine', 'pug');

app.get('/', function(req, res){
  res.render('home', {
    title: 'Home'
  });
});

app.get('/loginPage', function(req, res){
  res.render('login', {
    title: 'Home'
  });
});
app.listen(8043);
console.log("server started on port 8043");