const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const fs = require("fs");
//marie's helpers file
const helpers = require('../helpers');

//get books data from json file
let books;
fs.readFile('./models/books.json', (err,data)=>{
  if(err) throw err;
  books = JSON.parse(data);
})

//===================================================================

//DASHBOARD ROUTES

//===================================================================

//=====================
  //GET all json books
//=====================
router.get('/', (req,res) => {
  res.render('home')}
);

//dashboard (when user signs in)
router.get('/dashboard', ensureAuthenticated, (req,res) => { 
  //get all books from the json file with current user's id
  //const theBooks = require('../models/books.json');
  let theBooks;
  fs.readFile('./models/books.json', (err,data)=>{
    if(err) throw err;

    theBooks = JSON.parse(data);
    usersBooks = theBooks.filter(b => b.userID === req.user.id)
    //console.log("users books length ", usersBooks.length)
    res.render('dashboard', {usersBooks})
  });
  
})

router.get('/addBookPage', ensureAuthenticated, (req,res)=>{
  res.render('addBookPage', {newBook:''})
})




//=====================
  //DELETE a json book
//=====================
router.get('/deleteBook/:id', (req,res)=>{

console.log("in delete")
  //filter out relevant book by id
  fs.readFile('./models/books.json', (err, data) => {  
    if (err) throw err;
    let theBooks = JSON.parse(data);
    let newBooks = theBooks.filter(b =>  b.id !== parseInt(req.params.id))
    newBooks = JSON.stringify(newBooks, null, 4)
  
    //resave the json file
    fs.writeFile('./models/books.json', newBooks, 'utf8', err =>{
      if(err) {
        req.flash("error_msg", `Your book may not have been deleted` );
      }else{
        req.flash("success_msg", `deleted successfully.` );
      }
      res.redirect('/dashboard')
    })  
  });
})

  //=====================
  //EDIT a json book
//=====================
router.get('/editJsonBook/:id', (req,res)=>{
  if(!req.params.id || !req.user){
    res.redirect('/')
    return;
  }
  //find the correct book, render edit page, pass the book details
 let theBook = books.filter(b=>b.id === parseInt(req.params.id) && b.userID === req.user.id)
  res.render('editBookPage', {theBook})
})

router.post('/editJsonBook/:id', (req, res)=>{

  const {title, author, description, price }= req.body;
  const idToFind = parseInt(req.params.id);
  let updatedBook = {title, author, description, price:parseInt(price), id:parseInt(req.params.id), userID: req.user.id}
  let marie = books.map(b => b.id).indexOf(idToFind)
  console.log("marie is ", marie)
  books.splice(marie,1, updatedBook);
  const updated = JSON.stringify(books, null ,4)
  
  fs.writeFile('./models/books.json', updated, 'utf8', err =>{
    if(err) {
      req.flash("error_msg", `There was a problem editing ${updatedBook.title}` );
      res.redirect('/dashboard')
    }else{
      req.flash("success_msg", `${updatedBook.title} edited successfully.` );
      res.redirect('/dashboard')
    }
  })  
})

//================================================
// try to computer edit a book by sending dets in params
//eg /editJsonBook/49/condition/mediocre
//changes condition of book with id 49 to 'mediocre'
//=====================================================
router.get('/editJsonBook/:id/:field/:thevalue', (req, res)=>{

  const idToFind = parseInt(req.params.id);
  
  let bookIndex = books.map(b =>b.id).indexOf(idToFind)

  let updatedBook = books[bookIndex];

  //set the relevent book's relevant field to thevalue

  updatedBook[`${req.params.field}`] = req.params.thevalue;
  
  books.splice(bookIndex, 1, updatedBook);
  const updated = JSON.stringify(books, null ,4)
  
  fs.writeFile('./models/books.json', updated, 'utf8', err =>{
    if(err) {
      req.flash("error_msg", `There was a problem editing ${updatedBook.title}` );
      res.redirect('/dashboard')
    }else{
      req.flash("success_msg", `${updatedBook.title} edited successfully.` );
      res.redirect('/dashboard')
    }
  })  
})

//===================================================================

//ADD  a book

//===================================================================

router.post('/addBook', (req,res) =>{
  let {title, author, description, userReview, condition, price} = req.body;//get details from req.body
  console.log("here: ", req.body)
  const newBook = {
    title, 
    author, 
    description,
    userReview,
    condition, 
    forSale: false,
    price: parseInt(price), 
    id: helpers.getMaxId(books) +1, //get current max id from json file
    userID: req.user.id //add product page protected to avoid errors here (ie when user is not logged in req.user is not defined)
  }
  
  books.push(newBook)
  const newBooks = JSON.stringify(books, null, 4)
  fs.writeFile('./models/books.json', newBooks, 'utf8', err =>{
    if(err) {
      res.render('addBookPage', {error_msg: 'Oh no! An error occurred.'});
    }else{
      res.render('addBookPage', {success_msg: `"${newBook.title}" saved successfully.`});
    }
  })
})

module.exports = router;