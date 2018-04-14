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
app.use(logger);
function logger(req, res, next) {
    console.log('%s %s', req.method, req.url);
    next();
}
function encrypt(s) {
    return shajs('sha256').update(s).digest('hex');
}
function firstUpper(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

var session;
app.get('/', function(req, res){
    session = req.session;
    session.cart = [];
  res.render('home', {
    title: 'Home'
  });
});
app.get(/^\/((wo)?men|accessories)\/browse$/, function(req, res){
    var ctgrs = JSON.parse(req.query.categories);
    var brands = JSON.parse(req.query.brands);
    var mainCategory = firstUpper(req.params[0]);
    let priceLow = req.query.priceLow;
    let priceHigh = req.query.priceHigh;
    let ordering = req.query.ordering;
    let search = req.query.search;
    var menProducts =[];
    var mainCatId;
    if(ctgrs.length==0) {
        ctgrs.push(mainCategory);
    }
    if(mainCategory=='men')mainCatId=1;
    else if(mainCategory=='women')mainCatId=2;
    else mainCatId=3;
    var products =[];
    var amountDone = 0;//amount of categories done processing
    var expectedDone;//expected amount
    var mainQueryDone = false;
    var searchProducts = [];
    if(search!='') {
        new db.Product(null,{title:'title'}).search('title', search, function (items) {
            for(i=0;i<items.length;i++)
                searchProducts.push(items[i].id)
        });
    }
    new db.Category(null, {category:mainCategory}).getItems(function(items){
        for(i=0; i<items.length; i++)
                menProducts.push(items[i].id);
        new db.Category().selectManyOptions('category',ctgrs,function(categories){
            if(!categories){
                res.send(products);
            }
            expectedDone=categories.length;
            for(j=0;j<categories.length;j++){
                //for all items with these categories
                new db.Category(categories[j].id).getItems(function(items){
                    for(i=0;i<items.length;i++){
                        //push them to products array
                        let inRange = (items[i].props.price>=priceLow&&items[i].props.price<priceHigh)
                        var inSearch;
                        if(search==''){
                            inSearch=true;
                        }
                        else{
                            inSearch = searchProducts.includes(items[i].id);
                        }
                        if(inSearch&&inRange&&(!brands.length>0||brands.includes(items[i].props.brand))&&menProducts.includes(items[i].id)){
                            items[i].props.id=items[i].id;
                            products.push(items[i].props);
                        }
                    }
                    amountDone++;
                    if(j==categories.length&&expectedDone==amountDone){
                        if(ordering=='price') products.sort(comparePrice);
                        else products.sort(compareTitle);
                        var string = JSON.stringify(products);
                        res.send(string);
                    }
                },true);
            }
        });
    });
});
function compareTitle(a,b) {
    if (a.title < b.title)
      return -1;
    if (a.title > b.title)
      return 1;
    return 0;
}
function comparePrice(a,b) {
    if (a.price < b.price)
      return -1;
    if (a.price > b.price)
      return 1;
    return 0;
}
app.get(/^\/((wo)?men|accessories)/, function(req, res){
    new db.Product().getAll('brand', brands => 
        new db.Category(null, {category: firstUpper(req.params[0])}).getCombs(categories =>
            res.render('prodbrowser', {
                categories: categories.map(x => x.props.category),
                brands: brands
            }),
        true)
    );
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
app.get('/history',function(req,res){
    res.render('history');
});
app.get('/historyItems',function(req,res){
    var id = req.session.uid;
    new db.Purchase(null,{userid:id}).selectMany('userid',function(purchases){
        res.send(JSON.stringify(purchases));
    });
});
app.get('/register', function(req, res){
    res.render('register');
});
//get shopping cart and load using session variables
app.get('/cart', function(req, res){
    res.render('cart');
});
app.get('/cartItems',function(req,res){
    if(!session.cart) session.cart=[];
    res.send(session.cart);
});
app.get('/prodData',function(req,res){
    var id = req.query.id;
    new db.Product(req.query.id).select(function(prod){
        prod.props.id=req.query.id;
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
        let params = {userid:req.session.uid,prodid:session.cart[i]};
        let purchase = new db.Purchase(null, params);
        purchase.insert(function(purchase){
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
    user.selectSingle('login', function(a) {
        if (a) {
            callback('login exists');
        } else {
            user.selectSingle('email', function(b) {
                if (b) {
                    callback('email exists');
                } else {
                    user.insert(function(user) {
                        //Do something with the data
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
                insertUser(req.body, function(s, id2) {
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
});


//throw 404, keep as last route
app.get('*', function(req, res){
    res.status(404).send('404 PAGE NOT FOUND');
});
app.listen(8043);
console.log('server started on port 8043');