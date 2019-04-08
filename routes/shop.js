//for sql/shop related routes
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const fs = require("fs");
const sqldb = require('../config/db');


//marie's helpers/query file to keep it tidy
const helpers = require('../helpers');

//get books data from json file (initially)
var books;
fs.readFile('./models/books.json', (err,data)=>{
  if(err) throw err;
  books = JSON.parse(data);
  console.log("XXXXXXXXXX \t\t\t\t books updated first time")
})


//==================================================

// watch for changes in the .json file and update the books variable everytime it changes (Should not be in shop.js???)

//=================================================
//books = helpers.watchBooks();

// fs.watchFile('./models/books.json', (curr, prev) => {
//   if(curr){
//     fs.readFile('./models/books.json', (err,data)=>{
//       if(err) throw err;
//       books = JSON.parse(data);
//       console.log("books updated")
//     })
//   } 
// });



//add a book to sql db
router.get('/addsqlbook/:id', (req,res)=>{
  
 let books = helpers.getLatestBooks();
  books.then(books =>{
    //find (in the json) the book user wants to sell
    const theBook = books.filter(b=>  b.id === parseInt(req.params.id))

    //is book already for sale?
    if(theBook[0].forSale === true || theBook[0].forSale === "true"){
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
        console.log("will save author too")
        let saveauthor = helpers.saveAuthor(theBook[0].author, sqldb);
        saveauthor
        .then(res => {
          //set the relevant authorID in the bookToAdd object
          bookToAdd.authorID = res.insertId;
        })
        .then(()=>{
              //THEN save the book 
              let newBook = helpers.sellBook(bookToAdd, sqldb);
              newBook
              .then(res => {
                console.log("book saved, will update forsale field in json")
                //to update, can i send a request to here??
                ///editJsonBook/:id
                
              })
              .catch(err => console.log("error saving the book:", err))
        })
        .catch(err => console.log("problem"))
      } 
      //if author is already in the db
      else{
        //if already saved, use the relevant authorID and add as Foreign Key field authorID in books table (via bookToAdd)
      
        bookToAdd.authorID = a.authorID;
        
        //THEN save the book 
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

  })//end of books.then, (ie get the latest json books, then do all this)
   .catch(err=>console.log("Error: ",err)) 
})

//============================================================

//remove sql book (make not for sale)

//=============================================
router.get('/removeqlbook/:id', (req,res)=>{
  let bookid = parseInt(req.params.id)
  let sql = `DELETE FROM books WHERE bookID = ${bookid};`;
  let query = sqldb.query(sql, (err,result)=>{
    if(err) throw err;
    //!!!!!
    //!!!
    //update json to not for sale
    //client side will have to call this route after it recieves this response!!

    //redirect to get all books (front end fetch expects array of books which will eventually be sent from /sqlaluserbooks)
    res.redirect('/shop/sqlallusersbooks')
    
  })
})


//=============================================================

//get all user's books from sql db (books for sale)

//=============================================================

router.get('/sqlallusersbooks',(req,res)=>{

  let sql = `SELECT books.bookTitle,books.bookPrice,books.bookID,books.bookDescription,books.bookJsonId,authors.authorID,authors.authorName from books, authors WHERE books.authorID = authors.authorID AND books.userID = "${req.user.id}"`;
  let query = sqldb.query(sql, (err,result)=>{
    if(err) throw err;

    //just send, client will deal with it
    res.send(result)
  })
})



module.exports = router;