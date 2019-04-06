console.log("hello from shop.js")

const getAllBtn = document.getElementById('getallbooks');
getAllBtn.addEventListener('click', getBooks);
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

  //first make sure the target is the delete button
  if(e.target.id.substring(0,10) != 'removeFrom'){
    console.log("not the button",e.target.id.substring(0,9))
    return;
  }
  console.log("listening to this, will delete", e.target.dataset.bookid)
  fetch(`/shop/removeqlbook/${e.target.dataset.bookid}`) 
  .then(data=> data.json())
  .then(books => {
    console.log(books);

    //empty books div first because populateBooks prepends to end
    shopBooks.innerHTML = '';
    populateBooks(books);
  })
  .then(()=>{
    //need json id not sqlid!! 
    let theURL = `/editJsonBook/${e.target.dataset.bookjsonid}/forSale/false`;
    
    //req editJsonBook (index.js) which will set json 'forSale' field to false
    fetch(`/editJsonBook/${e.target.dataset.bookjsonid}/forSale/false`)
    .then(()=> console.log("forSale field updated"))
    .catch(error => console.log("For Sale Field Error: ", error))
  })
}

// fetch(url + isbn)
//     .then(response => response.json())
//     .then(data => {
//     console.log(data.items[0])
//     populateForm(data.items[0])

//   });