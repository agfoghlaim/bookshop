module.exports = {
  getMaxId: function(stuff){
    //return max id of stuff json array
    console.log("stuff", stuff)
    var max = stuff.reduce((prev, curr)=> prev.id > curr.id ? prev : curr);
    return max.id
  
  },
  isAuthorAlreadySaved: function(theBook,sqldb){
   return new Promise((resolve,reject)=>{
    let sql = 'SELECT * from authors WHERE authorName LIKE "'+theBook[0].author+'";'
    
    let query = sqldb.query(sql, (err, res) =>{
      if(err) reject('err');
      console.log("res is ", res)
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
      console.log(book)
      let query = db.query(sql,book, (err,res)=>{
        if(err){
          reject(err)
        }else{
          resolve(res)
        }
      })
    })
  }



}