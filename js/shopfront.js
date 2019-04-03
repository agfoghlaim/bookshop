console.log("hello from shop.js")

const getAllBtn = document.getElementById('getallbooks');
getAllBtn.addEventListener('click', getBooks);
const shopBooks = document.getElementById('shop-books');
function getBooks(){
  fetch('/shop/sqlallusersbooks')
  //.then(res =>response => response.json())
  .then(data=> data.json())
  .then(books => {
    console.log(books);
    populateBooks(books);
  }).catch(err => console.log("error", err))
}


function populateBooks(books){
 
  books.map(b=>{
    let str = `
    <div class="shop-book-item">
    <h5>${b.bookTitle}<small> by ${b.authorName}
    </small></h5>
    <p>${b.bookDescription}</p>
    <p>Price:${b.bookPrice}</p>
    <a href="" class="btn btn-danger">Remove from shop</a>
    </div>
    `;
    shopBooks.insertAdjacentHTML('beforeend', str); 
  })


}

// fetch(url + isbn)
//     .then(response => response.json())
//     .then(data => {
//     console.log(data.items[0])
//     populateForm(data.items[0])

//   });