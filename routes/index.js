//========================================

//This file contains routes for CRUDing books.json

//==============================================
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const fs = require("fs");

//to send post requests
const querystring = require('querystring');
const http = require('http');

//marie's helpers file
const helpers = require('../helpers');

//get books data from json file
let books;
fs.readFile('./models/books.json', (err,data)=>{
  if(err) throw err;
  books = JSON.parse(data);
})

//watch for changes to the json file
books = helpers.watchBooks();

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
 let theBook = books.filter(b=>b.id === parseInt(req.params.id) && b.userID === req.user.id);
 //console.log("thebook", theBook)
  res.render('editBookPage', {theBook})
})




//====================================================

//EDIT JSON BOOK rewrite

//=====================================================
router.post('/editJsonBook/:id', (req, res)=>{

  //get variables from form
  const {title, author, description, price, userReview, condition }= req.body;

  const idToFind = parseInt(req.params.id);

  //get new copy of the json file
  const latestBooks = helpers.getLatestBooks();
  
  //and then...
  latestBooks
  .then(books => {

    //id of relevant book
    let i = books.map(b => b.id).indexOf(idToFind);
   
    //the relevant book
    let theBook = books.filter(b => b.id===idToFind)[0];
    
    //make the changes - to editable fields only
    theBook.title = title;
    theBook.author = author; //!!!TODO, What happens if they update author!!??
    theBook.description = description;
    theBook.price = price;
    theBook.userReview = userReview;
    theBook.condition = condition;

    //splice the updated book into the json copy and resave
    books.splice(i, 1, theBook);

    const updated = JSON.stringify(books, null ,4)

    fs.writeFile('./models/books.json', updated, 'utf8', err =>{
        if(err) {
          req.flash("error_msg", `There was a problem editing ${theBook.title}` );
          res.redirect('/dashboard')
        }else{
      
          //Syncronize the sql version (if there is one)
          //1. is forSale true?, AND does it have a shopID?
          //2. if so, update sql as well
          if(theBook.shopID && (theBook.forSale===true||theBook.forSale==='true')){
            //need to update book in db too!!
            console.log("book is for sale, will update sql")
           const string = encodeURIComponent(JSON.stringify(theBook));
            res.redirect('/shop/sqleditbook/?bookupdates=' + string);
          
          }else{
            //not for sale, no need for sql
            console.log("this book is not for sale, done.")
          }

          req.flash("success_msg", `${theBook.title} edited successfully.` );
          //res.redirect('/dashboard')
        }
      })
  })

 
  //let i = books.map(b => b.id).indexOf(idToFind)

  //splice the updated book and resave
  // books.splice(i, 1, updatedBook);
  // const updated = JSON.stringify(books, null ,4)
  
  // fs.writeFile('./models/books.json', updated, 'utf8', err =>{
  //   if(err) {
  //     req.flash("error_msg", `There was a problem editing ${updatedBook.title}` );
  //     res.redirect('/dashboard')
  //   }else{
  //     //
  //     //Syncronize the sql version (if there is one)
  //     //1. is forSale true?, AND does it have a shopID?
  //     //2. if so, update sql as well
  //     if(updated.shopID && (updated.forSale===true||updated.forSale==='true')){
  //       //need to update book in db too!!
  //       console.log("book is for sale, will update sql")
  //     }else{
  //       //not for sale, no need for sql
  //       console.log("this book is not for sale, done.")
  //     }
  //     req.flash("success_msg", `${updatedBook.title} edited successfully.` );
  //     res.redirect('/dashboard')
  //   }
  // })  
})

//================================================
// try to computer edit a book by sending dets in params
//eg /editJsonBook/49/condition/mediocre
//changes condition of book with id 49 to 'mediocre'
//=====================================================
router.get('/editJsonBook/:id/:shopid/:field/:thevalue', (req, res)=>{
  console.log("got shopid ", req.params.shopid)
  const idToFind = parseInt(req.params.id);
  
  let bookIndex = books.map(b =>b.id).indexOf(idToFind)

  let updatedBook = books[bookIndex];

  //set the relevent book's relevant field to thevalue passes in params
  updatedBook[`${req.params.field}`] = req.params.thevalue;

  //also set the relevant books shopid to the bookID from the sql db
  updatedBook.shopID = parseInt(req.params.shopid);
  
  //and update the json
  books.splice(bookIndex, 1, updatedBook);
  const updated = JSON.stringify(books, null ,4)
  
  fs.writeFile('./models/books.json', updated, 'utf8', err =>{
    if(err) {
      req.flash("error_msg", `There was a problem adding ${updatedBook.title} to your sale items.` );
      res.redirect('/dashboard')
    }else{
      req.flash("success_msg", `${updatedBook.title} for sale.` );
      res.redirect('/dashboard')
    }
  })  
})

//===================================================================

//ADD  a book

//===================================================================

router.post('/addBook', (req,res) =>{
  let {title, author, description, userReview, condition, price} = req.body;//get details from req.body
 
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