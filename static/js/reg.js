

let loginForm = document.getElementById("login-form");
let regForm = document.getElementById("register-form");



async function sendData(form, type) {
    
    const formData = new FormData(form);
    let url = ""
    if (type === "register") {
      url = "http://127.0.0.1/register";
    }
    else{
      url = "http://127.0.0.1/login";
    }
    
    try {
      const response = await fetch(url, {
        method: "POST",
        // Set the FormData instance as the request body
        body: formData,
      });
      let res = await response.json();
      console.log(res);
      if (res['status'] == "ok") {
        window.location.href = "http://127.0.0.1/control";
        localStorage.setItem('login', res['login']);
        localStorage.setItem('role', res['role']);
        localStorage.setItem('token', res['token']);
      }
      else if(res['status'] == "already exists"){
        alert("Аккаунт с таким email уже существует");
      }
      else{
        alert("Неверный логин или пароль");
      }
    } catch (e) {
      console.error(e);
    }
  }

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    //log form data
    sendData(loginForm, "login");
    console.log("login form submitted");
    
  });

  
  regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (document.getElementById("pass").value !== document.getElementById("re_pass").value){
        alert("Пароли не совпадают");
      }
      else{
      sendData(regForm, 'register');
      console.log("register form submitted");
      }
    });