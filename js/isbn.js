console.log("hiya from isbn js")


const url = 'https://www.googleapis.com/books/v1/volumes?q=';
const isbnBtn = document.querySelector('#btn');
console.log(isbnBtn)
isbnBtn.addEventListener('click', getInfo);

function getInfo(){
  let isbn = document.getElementById('isbn-in').value;

  fetch(url + isbn)
    .then(response => response.json())
    .then(data => {
    console.log(data.items[0])
    populateForm(data.items[0])

  });

}

function populateForm(book){
  document.getElementById('title').value = book.volumeInfo.title;
  document.getElementById('author').value = book.volumeInfo.authors[0];
  document.getElementById('thumb').src = book.volumeInfo.imageLinks.smallThumbnail;
  document.getElementById('description').value = book.volumeInfo.description;
}


