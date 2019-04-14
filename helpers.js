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
  }
  
  // saveImg: function(theBook, extension,uploadImg ){
   
  //   return new Promise(resolve,reject){
  //     uploadImg.mv(`./bookimages/img-${theBook.id}.${extension}` , function(err){
  //       if(err){
  //         return res.status(500).send(err);
  //       }
  //        console.log("changing book to whatever they uploaded")
  //         theBook.imageurl = `img-${theBook.id}.${extension}`; 
   
  //     })
  //   }
  // }
 


}