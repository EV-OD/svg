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
import { getDatabase, ref, push, get, set, onValue } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signOut, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

window.auth_user = auth.currentUser ? auth.currentUser : null


function SignIn() {
    if (!auth.currentUser) {
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                // IdP data available using getAdditionalUserInfo(result)
                // ...
                window.auth_user = user
                changeUserDetail()
                window.location.reload()
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
    }
}

let userdetailElt = document.querySelector(".userdetail")

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.auth_user = user
        changeUserDetail()
    }
})

function SignOutAuth() {
    signOut(auth).then(() => {
        window.auth_user = null
        changeUserDetail()
        window.location.reload()

    }).catch((error) => {
        // An error happened.
    });
}

window.SignOutAuth = SignOutAuth

function changeUserDetail() {
    let SignInButton = `
    <button
    onClick="SignIn()"
    class="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
  >
    SignIn
  </button>
    `
    if (!window.auth_user && !auth.currentUser) {
        userdetailElt.innerHTML = SignInButton
    } else {
        let user = auth.currentUser
        console.log(user)
        userdetailElt.innerHTML = `
        <div class="flex items-center gap-2">
        <img src="${user.photoURL}" class="w-6 h-6 rounded-full"/>
        <h1>${user.displayName}</h1>
        <button onClick="SignOutAuth()">SignOut</button>
        </div>
        `
    }
}
changeUserDetail()


const database = getDatabase(app);

// Get a reference to the array/list you want to push data to
const meRef = ref(database, "me");
const typingRef = ref(database, "typing");

let msg_area = document.querySelector(".msg_area")

get(meRef).then((snapshot) => {
    if (snapshot.exists()) {
        const dataArray = Object.values(snapshot.val());
        msg_area.innerHTML = ""

        dataArray.forEach(d => {
            write_msg(d.msg, d.user)
        })
        scrollToLatestMessage()

    } else {
        console.log("No data available");
    }
}).catch((error) => {
    console.error(error);
});




onValue(meRef, (snapshot) => {
    if (snapshot.exists()) {
        const dataArray = Object.values(snapshot.val());
        msg_area.innerHTML = ""
        dataArray.forEach(d => {
            write_msg(d.msg, d.user, true)
        });
        scrollToLatestMessage()
    } else {
        console.log("No data available");
    }
}, (error) => {
    console.error(error);
});





function scrollToLatestMessage() {
    msg_area.scrollTop = msg_area.scrollHeight;
}



function write_msg(msg, user, whole) {
    let isThisMe = false
    if (window.auth_user) {
        isThisMe = window.auth_user.uid == user.uid
    }
    let code = `
    <div class="msg ${isThisMe ? "inline-block ml-auto" : ""}">
    <div class="user">
      <img src="${user.photoURL}" width="40" />
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

function send_msg(msg) {
    let user = window.auth_user
    push(meRef, { msg: msg, user: { photoURL: user.photoURL, uid: user.uid } })
    scrollToLatestMessage()
}

let isMe = sessionStorage.getItem("me")
let msg_input = document.querySelector(".msg_input")

function handleClick() {
    if (window.auth_user) {
        if (msg_input.value.length > 0) {
            send_msg(msg_input.value)
            msg_input.value = ""
        }
    } else {
        alert("Please Login First")
    }
}
let avatar = document.querySelector(".avatar")
let isTyping = false
let timeoutId = null


onValue(typingRef, (snapshot) => {
    const data = snapshot.val();
    let t = data.typing
    if (data.uid != window.auth_user.uid) {
        if (t) {
            avatar.classList.add("typing")
        } else {
            avatar.classList.remove("typing")
        }
    }
});

function onKeyPressed(e) {
    if (e.code == "Enter") {
        handleClick()
    }
    isTyping = true
    set(typingRef, {
        typing: true,
        uid: window.auth_user.uid
    })
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
        isTyping = false
        set(typingRef, {
            typing: false,
            uid: window.auth_user.uid
        })
    }, 2000)
}





window.msg_writer = send_msg
window.handleClick = handleClick
window.SignIn = SignIn
window.onKeyPressed = onKeyPressed
