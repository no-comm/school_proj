if (window.location.href.startsWith("http://127.0.0.1/create/")) {
    let data = window.location.href.replace("http://127.0.0.1/create/", "")
console.log("create "+data);
localStorage.clear()
localStorage.setItem("login", decodeURIComponent(data.split(":")[1]));
localStorage.setItem("role", "child");
localStorage.setItem("parent", data.split(":")[0]);
window.location.href = "http://127.0.0.1/control";
}


if (localStorage.getItem('login') === null || localStorage.getItem('role') === null) {
    localStorage.clear();
    window.location.href = "http://127.0.0.1/register";
}



if (localStorage.getItem('role') !== "parent" && localStorage.getItem('role') !== "child") {
    localStorage.clear();
    window.location.href = "http://127.0.0.1/register";
}

 

if (localStorage.getItem('role') == "child") {
    if (localStorage.getItem('parent') === null) {
        localStorage.clear();
        window.location.href = "http://127.0.0.1/register";
    }


    document.getElementById('sec-b6ff').style.display='none';
    document.getElementById('sec-b6ff2').style.display='none';
    document.getElementById('sec-b6ff3').style.display='block';
    let bodyForm = new FormData(); 
    bodyForm.append("child", localStorage.getItem("login"));
    bodyForm.append("parent", localStorage.getItem("parent"));
    fetch("http://127.0.0.1/get_my_tasks", {
method: "POST",
body: bodyForm,
})
.then((response) => response.json())
.then((json) => {
    if (json['status'] == "ok") {
        let res = json['tasks'];
        let childs = document.getElementById('my_child_tasks');
        if (res.length > 0)
        {
            childs.firstChild.remove();
            childs.firstChild.remove();
            for (let i = 0; i < res.length; i++) {
            let tr = document.createElement("tr");
            tr.style.height = "25px";
            let option = document.createElement("td");
            option.innerHTML = res[i];
            option.className = "u-border-1 u-border-grey-dark-1 u-table-cell";
            let btn = document.createElement("button");
            btn.innerHTML = "Выполнить";
            btn.style.float = "right";
            btn.style.backgroundColor = "#478ac9";
            btn.style.color = "white";
            btn.style.border = "none";
            btn.style.borderRadius = "5px";
            btn.className = 'btn-confirm-task'
            btn.addEventListener('click', function(){
                    let div = document.createElement("div");
                    div.style.width = "300px";
                    div.style.height = "300px";
                    div.style.position = "fixed";
                    div.style.zIndex = '100'
                    div.style.display = "flex";
                    div.style.top = "50%";
                    div.style.left = "50%";
                    div.style.transform = "translate(-50%, -50%)";
                    div.style.backgroundColor = "#d9d9d9";
                    div.style.justifyContent = "center";
                    div.style.alignItems = "center";
                    div.style.flexDirection = "column";
                    div.style.borderRadius = "10px";
                    let label = document.createElement("h4");
                    label.className = 'u-align-center u-text u-text-default u-text-1'
                    label.innerHTML = "Загрузите подтверждающую фотографию для задачи: "+res[i];
                    let input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/png, image/jpeg";
                    let div2 = document.createElement("div");
                    let btn2 = document.createElement("button");
                    btn2.innerHTML = "Отправить";
                    btn2.style.backgroundColor = "#478ac9";
                    btn2.style.color = "white";
                    btn2.style.border = "none";
                    btn2.style.borderRadius = "5px";
                    btn2.style.margin = "10px";
                    let btn_close = document.createElement("button");
                    btn_close.innerHTML = "Закрыть";
                    btn_close.style.backgroundColor = "#478ac9";
                    btn_close.style.color = "white";
                    btn_close.style.border = "none";
                    btn_close.style.borderRadius = "5px";
                    btn_close.style.margin = "10px";
                    btn_close.addEventListener('click', function(){
                        div.remove();
                    })
                    btn2.addEventListener('click', function(){
                        var reader = new FileReader();
                        reader.readAsDataURL(input.files[0]);
                        var otpravka;
                        reader.onload = function() {
                        let formData = new FormData();
                        formData.append('parent', localStorage.getItem("parent"));
                        formData.append('child', localStorage.getItem("login"));
                        formData.append('task', res[i]);
                        formData.append('file', reader.result);
                        fetch("http://127.0.0.1/confirm_task", {
                        method: "POST",
                        body: formData
                        })
                        .then((response) => response.json())
                        .then((json) => {
                            if (json['status'] == "ok") {
                                alert("Задача отправлена на проверку");
                                window.location.reload();
                            }
                        })
                    }
                    })
                    div.appendChild(label);
                    div.appendChild(input);
                    div2.appendChild(btn2);
                    div2.appendChild(btn_close);
                    div.appendChild(div2);
                    document.body.appendChild(div);
                
            })
            option.appendChild(btn);
            tr.appendChild(option);
            childs.appendChild(tr);
        }}
        
        return res;
    } else {
        throw new Error("Error");
    }
});



}

