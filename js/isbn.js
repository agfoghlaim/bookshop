const url = 'https://www.googleapis.com/books/v1/volumes?q=';
const isbnBtn = document.querySelector('#btn');
if(isbnBtn){
  isbnBtn.addEventListener('click', getInfo);
}


function getInfo(){
  let isbn = document.getElementById('isbn-in').value;
  console.log(url + isbn)
  fetch(url + isbn)
    .then(response => response.json())
    .then(data => {
    console.log(data.items[0])
    populateForm(data.items[0])

  })
  .then(()=> {showNext('step-0', 'step-1');})
  .catch(error => {console.log("error ", error);showNext('step-0', 'step-1')})
}

function showNext(hidestep, showstep){
  
  console.log("will show next step")
  const hideStep = document.querySelector(`#${hidestep}`)
  const showStep = document.querySelector(`#${showstep}`)
  //console.log(showStep)
  if(!hideStep.classList.contains('hide')){
    hideStep.classList.add('hide')
  }
  if(hideStep.classList.contains('show')){
    hideStep.classList.remove('show')
  }
 
  showStep.classList.remove('hide')
  showStep.classList.add('show')
 
}

//=============================

//Listen to all prev buttons (to go back)

//====================================
const prevBtns = document.querySelectorAll('.btn-prev');

//add listeners
prevBtns.forEach(b => b.addEventListener('click', function(e){goToPrev(e)}))

function goToPrev(e){
  e.preventDefault();
  const prevStep = `step-${e.target.dataset.backto}`;
  const currentStep = `step-${parseInt(e.target.dataset.backto)+1}`
  console.log(currentStep)
  //hide current step
  document.querySelector(`.${currentStep}`).classList.remove('show')
  document.querySelector(`.${currentStep}`).classList.add('hide')
  
  //show prev step
  document.querySelector(`.${prevStep}`).classList.remove('hide')
  document.querySelector(`.${prevStep}`).classList.add('show')
  console.log(prevStep);
}

//=============================

//Listen to all next buttons (except step 0 which is special)

//====================================
const nextBtns = document.querySelectorAll('.btn-next');

//add listeners
nextBtns.forEach(b => b.addEventListener('click', function(e){goToNext(e)}))

function goToNext(e){
  e.preventDefault();
  const nextStep = `step-${e.target.dataset.forwardto}`;
  const currentStep = `step-${parseInt(e.target.dataset.forwardto)-1}`
  console.log(currentStep)
  //hide current step
  document.querySelector(`.${currentStep}`).classList.remove('show')
  document.querySelector(`.${currentStep}`).classList.add('hide')
  console.log(nextStep);
  //show next step
  document.querySelector(`.${nextStep}`).classList.remove('hide')
  document.querySelector(`.${nextStep}`).classList.add('show')
 
}



//====================================

//Add info from google book api to form 

//=====================================
function populateForm(book){
  document.getElementById('title').value = book.volumeInfo.title;
  document.getElementById('author').value = book.volumeInfo.authors[0];
  document.getElementById('thumb').src = book.volumeInfo.imageLinks.smallThumbnail;
  document.getElementById('description').value = book.volumeInfo.description;
  document.getElementById('imageurl').value = book.volumeInfo.imageLinks.smallThumbnail;
}

//listen to radio button ownImgConfirm, if user wants to upload their own image:
//1. show the upload image form field group
//2. Hide the default Image if it exists
const ownImgConfirm = document.getElementById('ownImgConfirm');
const radios = document.querySelector('.img-radios');
radios.addEventListener('change', function(e){
  const uploader = document.getElementById('img-uploader');
  const thumb = document.getElementById('thumb');

  if(!e.target.classList.contains('img-radio')){
    return;
  }
  if(e.target.value === 'ownImgConfirm'){
    console.log("will show thing", e.target.value);
    
    uploader.classList.remove('hide')
    thumb.classList.add('hide')
    //hide default img
    //show upload file fields
  }else if(e.target.value = 'defaultImgConfirm'){
    console.log("will hide upload", e.target.value)
    uploader.classList.add('hide')
    thumb.classList.remove('hide')
  }
 
})


