var express = require('express');
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
var db = require('./db.js');

var app = express();

app.set('views', path.join(__dirname, 'views'));
var staticPath = path.resolve(__dirname, 'static');
app.set('view engine', 'pug');
app.use(session({secret: 'ssshhhhhh'})); //set resave and saveUninitialized
app.use(express.static(staticPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const menCategories = ['All Products','Hoodies & Jackets','Pants','Shorts','Swimwear','T'];

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
//get shopping cart and load using session variables
app.get('/cart', function(req, res){
    res.render('cart');
});
app.get('/men/categories/:categories', function (req, res) {
    res.send(req.params.categories);
});

app.get('/men/brands/:brands', function (req, res) {
    res.send(req.params.brands);
});

app.get('/men/categories/:categories/brands/:brands', function (req, res) {
    res.send(req.params.brands);
});
app.get('/product/:prodId', function (req, res) {
    var id = req.params.prodId;
    res.send(req.params);
});

app.post('/login',function(req,res){
    session = req.session;
    let email = req.body.email;
    let password = req.body.password;
    //if valid login
    if(true){
        session.email = email;
        console.log(session.email);
        console.log(password);
        res.send('success');
    }
    else{
        res.send('failure');
    }
});

app.post('/create', function(req,res) {
    let params = {
        login: req.body.username,
        password: req.body.password,
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email:req.body.email
    };
    let user = new db.User('3', params);
    user.exists('login',params.login,function(bool){
        if(bool){
            console.log('login exists');
            res.send('login exists');
        }
        else{
            user.exists('email',params.email,function(bool){
                if(bool){
                    console.log('email exists');
                    res.send('email exists');

                }
                else {
                    user.insert();
                    //Do something with the data
                    console.log('inserted: ' + params.first_name + ' ' + params.last_name);
                    //log in
                    session = req.session;
                    session.email = req.body.email;
                    res.send('success');
                }
            });
        }
    });
});

app.get('/logout',function(req,res) {
    req.session.destroy();
    res.redirect('/');
    console.log("logged out");
});


//throw 404, keep as last route
app.get('*', function(req, res){
    res.status(404).send('404 PAGE NOT FOUND');
});
app.listen(8043);
console.log('server started on port 8043');