//for sql/shop related routes

//================================
/*

1. ADD A BOOK '/addsqlbook/:id'

2. REMOVE A BOOK '/removesqlbook/:id'

3. GET CURRENT USERS BOOKS '/sqlallusersbooks'

4. GET ALL BOOKS FROM DB '/'

5. EDIT A BOOK '/sqleditbook/'

6. RENDER CONTACT SELLER PAGE

7. SAVE MESSAGE FOR SELLER

*/
const express = require('express');
const router = express.Router();

//TODO, REMOVE IF NOTHING ENDS UP USING IT
const { ensureAuthenticated } = require('../config/auth');
const fs = require("fs");
const sqldb = require('../config/db');

//marie's helpers/query file to keep it tidy
const helpers = require('../helpers');

//to send http requests
const http = require('http');

//TODO - DELETE (USE helpers.latestBooks instead)
//get books data from json file (initially)
var books;
fs.readFile('./models/books.json', (err,data)=>{
  if(err) throw err;
  books = JSON.parse(data);
  console.log("XXXXXXXXXX \t\t\t\t books updated first time")
})


/*
ADD a book to sql db
*/
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
      bookJsonID: theBook[0].id,
      userBookImage: theBook[0].imageurl
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
              .then(result => {
                console.log("book saved, will update forsale field in json,need to the the sql id here")
                //to update, can i send a request to here??
                ///editJsonBook/:id
                //use result.insertId
                console.log("do i have insert id??? ", result.insertID)
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
router.get('/removesqlbook/:id', (req,res)=>{
  console.log("deleting sql book with id ", req.params.id)
  let bookid = parseInt(req.params.id)
  let sql = `DELETE FROM books WHERE bookID = ${bookid};`;
  let query = sqldb.query(sql, (err,result)=>{
    if(err) throw err;
    //!!!!!
    //!!!
    //update json to not for sale
    //client side will have to call this route after it recieves this response!!

    //redirect to get all books (front end fetch expects array of books which will eventually be sent from /sqlaluserbooks)

    //res.send(result)
   res.redirect('/shop/sqlallusersbooks')
    
  })
})


//=============================================================

//get all user's books from sql db (books for sale)

//=============================================================

router.get('/sqlallusersbooks',(req,res)=>{

  let sql = `SELECT books.bookTitle,books.bookPrice,books.bookID,books.bookDescription,books.bookJsonId, books.userBookImage, authors.authorID,authors.authorName from books, authors WHERE books.authorID = authors.authorID AND books.userID = "${req.user.id}"`;
  let query = sqldb.query(sql, (err,result)=>{
    if(err) throw err;

    //just send, client will deal with it
    console.log("SQL sending ", result)
    res.send(result)
  })
})

router.post('/editsqlbook/:id',(req,res)=>{
  console.log("will edit")
})


//=============================================================

//get all  books from sql db (books for sale)

//=============================================================

router.get('/',(req,res)=>{

  let sql = `SELECT books.bookTitle,books.bookPrice,books.bookID,books.bookDescription,books.bookJsonID, books.userBookImage, books.userID, authors.authorID,authors.authorName from books, authors WHERE books.authorID = authors.authorID`;
  let query = sqldb.query(sql, (err,books)=>{
    if(err) throw err;

    //just send, client will deal with it
    res.render('shop', {books})
  })
})


//===========================================

//EDIT sql book
//(editjson book will redirect here before front end render)

//===========================================

router.get('/sqleditbook/', (req,res)=>{
  //console.log(req.query.bookupdates);

  //req from editjsonbook in index.js
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

// router.get('/contactSeller/:sellerID/:userID/:bookID', (req,res)=>{
 
//   //if user is not logged in redirect to login
//   if(!req.params.userID){
//     res.redirect('/users/login');
//   }else{
//     //first get details about the book to prepopulate the form
//     http.get(`http://localhost:5000/shop/query/${req.params.bookID}`, (resp)=>{
//       console.log(resp)
//       return resp;
//     }).on('end',()=>{
//       console.log("here");
//       resp.end();
//     })


//     res.render('contactSeller');
//   }
  
// })
/*
Render contact seller form
*/
router.get('/contactSeller', (req,res)=>{
 res.render('contactSeller');
  //if user is not logged in redirect to login
// console.log(req.body.msg)
  
})


/*
Query the db for a book
TODO  dont need all those params in the url!!!
TODO - don't think this route is ever used -???
*/

router.get('/contactSeller/:sellerID/:userID/:bookID',(req,res)=>{
  const bookID = req.params.bookID;
  let bookDets = helpers.findOneBook({bookID:bookID},sqldb);
  bookDets
  .then(result=>{
    console.log("the result ", result)
    res.render('contactSeller', {result})
  }).catch(err=>console.log(err))
})

/* 
Accept a query
*/
router.get('/query/:bookID', (req,res)=>{
  const bookID = req.params.bookID;
  let bookDets = helpers.findOneBook({bookID:bookID},sqldb);
  bookDets
  .then(result=>{
    console.log("the result ", result)
    res.send(result)
  }).catch(err=>console.log(err))
 
})


/*

Deal with contact seller form
(save message to db)

*/
router.post('/contactSeller', (req,res)=>{
  //console.log(req.body.message)
  //save the message somewhere
  //need the theMsg, bookID, sentID, forID, 
  const {theMsg, sentID, forID, bookID } = req.body;
  const messageDets = {theMsg, sentID, forID, bookID}
  console.log(theMsg, sentID, forID, bookID);
  const saveMessage = helpers.saveMessage(messageDets, sqldb);
  saveMessage
  .then(result=>{
    console.log("result", result)
  })
})


/*

CHECK FOR MESSAGES

when users login, they will redirect here
check if they have messages
redirect them to the dashboard
*/
router.get('/checkMessages', (req,res)=>{
  if(!req.user){
    console.log("not signed in !");
    res.redirect('login');
  }

  const checkMessages = helpers.checkMessages(req.user.id, sqldb);
  checkMessages
  .then(result =>{
    console.log("msg result ", result)
   // res.redirect('/dashboard', {result})
   // res.render('dashboard',{result})
   const string = encodeURIComponent(JSON.stringify(result));

//redirect to sql edit route
res.redirect('/dashboard/?messages=' + string);
  })
})


module.exports = router;


