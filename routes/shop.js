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


//add a book to sql db
router.get('/addsqlbook/:id', (req,res)=>{
  //find (in the json) the book user wants to sell
  const theBook = books.filter(b=> b.id === parseInt(req.params.id))

  //check forSale in json to make sure it's not already for sale
  console.log("the book for sale : ", theBook.forSale)
  if(theBook[0].forSale === true || theBook[0].forSale === "true"){
    console.log("book already for sale");
    req.flash("error_msg", `${theBook[0].title} is already for sale!` );
    res.redirect('/dashboard');
    return;
  }

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
    bookJsonID: theBook[0].id
  }

  //check if author is already saved in db?
  let authorSaved =helpers.isAuthorAlreadySaved(theBook,sqldb)
  authorSaved.then(a =>{
    //if authornot saved, save it
    if(!a){
      //if not, save author
      console.log("will save author too")
      let saveauthor = helpers.saveAuthor(theBook[0].author, sqldb);
      saveauthor
      .then(res => {
        //set the relevant authorID
        bookToAdd.authorID = res.insertId;
      })
      .then(()=>{
            //THEN save the book ()
            let newBook = helpers.sellBook(bookToAdd, sqldb);
            newBook
            .then(res => {
              console.log("book saved, updating forsale field in json")
              //to update, can i send a request to here??
              ///editJsonBook/:id
              
            })
            .catch(err => console.log("error saving the book:", err))
      })
      .catch(err => console.log("problem"))
    } 
    //if author is already in the db
    else{
      //if already saved, use the relevant authorID and add as Foreign Key field autherID in books table (via bookToAdd)
      console.log("settin authorid")
      bookToAdd.authorID = a.authorID;

      //and save the book
                  //THEN save the book (this should be in a then)
              let newBook = helpers.sellBook(bookToAdd, sqldb);
              newBook
              .then(res => {
                console.log("author existed, book saved, will update forsale field in json next")      
              })
              .catch(err => console.log("error saving the book:", err))
    }


  
  }).catch(err=>console.log("SAVING AUTHOR RELATED ERROR CAUGHT: ",err))

  //now redirect where the json 'forSale' field will be set to true.
  res.redirect(`/editJsonBook/${req.params.id}/forSale/true`)
})

//============================================================

//remove sql book (make not for sale)

//=============================================
router.get('/removeqlbook/:id', (req,res)=>{
  console.log("will remove: ", req.params.id)
  let bookid = parseInt(req.params.id)
  let sql = `DELETE FROM books WHERE bookID = ${bookid};`;
  let query = sqldb.query(sql, (err,result)=>{
    if(err) throw err;
    //!!!!!
    //!!!
    //update json to not for sale
    //client side will have to call this route after it recieves this response!!

    //redirect to get all books (front end fetch expects array of books)
    res.redirect('/shop/sqlallusersbooks')
    //res.send(result)
  })
})


//=============================================================

//get all user's books from sql db (books for sale)

//=============================================================

router.get('/sqlallusersbooks',(req,res)=>{

  let sql = `SELECT books.bookTitle,books.bookPrice,books.bookID,books.bookDescription,books.bookJsonId,authors.authorID,authors.authorName from books, authors WHERE books.authorID = authors.authorID AND books.userID = "${req.user.id}"`;
  let query = sqldb.query(sql, (err,result)=>{
    if(err) throw err;

    //just send
    res.send(result)
  })
})



module.exports = router;