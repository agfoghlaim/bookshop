//========================================

//This file contains routes for CRUDing books.json

//==============================================

const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const fs = require("fs");

const http = require('http');

//marie's helpers file
const helpers = require('../helpers');

//file uploader
const fileUpload = require('express-fileupload');

//fileUpload middleware (only need on json routes??)
router.use(fileUpload());



//=====================

  //GET all json books

//=====================
router.get('/', (req,res) => {
  res.render('home')}
);


//=====================

 //dashboard (when user signs in)

//=====================

router.get('/dashboard', ensureAuthenticated, (req,res) => { 
  //checkMessages redirects here with a querystring called messages
  let userMessages ='';
  if(req.query.messages){

    userMessages = JSON.parse(req.query.messages); 
  }
  //get all books from the json file with current user's id
  let theBooks;
  fs.readFile('./models/books.json', (err,data)=>{
    if(err) throw err;

    theBooks = JSON.parse(data);
    usersBooks = theBooks.filter(b => b.userID === req.user.id)
    //console.log("users books length ", usersBooks.length)
    console.log("sending " + usersBooks.length + " books to dashboard")
   // console.log("sending these books to dashboard ", usersBooks)
   if(userMessages !== ''){
    res.render('dashboard', {usersBooks, userMessages})
   }else{
    res.render('dashboard', {usersBooks})
   }
    
  });
  
})


//=====================

 //render add book page

//=====================
router.get('/addBookPage', ensureAuthenticated, (req,res)=>{
  res.render('addBookPage', {newBook:''})
})


//=====================

  //DELETE a json book CLIENT SIDE HANDLES IT VERSION

//=====================
router.get('/deleteBookclient/:id', (req,res)=>{
  //request delete sql if book exists there
  let forSale, shopID; 
  const latestBooks = helpers.getLatestBooks();
  latestBooks
  //remove the relevant book
  .then(books=> {
    //find out if book is in db
    forSale = books.filter(b => b.id === parseInt(req.params.id))[0].forSale;
    shopID = books.filter(b => b.id === parseInt(req.params.id))[0].shopID;
    console.log("forsale: and shop ", forSale, shopID)

    //return ALL books without the deleted book
    //need to return ALL USEERS Books
    return books.filter(b =>  b.id !== parseInt(req.params.id) && b.userID === req.user.id);

    
  })
      //resave books
  .then(newBooks => JSON.stringify(newBooks, null, 4)) 
  .then(newBooks => {
    fs.writeFile('./models/books.json', newBooks, 'utf8', err =>{
      if(err) {
        req.flash("error_msg", `Your book may not have been deleted` );
       
        res.redirect('/dashboard')
      }else{

          res.send(newBooks)
        //}
        
      }   
    }) 
  }) 
})

  //=====================

  //RENDER EDIT a json book

//=====================
router.get('/editJsonBook/:id', (req,res)=>{
  if(!req.params.id || !req.user){
    res.redirect('/')
    return;
  }
  //find the correct book, render edit page, pass the book details
  const latestBooks = helpers.getLatestBooks();
  latestBooks.then(books =>{
    let theBook = books.filter(b=>b.id === parseInt(req.params.id) && b.userID === req.user.id);
    //console.log("thebook", theBook)
     res.render('editBookPage', {theBook})
  })

})



//====================================================

// - EDIT Json Book (and maybe redirect to edit sql book)

//=====================================================

