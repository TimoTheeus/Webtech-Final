var express = require('express');
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
var db = require('./db.js');
var shajs = require('sha.js');

var app = express();

app.set('views', path.join(__dirname, 'views'));
var staticPath = path.resolve(__dirname, 'static');
app.set('view engine', 'pug');
app.use(session({secret: 'ssshhhhhh'})); //set resave and saveUninitialized
app.use(express.static(staticPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const menCategories = ['All Products','Hoodies & Jackets','Pants','Shorts','Swimwear','T'];

function encrypt(s) {
    return shajs('sha256').update(s).digest('hex');
}

var session;
app.get('/', function(req, res){
    session = req.session;
    session.cart = [];
  res.render('home', {
    title: 'Home'
  });
});
app.get('/men/browse', function(req, res){
    var cats = JSON.parse(req.query.categories);
    res.send(req.query.categories);
});

app.get('/men', function(req, res){
    res.render('prodbrowser',{
        categories:menCategories
    });
});

app.get('/women', function(req, res){
    res.render('prodbrowser', {
        categories:menCategories
    });
});
app.get('/profile', function(req, res){
    if(req.session.uid) { // if a session exists
        new db.User(req.session.uid).select(function(user) {
            res.render('profile', user.props);
        });
    }
    //else render the login page
    else {
        res.redirect('/signin');
    }
});
app.get('/signin', function(req, res){
    res.render('login');
});
app.get('/register', function(req, res){
    res.render('register');
});
//get shopping cart and load using session variables
app.get('/cart', function(req, res){
    res.render('cart');
});

app.get('/product/:prodId', function (req, res) {
    var id = req.params.prodId;
    res.send(req.params);
});

app.post('/login',function(req,res){
    session = req.session;
    let login = req.body.login;
    let password = req.body.password;
    
    new db.User(null, {login: login}).selectSingle('login', function(user) {
        //if valid login
        if (user && user.props.password == encrypt(password)) {
            session.uid = user.id;
            console.log(login);
            console.log(password);
            res.send('success');
        } else res.send('failure');
    });
});

/*Inserts the user in the database. callback will be called with:
'login exists' if there is already a user with the same username in the database
'email exists' if there is already a user with the same email
'success' if the user was inserted into the database, with the user id as second parameter*/
function insertUser(params, callback) {
    let user = new db.User(null, params);
    console.log(params.login);
    user.selectSingle('login', function(a) {
        if (a) {
            console.log('login exists');
            callback('login exists');
        } else {
            user.selectSingle('email', function(b) {
                if (b) {
                    console.log('email exists');
                    callback('email exists');
                } else {
                    user.insert(function(user) {
                        //Do something with the data
                        console.log('inserted: ' + params.first_name + ' ' + params.last_name + ' ' + user.id);
                        callback('success', user.id);
                    });
                }
            });
        }
    });
}

app.post('/create', function(req,res) {
    req.body.password = encrypt(req.body.password);
    insertUser(req.body, function(mes, id) {
        if (id) req.session.uid = id;
        res.send(mes);
    });
});

app.post('/editprofile', function(req, res) {
    var id = req.session.uid;
    if (id) {
        new db.User(id).select(function(user) {
            user.delete(function() {
                req.body.password = user.props.password;
                console.log(req.body);
                insertUser(req.body, function(s, id2) {
                    console.log(user);
                    if (s != 'success') {
                        user.insert(function(user) {
                            req.session.uid = user.id;
                            res.redirect('/profile');
                        });
                    } else {
                        req.session.uid = id2;
                        res.redirect('/profile');
                    }
                });
            });
        });
    }
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