if (localStorage.getItem('role') == "parent") {
    fetch("http://127.0.0.1/get_child", {
method: "GET",
headers: {
    "Authorization": "Bearer " + localStorage.getItem("token")
}
})
.then((response) => response.json())
.then((json) => {
    if (json['status'] == "ok") {
        let res = json['childs'].split(",");
        console.log(res)
        let childs = document.getElementById('childs');
        if (res.length > 1)
        {
            childs.firstChild.remove();
            childs.firstChild.remove();
            for (let i = 0; i < res.length; i++) {
            if (res[i] == "") {
                continue;
            }
            
            console.log(res[i])
            let tr = document.createElement("tr");
            tr.style.height = "25px";
            let option = document.createElement("td");
            option.innerHTML = res[i];
            option.className = "u-border-1 u-border-grey-dark-1 u-table-cell";
            tr.appendChild(option);
            
            document.getElementById('childs').appendChild(tr);
                
               
                
                
        }}
        
        return res;
    } else {
        throw new Error("Error");
    }
});

fetch("http://127.0.0.1/get_tasks", {
method: "GET",
headers: {
    "Authorization": "Bearer " + localStorage.getItem("token")
}
})
.then((response) => response.json())
.then((json) => {
    if (json['status'] == "ok") {
        let res = json['tasks']
        
        
        Object.keys(res).forEach(element2 => {
            
            if (res[element2].length > 0){
                console.log(res[element2])
                document.getElementById('my_tasks').removeChild(document.getElementById('my_tasks').firstChild);
                document.getElementById('my_tasks').removeChild(document.getElementById('my_tasks').firstChild);
            }
            res[element2].forEach(element => {
                console.log(element)
                let tr = document.createElement("tr");
                tr.style.height = "25px";
                let option = document.createElement("td");
                option.innerHTML = element[2]+" для "+element[1];
                option.className = "u-border-1 u-border-grey-dark-1 u-table-cell";
                let btn = document.createElement("button");
                btn.innerHTML = "Удалить";
                btn.style.float = "right";
                btn.style.backgroundColor = "#478ac9";
                btn.style.color = "white";
                btn.style.border = "none";
                btn.style.borderRadius = "5px";
                btn.style.marginLeft = "2px";
                btn.className = 'btn-delete-task'
                option.appendChild(btn);
                if (element[3] == "confirmed") {
                let btn2 = document.createElement("button");
                btn2.style.float = "right";
                btn2.style.backgroundColor = "#478ac9";
                btn2.style.color = "white";
                btn2.style.border = "none";
                btn2.style.borderRadius = "5px";
                btn2.style.marginRight = "2px";
                btn2.innerHTML = "Подтверждение"
                btn2.className = 'btn-confirm-task'
                btn2.addEventListener('click', function(){
                    let div = document.createElement("div");
                    div.style.width = "300px";
                    div.style.height = "300px";
                    div.style.position = "fixed";
                    div.style.zIndex = '100'
                    div.style.display = "flex";
                    div.style.top = "50%";
                    div.style.left = "50%";
                    div.style.transform = "translate(-50%, -50%)";
                    div.style.backgroundColor = "#d9d9d9";
                    div.style.justifyContent = "center";
                    div.style.alignItems = "center";
                    div.style.flexDirection = "column";
                    div.style.borderRadius = "10px";
                    let label = document.createElement("h4");
                    label.className = 'u-align-center u-text u-text-default u-text-1'
                    label.innerHTML = "Подтвердите выполнение задачи";
                    let img = document.createElement("img");
                    img.src = element[4];
                    img.style.width = "200px";
                    img.style.height = "200px";
                    let div2 = document.createElement("div");
                    let btn3 = document.createElement("button");
                    btn3.innerHTML = "Отправить";
                    btn3.style.backgroundColor = "#478ac9";
                    btn3.style.color = "white";
                    btn3.style.border = "none";
                    btn3.style.borderRadius = "5px";
                    btn3.style.margin = "10px";
                    btn3.addEventListener('click', function(){
                        let formData = new FormData();
                        formData.append("parent", localStorage.getItem("login"));
                        formData.append("child", element[1]);
                        formData.append("task", element[2]);
                        fetch("http://127.0.0.1/delete_task", {
                            method: "POST",
                            body: formData,
                            headers: {
                                "Authorization": "Bearer " + localStorage.getItem("token")
                            }
                            })
                            .then((response) => response.json())
                            .then((json) => {
                                if (json['status'] == "ok") {
                                    alert("Задача подтверждена");
                                    window.location.reload();
                                }
                            })
                    })
                    let btn_close = document.createElement("button");
                    btn_close.innerHTML = "Закрыть";
                    btn_close.style.backgroundColor = "#478ac9";
                    btn_close.style.color = "white";
                    btn_close.style.border = "none";
                    btn_close.style.borderRadius = "5px";
                    btn_close.style.margin = "10px";
                    btn_close.addEventListener('click', function(){
                        div.remove();
                    })

                    div.appendChild(label);
                    div.appendChild(img);
                    div2.appendChild(btn3);
                    div2.appendChild(btn_close);
                    div.appendChild(div2);
                    document.body.appendChild(div);

                })
                option.appendChild(btn2);
                }
                tr.appendChild(option);
                
                document.getElementById('my_tasks').appendChild(tr);
            })
            Array.from(document.getElementsByClassName('btn-delete-task')).forEach(element => {
                element.addEventListener('click', function(){
                    let formData = new FormData();
                    formData.append("parent", localStorage.getItem("login"));
                    formData.append("child", element.parentElement.innerHTML.split(' для ')[1].split('<')[0]);
                    formData.append("task", element.parentElement.innerHTML.split(' для ')[0]);
                    fetch("http://127.0.0.1/delete_task", {
                        method: "POST",
                        body: formData,
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        }
                        })
                        .then((response) => response.json())
                        .then((json) => {
                            if (json['status'] == "ok") {
                                window.location.reload();
                            }
                        })
                })
            })
            
            
        })
        
    }
})



