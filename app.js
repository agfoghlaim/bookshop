const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');

//flash messages depend on express-session
const session = require('express-session');
const passport = require('passport');
const sqldb = require('./config/db');



const app = express();

//passport config
require('./config/passport')(passport);

//auth db
const db = require('./config/keys').MongoURI;

//auth db connect
mongoose.connect(db, {useNewUrlParser:true})
  .then( ()=> console.log("mongodb connected"))
  .catch( err => console.log("error: ", err))

//ejs, Layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');

//clientside js
app.use(express.static('js'));

//css
app.use(express.static('css'));

//imgs
app.use(express.static('img'));

//imgs
app.use(express.static('bookimages'));

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



//routes

//for home route, use index.js
app.use('/', require('./routes/index'));

//for user related routes, use user.js
app.use('/users', require('./routes/users'));

//for shop/sql related routes, use shop.js
app.use('/shop', require('./routes/shop'));

const PORT =process.env.PORT || 5000;

app.listen(PORT, console.log('server started..'));