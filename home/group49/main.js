var express = require('express');
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();

app.set('views', path.join(__dirname, 'views'));
var staticPath = path.resolve(__dirname, "static");
app.set('view engine', 'pug');
app.use(session({secret: 'ssshhhhh'}));
app.use(express.static(staticPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sess;
app.get('/', function(req, res){
  sess = req.session;
  if(sess.email){
      console.log("Session exists");
  }
  res.render('home', {
    title: 'Home'
  });
});

app.get('/profile', function(req, res){
    sess = req.session;
    if(sess.email){ // if a session exists
        res.render('profile');
    }
    //else render the login page
    else {
        res.render('login', {
            title: 'Login'
        });
    }

});
app.get('/create', function(req, res){
    res.render('register');
});
app.post('/login',function(req,res){
    sess = req.session;
    //In this we are assigning email to sess.email variable.
    //email comes from HTML page.
    //if login success
    if(true){
    sess.email = req.body.email;
    res.end('login success');
    }
    else{
        res.end('login failure');
    }


});
app.post('/register',function(req,res){
    var email =req.body.email;
    var password = req.body.password;
    res.end('registered');
});

app.listen(8043);
console.log("server started on port 8043");