let add_task = document.getElementById('add_task');
add_task.addEventListener('click', function(){

    fetch("http://127.0.0.1/get_child", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
        })
        .then((response) => response.json())
        .then((json) => {
            if (json['status'] == "ok") {
                let res = json['childs'].split(",");
                len_ss = 0;
                if (res.length > 0)
                {for (let i = 0; i < res.length; i++) {
                    if (res[i] == "") {
                        continue;
                    }
                    let option = document.createElement("option");
                    option.innerHTML = res[i];
                    option.className = 'options_child'
                    document.getElementById('select_task').appendChild(option);
                    len_ss += 1;
                }}
                if (len_ss == 0) {
                    alert("Надо добавить хотя бы одного ребенка");
                }
                else{
                    document.getElementById('sec-b6ff4').style.display='block';
                    document.getElementById('sec-b6ff2').style.display='none';


                }
                
                return res;
            } else {
                throw new Error("Error");
            }
        });

})

document.getElementById('add_task_form').addEventListener('submit', (e) =>{
    e.preventDefault();
    let form = document.getElementById('add_task_form');
    let formData = new FormData(form);
    if (formData.get('task') == "") {
        alert("Задача не может быть пустой");
        return;
    }
    if (formData.get('child') == "Выберите ребенка") {
        alert("Выберите ребенка");
        return;
    }
    formData.append('parent', localStorage.getItem("login"));
    fetch("http://127.0.0.1/add_task", {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
        })
        .then((response) => response.json())
        .then((json) => {

        if (json['status'] == "ok") {
            alert("Задача добавлена");
            window.location.reload();
        }

        })

})

document.getElementById('close').addEventListener('click', function(){
    document.getElementById('sec-b6ff4').style.display='none';
    document.getElementById('sec-b6ff2').style.display='block';
    Array.from(document.getElementsByClassName('options_child')).forEach(element => {
        element.remove();
    })
})

let btn_add_child = document.getElementById('add_child');
btn_add_child.addEventListener('click', function(){
    let div = document.createElement("div");
    div.style.width = "300px";
    div.style.height = "300px";
    div.style.position = "fixed";
    div.style.zIndex = '100'
    div.style.display = "flex";
    div.style.flexWrap = "wrap";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.transform = "translate(-50%, -50%)";
    div.style.backgroundColor = "#d9d9d9";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.flexDirection = "column";
    div.style.borderRadius = "10px";
    div.style.overflow = "hidden";
    let label = document.createElement("h4");
    label.innerHTML = "Добавление ребенка";
    let input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Имя ребенка";

    let div2 = document.createElement("div");
    let btn3 = document.createElement("button");
    btn3.innerHTML = "Создать";
    btn3.style.backgroundColor = "#478ac9";
    btn3.style.color = "white";
    btn3.style.border = "none";
    btn3.style.borderRadius = "5px";
    btn3.style.margin = "10px";
    btn3.addEventListener('click', function(){
        let formData = new FormData();
        formData.append("parent", localStorage.getItem("login"));
        formData.append("child", input.value);
        fetch("http://127.0.0.1/create_child", {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
        })
        .then((response) => response.json())
        .then((json) => {

        if (json['status'] == "ok") {

            btn_close.click()
            label.innerHTML = "Поделитесь с ребенком ссылкой или отсканируйте QR-код";
            btn3.remove();
            div2.remove()
            input.remove();
            let label2 = document.createElement("input");
            label2.type = "text";
            label2.value = json['link'];
            let img = document.createElement("img");
            img.src = json['qr'];
            img.style.width = "100px";
            img.style.height = "100px";
            div.appendChild(label2);
            div.appendChild(img);
            div.appendChild(div2);
            document.body.appendChild(div);
        }

        })
    })
    let btn_close = document.createElement("button");
    btn_close.innerHTML = "Закрыть";
    btn_close.style.backgroundColor = "#478ac9";
    btn_close.style.color = "white";
    btn_close.style.border = "none";
    btn_close.style.borderRadius = "5px";
    btn_close.style.margin = "10px";
    btn_close.addEventListener('click', function(){
        div.remove();
    })
    div.appendChild(label);
    div.appendChild(input);


    div2.appendChild(btn3);
    div2.appendChild(btn_close);
    div.appendChild(div2);
    document.body.appendChild(div);
})

}