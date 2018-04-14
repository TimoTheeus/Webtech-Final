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
app.get('/:mainctgry/browse', function(req, res){
    var ctgrs = JSON.parse(req.query.categories);
    var brands = JSON.parse(req.query.brands);
    var mainCategory = req.params.mainctgry;
    var menProducts =[];
    var mainCatId;
    if(ctgrs.length==0){
        if(mainCategory=='men') ctgrs.push('Men');
        else if(mainCategory=='women')ctgrs.push('Women');
        else ctgrs.push('Accessories');
    }
    if(mainCategory=='men')mainCatId=1;
    else if(mainCategory=='women')mainCatId=2;
    else mainCatId=3;
    var products =[];
    var amountDone = 0;//amount of categories done processing
    var expectedDone;//expected amount
    var mainQueryDone = false;
    console.log(ctgrs);
    console.log(brands);
    new db.Category(mainCatId).getItems(function(items){
        for(i=0;i<items.length;i++){
                menProducts.push(items[i].id);
            }
            //mainQueryDone=true;
        });
    //get all categories
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
                    if((!brands.length>0||brands.includes(items[i].props.brand))&&menProducts.includes(items[i].id)){  
                        items[i].props.id=items[i].id;
                        products.push(items[i].props);
                      //  console.log(items[i].props);
                    }
                }
                amountDone++;
                if(j==categories.length&&expectedDone==amountDone){
                    console.log('printing');
                    var string = JSON.stringify(products);
                    res.send(string);
                }
            },true);
        }
    });  
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
    new db.Product().getAll('brand', brands => 
        new db.Category(2).getCombs(categories =>
            res.render('prodbrowser', {
                categories: categories.map(x => x.props.category),
                brands: brands
            }),
        true)
    );
});
app.get('/accessories', function(req, res){
    new db.Product().getAll('brand', brands => 
        new db.Category(3).getCombs(categories =>
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