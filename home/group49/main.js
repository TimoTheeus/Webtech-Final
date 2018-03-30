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

var session;
app.get('/', function(req, res){
    session = req.session;
  res.render('home', {
    title: 'Home'
  });
});

app.get('/profile', function(req, res){
    session = req.session;
    if(session.email){ // if a session exists
        res.render('profile');
    }
    //else render the login page
    else {
        res.render('login', {
            title: 'Login'
        });
    }
});

app.get('/register', function(req, res){
    res.render('register');
});

app.post('/login',function(req,res){
    session = req.session;

    //if valid login
    if(true){
        session.email = req.body.email;
        res.end('login success');
    }
    else{
        res.end('login failure');
    }


});

app.post('/create',function(req,res){
    var firstName =req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var password = req.body.password;
    //Do something with the data
    console.log(firstName + ' ' + lastName);
    //log in
    session = req.session;
    session.email = req.body.email;
    res.redirect('/profile');

});

app.get('/logout',function(req,res) {
    req.session.destroy();
    res.redirect('/');
    console.log("logged out");
});
app.listen(8043);
console.log("server started on port 8043");