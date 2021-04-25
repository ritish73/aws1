const password_field = document.querySelector('#password');
const alertmessage = document.querySelector('#invalid-input-message');
const fullmsg = document.querySelector('#fullmsg');
const signUpBtn = document.querySelector('#sign_up_submit');

invalidInput = (err) =>{
    alertmessage.innerText = err;
    // disable the submit button 
    signUpBtn.setAttribute('disabled', true);
}

showmessage = (msg)=>{
    fullmsg.innerText = msg;
}


password_field.addEventListener('mousedown', ()=>{
showmessage('Password must contain atleast one capital letter, small letter, special character, digit and it must be atleast 8 characters long')
})

password_field.addEventListener('input', ()=>{

    // password_field.type = 'text';
    if(password_field.value.length < 8){
        alertmessage.classList.remove('hide');
        invalidInput("Password must be more than 8 characters long");
        return;
    }  
    if(/\d/.test(password_field.value) == false){
        alertmessage.classList.remove('hide');
        invalidInput("Password must contain a digit");
        return;
    }
    if(/\s/.test(password_field.value) == true){
        alertmessage.classList.remove('hide');
        invalidInput("Password must not contain whitespaces");
        return;
    }
    if(/[-’/`~!#*$@_%+=.,^&(){}[\]|;:”<>?\\]/.test(password_field.value) == false){
        alertmessage.classList.remove('hide');
        invalidInput("Password must contain a special character");
        return;
    }
    if(/[A-Z]/.test(password_field.value) == false){
        alertmessage.classList.remove('hide');
        invalidInput("Password must contain Capital");
        return;
    }

    if(/[a-z]/.test(password_field.value) == false){
        alertmessage.classList.remove('hide');
        invalidInput("Password must contain small letter");
        return;
    }
    
    else {
        alertmessage.classList.add('hide');
        signUpBtn.removeAttribute('disabled');
    }
})