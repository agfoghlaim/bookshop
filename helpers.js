module.exports = {
  getMaxId: function(stuff){
    //return max id of stuff json array
    console.log("stuff", stuff)
    var max = stuff.reduce((prev, curr)=> prev.id > curr.id ? prev : curr);
    return max.id
  
  }
}