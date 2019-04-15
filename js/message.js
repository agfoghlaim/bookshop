// console.log("msg")
// const contactSellerBtn = document.getElementById('contactSellerBtn');
// contactSellerBtn.addEventListener('click', function(e){contactSeller(e)})

// function contactSeller(e){
//   e.preventDefault();
//   const bookID = e.target.dataset.bookid;

//   //send bookID to the query route
//   console.log("asking for " , `shop/query/${bookID}`)
//     fetch(`shop/query/${bookID}`)
//     .then(response => response.json())
//     .then(data => {
//       contactSeller
//     })
// }

// function dealWithResponse(data){
//   const formDets = document.getElementById('form-details');
//   formDets.textContent = `Re: ${data.bookTitle} by ${data.authorName}, price: ${data.bookPrice}`
// }