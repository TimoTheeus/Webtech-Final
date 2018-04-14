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

const menCategories = ['Accessories','Jeans','Shirts','Sweaters','Underwear','Slim Fit','Hoodies','Backpacks','Hats','Swimwear','Jackets'];
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
    let catgrs = JSON.parse(req.query.categories);
    let brands = JSON.parse(req.query.brands);
    var products = [{id:'1',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'2',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'3',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'1',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'1',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'1',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'1',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'1',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'1',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'1',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'1',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'1',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'1',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},
    {id:'1',image:'men/jeans/jeanspierone.jpg',title:'jeans',price:50},];
    var string = JSON.stringify(products);
    res.send(string);
});

app.get('/men', function(req, res){
    new db.Product().getAll('brand', brands => 
        new db.Category(1).getCombs(categories =>
            res.render('prodbrowser', {
                categories: categories.map(x => x.props.category),
                brands: brands
            }),
        true)
    );
});

app.get('/women', function(req, res){
    res.render('prodbrowser', {
        categories:menCategories,
        brands:brands
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
app.get('/cartItems',function(req,res){
    if(!req.session.cart) req.session.cart=[];
    res.send(session.cart);
});
app.get('/prodData',function(req,res){
    var id = req.query.id;
    new db.Product(req.query.id).select(function(prod){
        res.send(prod.props);
    });
});
app.get('/product', function (req, res) {
    var id = req.query.id;
    new db.Product(id).select(function(prod){
        res.render('product',{
            id:id,
            title:prod.props.title,
            price:prod.props.price,
            description:prod.props.description,
            path:prod.props.image
        });
    });
});

app.post('/login',function(req,res){
    let login = req.body.login;
    let password = req.body.password;
    
    new db.User(null, {login: login}).selectSingle('login', function(user) {
        //if valid login
        if (user && user.props.password == encrypt(password)) {
            req.session.uid = user.id;
            console.log(login);
            console.log(password);
            res.send('success');
        } else res.send('failure');
    });
});
app.post('/removeFromCart',function(req,res){
    let index = session.cart.indexOf(req.body.id);
    session.cart.splice(index,1);
    res.redirect('back');
});
app.post('/buyProducts',function(req,res){
    if(req.session.uid){
    if(!session.cart) session.cart=[];
    if(session.cart.length==0){
        return res.send('empty cart');
    }
    for(i=0;i<session.cart.length;i++){
       // console.log('bought: '+session.cart[i]);
        let params = {userid:req.session.uid,prodid:session.cart[i]};
        let purchase = new db.Purchase(null, params);
        purchase.insert(function(purchase){
           console.log('inserted prod :' + params.prodid +' for user: '+ params.userid)
        });
        if(i==session.cart.length-1){
            res.send('success');
        }
    }
    }
    else{
        res.send('please log in to buy products');
    }
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
app.post('/addToCart',function(req,res){
    if(session.cart)
        session.cart.push(req.body.id);
    else session.cart = [req.body.id];
    res.send('Items in cart: '+session.cart.length);
});
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