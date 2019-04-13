//This will handle deleteing a json book
//Will have more control by handeling it on the client because after the book is deleted, it also needs to send req to the shop(sql).js to delete it there too.

// const deleteJsonBtn = document.getElementById('deleteJsonBook');
// if(deleteJsonBtn){
//  // console.log(deleteJsonBtn)
//   deleteJsonBtn.addEventListener('click', function(e){
//     deleteBook(e)
//   });
// }

const booksColumn = document.getElementById('dashboard-json-col');
booksColumn.addEventListener('click', function(e){
  deleteBook(e);
})

function deleteBook(e){
  //console.log("delete", e.target)
  if(!e.target.dataset.bookid){
    console.log("not a delete btn")
    return;
  }else{
   // console.log("is a del button")
  }
  const forSale = e.target.dataset.forsale;
 // console.log("FORSALE", e.target.dataset.forsale);
  //if(e.target.bookid)
  //check if book is for sale
  fetch(`/deleteBookclient/${e.target.dataset.bookid}`) 
  .then(data=> data.json())
  .then(books => {
    //console.log(books);
    console.log("got delete book, populating...")
    //populate page with updated books
    populateJsonBooks(books);
    //console.log("HEREEE ", "forsale: " + forSale, (forSale===false))
    if(!forSale || forSale === 'false'){
      console.log("C: not for sale")
      return;
    }else{
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
      <img src="${b.imageurl}">
      <p>${b.description}</p>
      <p>forSale: ${b.forSale}</p>
      <p>Price: ${b.price}</p>
      <a href="/deleteBook/${b.id}" class="btn btn-danger">Delete</a>
      <button class="btn btn-danger" data-bookid="${b.id}" data-shopid="${b.shopID}" data-forsale="${b.forSale}"  id="deleteJsonBook">Delete (clientside)</button>
      <a href="/editJsonBook/${b.id}" class="btn btn-info">Edit</a>
      <a href="/shop/addsqlbook/${b.id}" class="btn btn-primary">Sell</a>
      </div>
      `;
      jsonBooksCol.insertAdjacentHTML('beforeend', str); 
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
    console.log("sql books", books)
    books.map(b=>{
      let str = `
      <div class="shop-book-item">
      <h5>${b.bookTitle}<small> by ${b.authorName}
      </small></h5>
      <p>${b.bookDescription}</p>
      <p>Price:${b.bookPrice}</p>
      <a href="/shop/removeqlbook/${b.bookID}" class="btn btn-danger">Remove from shop</a>
      <button class="btn btn-danger removeFrom" data-bookID="${b.bookID}"  data-bookJsonID="${b.bookJsonId}" id="removeFromShop-${b.bookID}">Remove from shop(clientside)</button>
      </div>
      `;
      shopBooks.insertAdjacentHTML('beforeend', str); 
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
    console.log("not the button",e.target.id.substring(0,9))
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
    let theURL = `/editJsonBook/${e.target.dataset.bookjsonid}/${e.target.dataset.bookid}/forSale/false`;
    
    //req editJsonBook (index.js) which will set json 'forSale' field to false
    fetch(theURL)
    .then(()=> console.log("forSale field updated"))
    .catch(error => console.log("For Sale Field Error: ", error))
  })
}

