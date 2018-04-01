var express = require('express');
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();

app.set('views', path.join(__dirname, 'views'));
var staticPath = path.resolve(__dirname, "static");
app.set('view engine', 'pug');
app.use(session({secret: 'ssshhhhhh'}));
app.use(express.static(staticPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var session;
app.get('/', function(req, res){
    session = req.session;
    session.cart = [];
  res.render('home', {
    title: 'Home'
  });
});
app.get('/men', function(req, res){
    res.render('men',{
        categories:menCategories
    });
});

app.get('/women', function(req, res){
    res.render('women',{
        categories:menCategories
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
const menCategories = ['sweaters','pants'];
//get shopping cart and load using session variables
app.get('/cart', function(req, res){
    res.render('cart');
});
app.get('/men/:categories', function (req, res) {
    res.send(req.params.categories);
});
app.get('/men/:categories/:prodId', function (req, res) {
    var id = req.params.prodId;
    res.send(req.params);
});

app.get('/login',function(req,res){
    session = req.session;
    let email = req.query.email;
    let password = req.query.pass;
    //if valid login
    if(true){
        session.email = email;
        res.send('login success');
    }
    else{
        res.send('login failure');
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


//throw 404, keep as last route
app.get('*', function(req, res){
    res.send('404 PAGE NOT FOUND', 404);
});
app.listen(8043);
console.log("server started on port 8043");