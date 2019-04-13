const fs = require("fs");
//file uploader


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
 
  }
  // saveImg: function(theBook, uploadImg, extension){
  //   return new Promise((resolve,reject)=>{
      
     
        
  //       //console.log("upload img ", filename)
  //       uploadImg.mv(`./bookimages/img-${theBook.id}.${extension}` , function(err){
  //         if(err){
  //           reject(res.status(500).send(err));
  //           //OVERWRITE????
  //         }
  //         //set the book name in the json data
  //         theBook.imageurl = `img-${theBook.id}.${extension}`;
  //         console.log("resolving with ", theBook.imageurl)
  //         resolve(theBook.imageurl);
  //         //console.log(theBook.imageurl);
  //         //console.log("the book \n\n\n\n\n", theBook)
  //         //console.log("upload image " + req.files.uploadImg.name + " saved");
          
  //       })
  //     //dont need else statement because it's this by default?


  //   })
  //}



}