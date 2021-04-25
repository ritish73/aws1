setTimeout(function(){
  alert.removeClass("show");
  alert.addClass("hide");
},5000);

$('.close-btn').click(function(){
  alert.removeClass("show");
  alert.addClass("hide");
});
// // make sure that email does not change

// const emailinput = document.querySelector('.check-change-mail');
// const updateInfo = document.querySelector('.update-info');
// const initialval = emailinput.value;
// const errorMessage = document.querySelector('#error-message');

// updateInfo.addEventListener('mouseover', ()=>{
//     alert('byvhgbhib')
//     if(emailinput.value != initialval){
//         console.log('disabled')
//         updateInfo.setAttribute('disabled', true);
//         errormessage.innerText = 'Please write correct email-id first';
//     } else{
//         updateInfo.removeAttribute('disabled');
//         errormessage.innerText = '';
//     }
// })

// emailinput.addEventListener('change' , ()=>{
//     cosnsole.log(emailinput.value);
// })

// document.body.style.cursor="wait";



$(document).ready(function(){
    $('.click').click(function(){
      $('.popup_box').css("display", "block");
    });
    $('.btn1').click(function(){
      $('.popup_box').css("display", "none");
    });
    $('.btn2').click(function(){
      $('.popup_box').css("display", "none");
      alert("Account Permanently Deleted.");
    });
  });




var httpRequest;
function deleteAccount(e){
    
    httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Giving up :( Cannot create an XMLHTTP instance');
        return false;
    }
    httpRequest.onreadystatechange = deleteAccountRequest;
    httpRequest.open('GET', '/delete');        
    httpRequest.send();   
    
}

function deleteAccountRequest(){
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            // let respJson = JSON.parse(httpRequest.responseText);
            window.location = '/logout';
        } else {
            alert('There was a problem with the request.');
        }
    }
}


