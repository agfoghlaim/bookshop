//for sql/shop related routes
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const fs = require("fs");
const sqldb = require('../config/db');

// //to send post requests
// const querystring = require('querystring');
// const http = require('http');


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
                console.log("book saved, will update forsale field in json,need to the the sql id here", result)
                //to update, can i send a request to here??
                ///editJsonBook/:id
                //use result.insertId
                res.redirect(`/editJsonBook/${req.params.id}/${result.insertID}/forSale/true`)
                
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
        .then(result => {
          console.log("author existed, book saved, will update forsale field in json next, need id of book just saved", result.insertId);
          
          //now redirect where the json 'forSale' field will be set to true.
  //in params send: jsonid, sqlid,field,value for field
          res.redirect(`/editJsonBook/${req.params.id}/${result.insertId}/forSale/true`)
        })
        .catch(err => console.log("error saving the book:", err))
      }


    
    }).catch(err=>console.log("SAVING AUTHOR RELATED ERROR CAUGHT: ",err))

  //now redirect where the json 'forSale' field will be set to true.
  //in params send: jsonid, sqlid,field,value for field
 // res.redirect(`/editJsonBook/${req.params.id}/forSale/true`)

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

router.post('/editsqlbook/:id',(req,res)=>{
  console.log("will edit")
})


//===========================================

//EDIT sql book
//(editjson book will redirect here before front end render)

//===========================================

router.get('/sqleditbook/', (req,res)=>{
  //console.log(req.query.bookupdates);
    const {title, author, description, price, userReview, condition,shopID }= JSON.parse(req.query.bookupdates);
    
  
  //need to do the sql update
  //then redirect? 
  let sqlauthor = `UPDATE authors SET authorName="${author}" WHERE authorID = (SELECT authorID FROM books WHERE bookID=${shopID})`;

  let sqlbook = `UPDATE books SET bookTitle="${title}", bookDescription="${description}", bookPrice="${price}", userReview="${userReview}", bookCondition="${condition}" WHERE bookID=${shopID}`;

  let bothQueries= sqldb.query(`${sqlauthor}; ${sqlbook}`, (err,result,fields)=>{
    if(err){
      console.log(err); 
      //throw err;
      req.flash("error_msg", `Oops! ${title} not edited.` );
      res.redirect('/dashboard')
    }
    //console.log("authorname updated", result[0])
    //console.log("authorname updated", result[1])
    req.flash("success_msg", `${title} edited successfully.` );
    res.redirect('/dashboard')
  })
  
})

module.exports = router;