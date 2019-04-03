const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
//flash messages depend on express-session
const session = require('express-session');
const passport = require('passport');

//SQL middleware
var mysql = require('mysql');


const app = express();

//passport config
require('./config/passport')(passport);

//db
const db = require('./config/keys').MongoURI;

//connect
mongoose.connect(db, {useNewUrlParser:true})
  .then( ()=> console.log("mongodb connected"))
  .catch( err => console.log("error: ", err))

//ejs, Layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');

//clientside js
app.use(express.static('js'));

//use local phpmyadmin
const sqldb = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bookshop'
});

//bodyparser (to use req.body)
app.use(express.urlencoded({extended: false}));

//express session Middleware
//TODO check what resave and saveUnit mean, should be false?
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));


//passport
app.use(passport.initialize());
app.use(passport.session());

//flash Middleware (show msgs on redirect)
app.use(flash());

//global vars (custom middleware) can be called whenever they're needed

app.use((req, res, next) =>{
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  //user has to be after passport middleware
  res.locals.user = req.user || null;
  next();
});


//connect to db
//connected or not?
sqldb.connect(err =>{
  if(err){
    console.log("sql connection error...");
  }else{
    console.log("sql db ok...");
  }
})

//routes

//for home route, use index.js
app.use('/', require('./routes/index'));

//for user related routes, use user.js
app.use('/users', require('./routes/users'));

//for shop/sql related routes, use shop.js
app.use('/shop', require('./routes/shop'));

const PORT =process.env.PORT || 5000;

app.listen(PORT, console.log('server started..'));