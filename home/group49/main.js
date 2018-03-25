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
    res.sendfile("views/login.html");
    if(session.user){
        //do something
        console.log("welcome back mah dude");
    }
});
app.post('/login',function(req,res){

    var user=req.body.user;
    var password=req.body.password;
    console.log("User name = "+user+", password is "+password);
    //set session
    session.user = user;
    res.end("done");
});
app.get('/logout',function(req,res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});
app.listen(8043,function(){
    console.log("Started on PORT 8043");
})