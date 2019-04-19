const fs = require("fs");
//file uploader
// const fileUpload = require('express-fileupload');
// router.use(fileUpload());


module.exports = {
  getMaxId: function(stuff){
    //return max id of stuff json array
    //console.log("stuff", stuff)
    if(!stuff.length){
      return 1;
    }
    var max = stuff.reduce((prev, curr)=> prev.id > curr.id ? prev : curr);
    return max.id
  
  },
  isAuthorAlreadySaved: function(theBook,sqldb){
   return new Promise((resolve,reject)=>{
    let sql = 'SELECT * from authors WHERE authorName = "'+theBook[0].author+'";'
    
    let query = sqldb.query(sql, (err, res) =>{
      if(err) reject('err');
      //console.log("res is ", res)
      if(!res.length){
        console.log("author doesnt exist")
        resolve(false)
      }else if(res.length === 1){
       console.log("author exists", res[0].authorID)
        resolve(res[0])
      }else if(res.length >1){
        //author is in authors table more than once!!
        //use first
         //console.log("this shouldnt happen")
        resolve(res[0])
       
      }
    });

   })
   
  },
  saveAuthor: function(authorname,db){
    console.log("authorname: ", authorname)
    return new Promise((resolve,reject)=>{
      let sql = 'INSERT INTO authors SET authorName=?';
      let query = db.query(sql, authorname, (err,results) => {
        if(err) {
          reject('author table error')
        }else{
          resolve(results)
        }
      })
    })
  },
  sellBook: function(book, db){
    return new Promise((resolve,reject)=>{
      let sql = 'INSERT INTO books set ?';
     // console.log(book)
      let query = db.query(sql,book, (err,res)=>{
        if(err){
          reject(err)
        }else{
          if(!res.insertId){
            console.log("no insert id !! \n\n\n\n\n", res)
          }
          resolve(res)
        }
      })
    })
  },
  watchBooks: function(){
    fs.watchFile('./models/books.json', (curr, prev) => {
      if(curr){
        fs.readFile('./models/books.json', (err,data)=>{
          if(err) throw err;
          console.log("books updated (helper), bookslength: ",JSON.parse(data).length)
          return JSON.parse(data);
        })
      } 
    });
  },
  getLatestBooks: function(){
    return new Promise((resolve,reject)=>{
      fs.readFile('./models/books.json', (err,data)=>{
        if(err) reject(err);
        resolve(JSON.parse(data));
       
      })
    })
 
  },
  writeFile: function(req,updated, theBook){
    return new Promise((resolve,reject)=>{
      fs.writeFile('./models/books.json', updated, 'utf8', err =>{
        //console.log("write file has recieved ", theBook.imageurl)
        //console.log("write has recieved ", updated);
          if(err) {
         
            reject("error_msg", `There was a problem editing ${theBook.title}` )
            
          }else{
            //Syncronize the sql version (if there is one)
            //1. is forSale true?, AND does it have a shopID?
            //2. if so, update sql as well
            //console.log("write file is resolving with ")
            resolve(theBook);
      
          }
      })
    })
  },
  findOneBook: function(bookID, db){
    return new Promise((resolve,reject)=>{
      let sql = `SELECT books.bookTitle,books.bookPrice,books.bookID,books.bookDescription,books.bookJsonId, books.userBookImage, books.userID, authors.authorID,authors.authorName from books, authors WHERE books.authorID = authors.authorID AND books.bookID = ?`
     console.log("have book id??" , bookID)
      let query = db.query(sql, parseInt(bookID.bookID), (err,res)=>{
        if(err){
          reject(err)
        }else{
          console.log("helper resolve ", res.length)
          resolve(res)
        }
      })
    })
  },
  saveMessage: function(dets,db){
    //console.log("dets: ", dets)
    return new Promise((resolve,reject)=>{
      let sql = 'INSERT INTO messages SET ?';
      let query = db.query(sql, dets, (err,results) => {
        if(err) {
          reject('error saving message')
        }else{
          resolve(results)
        }
      })
    })
  },
  checkMessages: function(userid, db){
    console.log("userid: ", userid)
    return new Promise((resolve,reject)=>{
      let sql = 'SELECT * FROM messages WHERE forID = ?';
      let query = db.query(sql, userid, (err,results) => {
        if(err) {
          reject('error finding message')
        }else{
          resolve(results)
        }
      })
    })
  },
  bookHasAssocMsg: function(bookID,sqldb){
    return new Promise((resolve,reject)=>{
     let sql = 'SELECT * from messages WHERE bookID = ?';
     
     let query = sqldb.query(sql, bookID, (err, res) =>{
       if(err) reject('err');
       //console.log("res is ", res)
       if(!res.length){
         console.log("no messages")
         resolve(false)
       }else{
        console.log("messages exist", res.length)
         resolve(res)
       }
     });
 
    })
    
   },
   deleteAssocMsgs: function(bookID,sqldb){
    return new Promise((resolve,reject)=>{
     let sql = 'DELETE from messages WHERE bookID = ?';
     
     let query = sqldb.query(sql, bookID, (err, res) =>{
       if(err) reject('err');
       console.log("result length of msgs deleted: ", res.affectedRows)
      
      resolve(res.affectedRows) 
     });
    })
   },

  //  createTheDb: function(sqldb){
  //    return new Promise((resolve,reject)=>{
  //     //let createDB = `CREATE DATABASE pretendbookshop;`;
  //     let use = `use pretendbookshop;`;
  //      let authors = `CREATE TABLE authors (
  //       authorID int(11) NOT NULL,
  //       authorName varchar(255) NOT NULL,
  //       PRIMARY KEY (authorID)
  //     );`;
  //      let books = `CREATE TABLE books (
  //       bookID int(11) NOT NULL,
  //       bookTitle varchar(255) NOT NULL,
  //       bookImage varchar(255) DEFAULT NULL,
  //       bookDescription text,
  //       userID varchar(255) NOT NULL,
  //       bookPrice int(11) NOT NULL,
  //       authorID int(11),
  //       userReview text NOT NULL,
  //       userBookImage varchar(255) DEFAULT NULL,
  //       bookCondition varchar(255) NOT NULL,
  //       bookJsonID int(11) DEFAULT NULL,
  //       PRIMARY KEY (bookID),
  //       FOREIGN KEY (authorID) REFERENCES authors(authorID)
  //     );`;

  //     let messages = `CREATE TABLE messages (
  //       msgID int(11) NOT NULL,
  //       bookID int(11) DEFAULT NULL,
  //       sentID varchar(255) NOT NULL,
  //       forID varchar(255) NOT NULL,
  //       theMsg text NOT NULL,
  //       msgWhen datetime DEFAULT CURRENT_TIMESTAMP,
  //       PRIMARY KEY (msgID)
  //     );`;
     

  //      let query = sqldb.query(`${authors} ${books} ${messages}`, (err,res)=>{
  //        if(err) reject(err);
  //        console.log("authors created");
  //        resolve(res);
  //      })
  //    })
  //  },

   //to create the database tables on initial setup
   exactDump: function(sqldb){
    return new Promise((resolve,reject)=>{
      //let createDB = `CREATE DATABASE pretendbookshop;`;
      let use = `use pretendbookshop;`;
       let authors = `CREATE TABLE authors (
        authorID int(11) NOT NULL,
        authorName varchar(255) NOT NULL
      );`;
       let books = `CREATE TABLE books (
        bookID int(11) NOT NULL,
        isbn varchar(255) DEFAULT NULL,
        bookTitle varchar(255) NOT NULL,
        bookImage varchar(255) DEFAULT NULL,
        bookDescription text,
        userID varchar(255) DEFAULT NULL,
        bookPrice int(11) NOT NULL,
        authorID int(11) NOT NULL,
        userReview text,
        userBookImage varchar(255) DEFAULT NULL,
        bookCondition varchar(255) DEFAULT NULL,
        bookJsonID int(11) DEFAULT NULL
      );`;

      let messages = `CREATE TABLE messages (
        msgID int(11) NOT NULL,
        bookID int(11) NOT NULL,
        sentID varchar(255) NOT NULL,
        forID varchar(255) NOT NULL,
        theMsg text NOT NULL,
        msgWhen datetime DEFAULT CURRENT_TIMESTAMP
      );`;

      let alter1 = `ALTER TABLE authors
      ADD PRIMARY KEY (authorID);`;
      let alter2 = `ALTER TABLE books
      ADD PRIMARY KEY (bookID),
      ADD KEY authorID (authorID);`;
      let alter3 = `ALTER TABLE messages
      ADD PRIMARY KEY (msgID),
      ADD KEY bookID (bookID);`;
      let alter4 = `ALTER TABLE authors
      MODIFY authorID int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;`;
      let alter5 = `ALTER TABLE books
      MODIFY bookID int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;`;
      let alter6 = `ALTER TABLE messages
      MODIFY msgID int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;`;
      let alter7 = `ALTER TABLE books
      ADD CONSTRAINT books_ibfk_1 FOREIGN KEY (authorID) REFERENCES authors (authorID);`;
      let alter8 = `ALTER TABLE messages
      ADD CONSTRAINT messages_ibfk_1 FOREIGN KEY (bookID) REFERENCES books (bookID);`;
     

       let query = sqldb.query(`${authors} ${books} ${messages} ${alter1} ${alter2} ${alter3} ${alter4} ${alter5} ${alter6} ${alter7} ${alter8}`, (err,res)=>{
         if(err) reject(err);
         console.log("stuff created");
         resolve(res);
       })
     })

   }



}