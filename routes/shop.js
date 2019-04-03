//for sql/shop related routes
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const fs = require("fs");

var mysql = require('mysql');

//marie's helpers/query file to keep it tidy
const helpers = require('../helpers');

//get books data from json file (initially)
let books;
fs.readFile('./models/books.json', (err,data)=>{
  if(err) throw err;
  books = JSON.parse(data);
  console.log("XXXXXXXXXX \t\t\t\t books updated first time")
})


//==================================================
// watch for changes in the .json file and update the books variable everytime it changes
//=================================================

fs.watchFile('./models/books.json', (curr, prev) => {
  if(curr){
    fs.readFile('./models/books.json', (err,data)=>{
      if(err) throw err;
      books = JSON.parse(data);
      console.log("books updated")
    })
  }
  
});

//db credentials
const sqldb = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bookshop'
});

//connect to db
sqldb.connect(err =>{
  if(err){
    //TODO nicer error handling for this
    console.log("sql connection error...");
  }else{
    console.log("sql db ok...");
  }
})

router.get('/addsqlbook/:id', (req,res)=>{
  //find (in the json) the book user wants to sell
  const theBook = books.filter(b=> b.id === parseInt(req.params.id))

  //details to save in sql db
  let bookToAdd = {
    isbn: '',
    bookTitle: theBook[0].title,
    bookImage: '',
    bookDescription: theBook[0].description,
    userID: req.user.id,
    bookPrice: theBook[0].price,
    authorID: '',
    userReview: theBook[0].userReview,
    userBookImage: '',
  }

  //check if author is already saved in db?
  let authorSaved =helpers.isAuthorAlreadySaved(theBook,sqldb)
  authorSaved.then(a =>{
    if(!a){
      //if not, save author
      let saveauthor = helpers.saveAuthor(theBook[0].author, sqldb);
      saveauthor
      .then(res => {
        //set the relevant authorID
        bookToAdd.authorID = res.insertId;
      })
      .catch(err => console.log("problem"))
    } 
    else{
      //if already saved, use the relevant authorID and add as Foreign Key field autherID in books table (via bookToAdd)
      bookToAdd.authorID = a.authorID
    }

    //save the book
    let newBook = helpers.sellBook(bookToAdd, sqldb);
    newBook
    .then(res => console.log("was the book saved?? ", res))
    //.catch(err => console.log("error saving the book", err))
    
    res.send("ok")
  
  }).catch(err=>console.log("A CATCH ERROR ",err))

  //At this point the author should 
  //Now save the book

})

//get books in the db
router.get('/sqlallbooks',(req,res)=>{
  let sql = 'SELECT * FROM books';
  let query = sqldb.query(sql, (err,result)=>{
    if(err) throw err;
    console.log( "onnnnn ", res)
    res.json(result)

  })
})



module.exports = router;