router.post('/editJsonBook/:id', (req, res)=>{
  const {title, author, description, price, userReview, condition}= req.body;
  const idToFind = parseInt(req.params.id);
  const latestBooks = helpers.getLatestBooks();
  let books;
  let theBook;//??
  

  //deal with the image first???

  //set latest books
  latestBooks
    .then((b)=>{
      books = b;
      theBook = books.filter(b => b.id===idToFind)[0];
      //return theBook;  
  })
  //now books and thebook are available
  //deal with the image - 3 scenarios
.then(()=>{
        //in case no image uploaded (this SHOULD never happen) and there's no google img, use default-img.png
        if(!req.files &&  theBook.imageurl === ''){
          console.log("no img uploaded ", theBook.imageurl)
          theBook.imageurl= '/default-img.png';
       
        }

        //if an image was uploaded
        if(req.files){
          const uploadImg = req.files.uploadImg;
          const filename = uploadImg.name;
          //const extension = filename.split('.')[1];

          //just use png for everything
          const extension = 'png';

          //save the new image
          const saveImg =
            new Promise((resolve,reject)=>{
              uploadImg.mv(`./bookimages/img-${theBook.id}.${extension}` , function(err){
                if(err){
                  reject(res.status(500).send(err));
                }
                 console.log("changing book to whatever they uploaded")
                 //add / so same frontend code can show google urls as well
                  theBook.imageurl = `/img-${theBook.id}.${extension}`; 
                  console.log("the book imageurl ", theBook.imageurl)
                  theURL = `img-${theBook.id}.${extension}`;
                resolve(`img-${theBook.id}.${extension} saved`);
              })
            })
          //when image has saved and theBook.imageurl has been updated...
          //write the new books to json.
          saveImg.then(w=> {
          
                //write the file....
                 let i = books.map(b => b.id).indexOf(parseInt(req.params.id));
              
                 theBook.title = title;
                 theBook.author = author; 
                 theBook.description = description;
                 theBook.price = price;
                 theBook.userReview = userReview;
                 theBook.condition = condition;

                 const editedBooks = books;
                 editedBooks.splice(i,1,theBook);
        
                 
                 const updated = JSON.stringify(editedBooks, null ,4)
                 const writeFile = helpers.writeFile(req, updated, theBook);
              
           
                     
                   writeFile.then(theBook=>{
                       //check if book is for sale (ie. in sqldb)
                       //console.log("Check the book here...", theBook)
                       if(theBook.shopID && (theBook.forSale===true||theBook.forSale==='true')){
                         //need to update book in db too!!
                         //console.log("book is for sale, will update sql")
                         const string = encodeURIComponent(JSON.stringify(theBook));

                         //redirect to sql edit route
                         res.redirect('/shop/sqleditbook/?bookupdates=' + string);
                       }else{
                         //console.log("this book is not for sale, done.")
                         req.flash("success_msg", `${theBook.title} edited successfully.` );
                         //redirect to dashboard via checkMessages
                         res.redirect('/shop/checkMessages')
                       }
                      

                   }).catch(err =>{
                     req.flash(err);
                      res.redirect('/dashboard')
                   })

          })
          
        }else{
             //no file uploaded
             //NOT DRY!!!
           let i = books.map(b => b.id).indexOf(parseInt(req.params.id));
           //console.log("title and req.params.title2", title, req.params.title)
           theBook.title = title;
           theBook.author = author; 
           theBook.description = description;
           theBook.price = price;
           theBook.userReview = userReview;
           theBook.condition = condition;
          
           const editedBooks = books;
           editedBooks.splice(i,1,theBook);
           //console.log("putting in ", theBook, " at ", editedBooks[i])
           const updated = JSON.stringify(editedBooks, null ,4)
           //console.log("and updated is ", updated)
           const writeFile = helpers.writeFile(req, updated, theBook);
          
    
         
             writeFile.then(theBook=>{
              //console.log("Check the book here 2...", theBook)
                 //if in sqldb
                 if(theBook.shopID && (theBook.forSale===true||theBook.forSale==='true')){
                   //update sql
                   const string = encodeURIComponent(JSON.stringify(theBook));
                   res.redirect('/shop/sqleditbook/?bookupdates=' + string);
                 }else{
                   console.log("not in shop")
                   req.flash("success_msg", `${theBook.title} edited successfully.` );

                  //redirect to dashboard via checkMessages
                  res.redirect('/shop/checkMessages')
                 }

              
             }).catch(err =>{
               req.flash("error_msg", `${theBook.title} error saving to db.`);
                 res.redirect('/dashboard')
             })
        }

       
 })//image saved

})

//================================================
// try to computer edit a book by sending dets in params
//eg /editJsonBook/49/condition/mediocre
//changes condition of book with id 49 to 'mediocre'
//=====================================================
router.get('/editJsonBook/:id/:shopid/:field/:thevalue', (req, res)=>{
 //console.log("The params to editJSon book ", req.params)
  const idToFind = parseInt(req.params.id);
  const latestBooks = helpers.getLatestBooks();
  latestBooks.then(books =>{
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
  
})

//===================================================================

//ADD  a book

//===================================================================

router.post('/addBook', (req,res) =>{
  console.log("form submitted")
  let {title, author, description, userReview, condition, price, imageurl} = req.body;//get details from req.body
 
 const latestBooks = helpers.getLatestBooks();
 latestBooks.then(books =>{
  const newBook = {
    title, 
    author, 
    description,
    userReview,
    condition, 
    forSale: false,
    price: parseInt(price),
    imageurl,
    id: helpers.getMaxId(books) +1, //get current max id from json file
    userID: req.user.id,//add product page protected to avoid errors here (ie when user is not logged in req.user is not defined)
  }
  //=======================
  //Option 1 - save uploaded image
  //=======================
  
  //if an image was uploaded
  if(req.files){
    const uploadImg = req.files.uploadImg;
    const filename = uploadImg.name;

    //need to save as img-bookid(because people could have imgs with same name.) To do this split the filename and keep after the dot (eg .png)
   const extension = filename.split('.')[1];
   //console.log("upload img ", filename)
    uploadImg.mv(`./bookimages/img-${newBook.id}.${extension}` , function(err){
      if(err){
        return res.status(500).send(err);
      }
  
      console.log("upload image " + req.files.uploadImg.name + " saved");
      
    })
  //else if they choose the google image
  }else if(imageurl){
    console.log("imageurl ", imageurl)

 
  //=======================
  //Option 2 - save image from api
  //=======================
 // if(imageurl){
    //const niceTitle = newBook.title.replace(/[\. ,:-]+/g, "-")
    const niceTitle = `img-${newBook.id}`;
    const file = fs.createWriteStream(`./bookimages/${niceTitle}.jpg`);
      const request = http.get(imageurl, function(response) {
        //console.log("saving google image ")
        response.pipe(file);
      });
  //else use the default image
  }else{
    newBook.imageurl = 'default-img.png';
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

 // })
   
 })//end latestBooks.then

  
})



module.exports = router;