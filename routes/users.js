//This file if for routes to do with users - login/out/register/etc

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//model
const User = require('../models/User')

router.get('/login', (req,res) => res.render('login'));

router.get('/register', (req,res) => res.render('register'));

//register , (users/register)
router.post('/register', (req,res) =>{
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //validate
  if(!name || !email || !password || !password2){
    errors.push({msg: 'fill all fields'});
  }

  //check passwords match
  if(password !== password2){
    errors.push({msg: 'passwords do not match'});
  }

  //pass length
  if(password.length < 6 ){
    errors.push({msg: 'password too short'})
  }

  //if there is an error....
  if(errors.length > 0 ){
    res.render('register', {
      errors, 
      name, 
      email, 
      password, 
      password2
    });
  }else{
  

    //no errors so make sure user doesn't already exist...
    User.findOne({email:email})
      .then(user=>{
        if(user){
          //user exists
          errors.push({msg: 'Email already used...'})
          res.render('register', {
            errors, 
            name, 
            email, 
            password, 
            password2
          });
        }else{
          //create new user
          const newUser = new User({
            name,email,password
          });

          //encrypt password
          bcrypt.genSalt(10,(err, salt ) => 
            bcrypt.hash(newUser.password,salt, (err, hash) =>{
              if(err) throw err;
              newUser.password = hash;
              console.log("hash ", hash)
              newUser.save()
                .then(user => {
                  //success_msg, see global vars in app.js
                  req.flash('success_msg', 'you are registered');
                  res.redirect('/users/login')
                })
                .catch(err => console.log('saving usr error: ', err))
          }))

        }
      })

  }
});

//login
router.post('/login', (req, res, next) =>{
  passport.authenticate('local', {
    //will redirect to shop/checkmessages...
    //successRedirect: '/dashboard',
    successRedirect: '/shop/checkMessages',
    failureRedirect:('/users/login'),
    failureFlash: true
  })(req,res,next);
});

//logout
router.get('/logout', (req,res) =>{
  req.logout();
  req.flash('success_msg', 'Logged out');
  res.redirect('/users/login');
})


module.exports = router;