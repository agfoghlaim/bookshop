//This will handle deleteing a json book
//Will have more control by handeling it on the client because after the book is deleted, it also needs to send req to the shop(sql).js to delete it there too.

// const deleteJsonBtn = document.getElementById('deleteJsonBook');
// if(deleteJsonBtn){
//  // console.log(deleteJsonBtn)
//   deleteJsonBtn.addEventListener('click', function(e){
//     deleteBook(e)
//   });
// }
//delete a json book()
const booksColumn = document.getElementById('dashboard-json-col');
if(booksColumn){
  booksColumn.addEventListener('click', function(e){
    deleteBook(e);
  })
}


/*
//req to /deletebookclient
will respond with json books, poputlateJsonBooks()
//then if the book was for sale, send req to shop/removesqlbook
this will delete the book and any associated messages, will redirect ot shop/asqlallusers books and eventually respond with the user's sql/shop books.
Then run populateBooks()
*/
function deleteBook(e){
  
  if(!e.target.dataset.bookid){
    return;
  }
  //is the book for sale? (ie seconde fetch request)
  const forSale = e.target.dataset.forsale;
  
  //req to delete the book
  fetch(`/deleteBookclient/${e.target.dataset.bookid}`) 
  .then(data=> data.json())
  .then(books => {
    
    console.log("got delete book, populating...", books)

    populateJsonBooks(books);
    
    //end if book not for sale
    if(!forSale || forSale === 'false'){
      console.log("C: not for sale")
      return;
    }else{
      //req to delete the sql boook
      console.log("book was for sale, sending sql request with shopid...", forSale, e.target.dataset.shopid)
      fetch(`/shop/removesqlbook/${e.target.dataset.shopid}`)
      .then(data => data.json())
      .then(books => {
        console.log("books from sql delete", books.length)
        //POPUTATE WITH THESE BOOKS
        populateBooks(books)
      })
    }
    //then if forSale is true, send request to  delete sql version.
    //empty books div first because populateBooks prepends to end
    //shopBooks.innerHTML = '';
    //populateBooks(books);
  })
}


function populateJsonBooks(books){
  //if the user has no books for sale, say so 
  const jsonBooksCol = document.getElementById('dashboard-json-col');
  jsonBooksCol.innerHTML = '';
  if(!books.length){
    let str = `<p>You have no books saved.</p>`;
    jsonBooksCol.innerHTML = str;
  }else{
   // console.log("books", books)
    books.map(b=>{
      let str = `
      <div class="json-book-item">
      
      <h5>${b.title}<small> by 
      ${b.author}</small></h5>
      <img class="thumbnail-size-img"  src="${b.imageurl}">
      <p>${b.description}</p>
      <p>forSale: ${b.forSale}</p>
      <p>Price: ${b.price}</p>
      <a href="/deleteBook/${b.id}" class="btn btn-danger">Delete</a>
      <button class="btn btn-danger" data-bookid="${b.id}" data-shopid="${b.shopID}" data-forsale="${b.forSale}"  id="deleteJsonBook">Delete (clientside)</button>
      <a href="/editJsonBook/${b.id}" class="btn btn-info">Edit</a>
      <a href="/shop/addsqlbook/${b.id}" class="btn btn-primary">Sell</a>
      </div>
      `;
      //jsonBooksCol.insertAdjacentHTML('beforeend', str); 
      jsonBooksCol.innerHTML=str; 
    })

  }
  
}

// function populateSqlBooks(books){

//   //if the user has no books for sale, say so 
//   const jsonBooksCol = document.getElementById('dashboard-json-col');
//   jsonBooksCol.innerHTML = '';
//   if(!books.length){
//     let str = `<p>You have no books saved.</p>`;
//     jsonBooksCol.innerHTML = str;
//   }else{
//     console.log("books", books)
//     books.map(b=>{
//       let str = `
//       <div class="json-book-item">
      
//       <h5>${b.title}<small> by 
//       ${b.author}</small></h5>
//       <p>${b.description}</p>
//       <p>forSale: ${b.forSale}</p>
//       <p>Price: ${b.price}</p>
//       <a href="/deleteBook/${b.id}" class="btn btn-danger">Delete</a>
//       <button class="btn btn-danger" data-bookid="${b.id}" data-shopid="${b.shopID}"  id="deleteJsonBook">Delete (clientside)</button>
//       <a href="/editJsonBook/${b.id}" class="btn btn-info">Edit</a>
//       <a href="/shop/addsqlbook/${b.id}" class="btn btn-primary">Sell</a>
//       </div>
//       `;
//       jsonBooksCol.insertAdjacentHTML('beforeend', str); 
//     })

//   }

// }


//=============================================

//From shopfront.js

//=============================================
const getAllBtn = document.getElementById('getallbooks');
if(getAllBtn){
  getAllBtn.addEventListener('click', getBooks);
}

const shopBooks = document.getElementById('shop-books');
function getBooks(){
  fetch('/shop/sqlallusersbooks')
  //.then(res =>response => response.json())
  .then(data=> data.json())
  .then(books => populateBooks(books))

  //after books are populated, add event listener to delete button
  .then(() => addEventListeners()
  )
  .catch(err => console.log("error", err))
}


function populateBooks(books){
  //if the user has no books for sale, say so 
  if(!books.length){
    let str = `<p>You have no books for sale.</p>`;
    shopBooks.innerHTML = str;
  }else{
    //shopBooks.innerHTML = '';
    console.log("sql books", books)
    books.map(b=>{
      let str = `
      <div class="shop-book-item">
      <h5>${b.bookTitle}<small> by ${b.authorName}
      </small></h5>
      <p>${b.bookDescription}</p>
      <p>Price:${b.bookPrice}</p>
     
      <button class="btn btn-danger removeFrom" data-bookID="${b.bookID}"  data-bookJsonID="${b.bookJsonId}" id="removeFromShop-${b.bookID}">Remove from shop</button>
      </div>
      `;
      shopBooks.insertAdjacentHTML('beforeend', str); 
      //shopBooks.innerHTML = str;
    })

  }
  
}

//add listeners to populated books buttons
function addEventListeners(){
  //add event listener to the parent div
  const shopBooks = document.querySelector('#shop-books');
  shopBooks.addEventListener('click', function(e){deleteSqlBook(e)})
 
}

function deleteSqlBook(e){
  console.log("delete ", e)
  //first make sure the target is the delete button
  if(e.target.id.substring(0,10) != 'removeFrom'){
   // console.log("not the button",e.target.id.substring(0,9))
    return;
  }
  console.log("listening to this, will delete", e.target.dataset.bookid)
  fetch(`/shop/removesqlbook/${e.target.dataset.bookid}`) 
  .then(data=> data.json())
  .then(books => {
    console.log(books);

    //empty books div first because populateBooks prepends to end
    shopBooks.innerHTML = '';
    populateBooks(books);
  })
  .then(()=>{
    //need json id not sqlid!! 

    /*
    NOTE
    here when req is sent to /editJsonBook, send null as second paramater :shopid, at this point the book has been removed and want to set the json shopid to null
    */
    // let theURL = `/editJsonBook/${e.target.dataset.bookjsonid}/${e.target.dataset.bookid}/forSale/false`;
    let theURL = `/editJsonBook/${e.target.dataset.bookjsonid}/null/forSale/false`;
    
    //req editJsonBook (index.js) which will set json 'forSale' field to false
    fetch(theURL)
    .then(()=> console.log("forSale field updated"))
    .catch(error => console.log("For Sale Field Error: ", error))
  })
}

