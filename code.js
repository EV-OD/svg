// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBh605MHk2H9SbiJLl8VbFqRhcS0bx-P1Q",
    authDomain: "chatjs-7ef70.firebaseapp.com",
    projectId: "chatjs-7ef70",
    storageBucket: "chatjs-7ef70.appspot.com",
    messagingSenderId: "924636412665",
    appId: "1:924636412665:web:cd88536b538805b8374028",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
import { getDatabase, ref, push, get } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";

const database = getDatabase(app);

// Get a reference to the array/list you want to push data to
const meRef = ref(database, "me");

get(meRef).then((snapshot) => {
    if (snapshot.exists()) {
        const dataArray = Object.values(snapshot.val());
        dataArray.forEach(d => {
            if (d.me) {
                write_msg(d.msg, true)
            } else {
                write_msg(d.msg, false)
            }
        })

    } else {
        console.log("No data available");
    }
}).catch((error) => {
    console.error(error);
});


let msg_area = document.querySelector(".msg_area")

function write_msg(msg, me) {
    let code = `
    <div class="msg ${me ? "inline-block ml-auto" : ""}">
    <div class="user">
      <img src="/${me ? "me" : "user"}.svg" width="40" />
    </div>
    <div
      class="content bg-slate-200 rounded px-2 inline-block text-xl max-w-[300px]"
    >
      ${msg}
    </div>
  </div>
    `
    msg_area.innerHTML = msg_area.innerHTML + code
}

function send_msg(msg, me) {
    write_msg(msg, me)
    if (me) {
        push(meRef, { msg: msg, me })
    } else {
        push(meRef, { msg: msg, me: false })
    }
}

let isMe = sessionStorage.getItem("me")

function handleClick() {
    let msg_input = document.querySelector(".msg_input")
    let value = msg_input.value
    if ((value.startsWith("me:") || isMe == "true") && !value.startsWith("her:")) {
        send_msg(value.startsWith("me:") ? value.substr(3) : value, true)
    } else {
        send_msg(value.startsWith("her:") ? value.substr(4) : value, false)
    }
}

window.msg_writer = send_msg
window.handleClick = handleClick
