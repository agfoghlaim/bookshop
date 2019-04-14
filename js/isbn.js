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
  .catch(error => {
    console.log("error ", error);
    document.getElementById('thumb').src = `./default-img.png`;
    showNext('step-0', 'step-1')
  })
}

function showNext(hidestep, showstep){
  
  console.log("will show next step")
  const hideStep = document.querySelector(`#${hidestep}`)
  const showStep = document.querySelector(`#${showstep}`)
  console.log(showStep)
  if(!hideStep.classList.contains('hide')){
    hideStep.classList.add('hide')
  }
  if(hideStep.classList.contains('show')){
    hideStep.classList.remove('show')
  }
 
  showStep.classList.remove('hide')
  showStep.classList.add('show')
  doProgress(1)

  //try animation
 
  // hideStep.addEventListener('transitionend',function(){
  //   if(!hideStep.classList.contains('hide')){
  //     hideStep.classList.add('hide')
  //   }
  // })
  // hideStep.classList.add('fancy-hide');
 
}

//=============================

//Listen to all prev buttons (to go back)

//====================================
const prevBtns = document.querySelectorAll('.btn-prev');

//add listeners
prevBtns.forEach(b => b.addEventListener('click', function(e){goToPrev(e)}))

function goToPrev(e){
  e.preventDefault();

  
  //console.log("e.target", e.target);
  let backTo = e.target.dataset.backto;

  if(e.target.classList.contains('fas')){
    if(e.target.parentNode.dataset.backto){
      backTo = e.target.parentNode.dataset.backto
    }else{
      return;
    }
  }
  const prevStep = `step-${backTo}`;
  const currentStep = `step-${parseInt(backTo)+1}`
  //console.log(currentStep)
  //hide current step
  document.querySelector(`.${currentStep}`).classList.remove('show')
  document.querySelector(`.${currentStep}`).classList.add('hide')
  
  //show prev step
  document.querySelector(`.${prevStep}`).classList.remove('hide')
  document.querySelector(`.${prevStep}`).classList.add('show')
 // console.log(prevStep);
  doProgress(backTo)
}

//=============================

//Listen to all next buttons (except step 0 which is special)

//====================================
const nextBtns = document.querySelectorAll('.btn-next');

//add listeners
nextBtns.forEach(b => b.addEventListener('click', function(e){goToNext(e)}))

function goToNext(e){
  e.preventDefault();
  //do validation for the step in the form before coninuing to the next step
 



  //console.log("e.target", e.target);
  let forwardTo = e.target.dataset.forwardto;

  //there is a problem where the fontawesome arrow is big so interfering with the clickable area on the button. If target is a fontawesom icon ('.fas), check if it's parentNode is a next button....
  if(e.target.classList.contains('fas')){
    if(e.target.parentNode.dataset.forwardto){
      forwardTo = e.target.parentNode.dataset.forwardto
    }else{
      return;
    }
  }
  
  const nextStep = `step-${forwardTo}`;
  const currentStep = `step-${parseInt(forwardTo)-1}`
 
  //hide current step
  document.querySelector(`.${currentStep}`).classList.remove('show')
  document.querySelector(`.${currentStep}`).classList.add('hide')
  
  //show next step
  document.querySelector(`.${nextStep}`).classList.remove('hide')
  document.querySelector(`.${nextStep}`).classList.add('show')
  
  doProgress(forwardTo)
}

//====================================

//Progress bar 

//=====================================
function doProgress(step){
 
  const progress = document.getElementById('progress');
  const width = (step * 10)*2; 
  //console.log("doing progress", width)
  progress.setAttribute('style', `width:${width}%;`);
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
//======================================

// Add Book Form
//listen to radio button ownImgConfirm, if user wants to upload their own image:
//1. show the upload image form field group
//2. Hide the default Image if it exists

const ownImgConfirm = document.getElementById('ownImgConfirm');
const radios = document.querySelector('.img-radios');
if(radios){
  radios.addEventListener('change', function(e){
    const uploader = document.getElementById('img-uploader');
    const thumb = document.getElementById('thumb');

    if(!e.target.classList.contains('img-radio')){
      return;
    }
    if(e.target.value === 'ownImgConfirm'){
      //console.log("will show thing", e.target.value);
      
      uploader.classList.remove('hide')
      thumb.classList.add('hide')
      //hide default img
      //show upload file fields
    }else if(e.target.value = 'defaultImgConfirm'){
      //console.log("will hide upload", e.target.value)
      uploader.classList.add('hide')
      thumb.classList.remove('hide')
    }
  
  })
}

//=============================

//Edit Book Form
const newImgConfirm = document.getElementById('newImgConfirm');
const editRadios = document.querySelector('.edit-img-radios');
if(editRadios){
  editRadios.addEventListener('change', function(e){
    const uploader = document.getElementById('edit-img-uploader');
    const thumb = document.getElementById('edit-thumb');

    if(!e.target.classList.contains('edit-img-radio')){
      return;
    }
    if(e.target.value === 'newImgConfirm'){
      
      //show the uploader, hide the image
      uploader.classList.remove('hide-1')
      thumb.classList.add('hide-1')

      //Also if they select to upload an image, add required to the upload file input
      editBookForm.uploadImg.required = true;

      
    }else if(e.target.value = 'keepImgConfirm'){
      //console.log("will hide upload", e.target.value)
      uploader.classList.add('hide-1')
      thumb.classList.remove('hide-1')

      //set required upload to false
      editBookForm.uploadImg.required = false;
    }
  
  })
}


//have to intercept the form submission so the form can be validated, otherwise the html5 validation will stop the form submitting (if there is an error) but the user won't know why

//listen to the save button
const submitEditBtn = document.getElementById('submit-edit-btn');
submitEditBtn.addEventListener('click', function(e){validateForm(e)} );


function validateForm(e){
  //stop submitting if called by save btn
  if(e){
    e.preventDefault();
  }
  

  //is the form valid?
  let editIsValid = editBookForm.checkValidity();
 
  if(editIsValid){
    //submit form
    editBookForm.submit();
  }else{
        //show error info on step 5
    const editFormError = document.getElementById('edit-form-error');
    editFormError.classList.remove('hide');
    editFormError.classList.add('show');

    //hide error infor on step 5 (after 5 seconds)
    setTimeout(function(){
      editFormError.classList.remove('show');
      editFormError.classList.add('hide');
    },5000);

    


    //go through form and show relevant errors
    Array.from(editBookForm).forEach(i=>{
      if(i.validationMessage){
        console.log(i.name, " has error")
        document.getElementById(`${i.name}-error`).textContent = i.validationMessage;
      }else{
      // console.log(i.name, "no error")
      }
    })

  }


}





