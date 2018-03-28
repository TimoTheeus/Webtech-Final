var express        =         require("express");
var bodyParser     =         require("body-parser");
var session        =         require('express-session');
var app            =         express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({secret: 'ssshhhhh'}));

app.set('view engine', 'pug');
var session;
app.get('/',function(req,res){
    session = req.session;
    res.render("views/login.html");
    if(session.user){
        //do something
        console.log("welcome back mah dude");
    }
});
app.get('/home', function (req, res) {
    res.send('/views/home.html');
  });
app.post('/login',function(req,res){

    var user=req.body.user;
    var password=req.body.password;
    console.log("User name = "+user+", password is "+password);
    //set session
    session.user = user;
    //switch to home page
    res.sendfile("/views/home.html");
    //res.redirect('/home');
    res.end("done");
});
app.get('/logout',function(req,res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});
app.use(function(request, response) {
    response.status(404).send("Page not found!");
    });
app.listen(8043,function(){
    console.log("Started on PORT 8043");
});