import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getDatabase,
ref,
push,
onValue,
get,
set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
/* FIREBASE */
const firebaseConfig = {
apiKey: "AIzaSyArJWaOHz8XJmqeEBGT8UR4yBgyZayykqQ",
authDomain: "pink-dynasty.firebaseapp.com",
databaseURL: "https://pink-dynasty-default-rtdb.firebaseio.com/",
projectId: "pink-dynasty",
storageBucket: "pink-dynasty.firebasestorage.app",
messagingSenderId: "623669448137",
appId: "1:623669448137:web:c007625a7913fcb7f46c18"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ======================
VOTE SYSTEM (FIXED)
====================== */

window.voteTeam = async function(team){

  try{

    console.log("VOTING:", team);

    const voteRef = ref(db, 'votes/' + team);

    const snapshot = await get(voteRef);

    let current = snapshot.exists()
      ? snapshot.val()
      : 0;

    await set(voteRef, current + 1);

    voteAnimation(team);

    alert(`🔥 ${team} = ${current + 1} คะแนน`);

  }catch(error){

    console.error(error);

    alert("❌ Firebase Error");

  }

};
/* ======================
COMMENT SYSTEM
====================== */

const commentForm = document.getElementById('commentForm');
const commentsContainer = document.getElementById('commentsContainer');

commentForm.addEventListener('submit',(e)=>{

e.preventDefault();

const name =
document.getElementById('commentName').value.trim() || 'ANONYMOUS';

const text =
document.getElementById('commentText').value.trim();

if(text === '') return;

push(ref(db,'comments'),{
name:name,
text:text
});

commentForm.reset();

});

/* LOAD COMMENTS */
onValue(ref(db,'comments'),(snapshot)=>{

commentsContainer.innerHTML='';

snapshot.forEach((child)=>{

const data = child.val();

const div = document.createElement('div');
div.className='comment';

div.innerHTML = `
<h3>🔥 ${data.name}</h3>
<p>${data.text}</p>
`;

commentsContainer.prepend(div);

});

});

/* ======================
REGISTER SYSTEM
====================== */

const registerForm = document.getElementById('registerForm');
const registerContainer = document.getElementById('registerContainer');

registerForm.addEventListener('submit',(e)=>{

e.preventDefault();

const name = document.getElementById('name').value.trim();
const room = document.getElementById('room').value.trim();
const sport = document.getElementById('sport').value;

if(name === '' || room === '') return;

push(ref(db,'players'),{

name: name,
room: room,
level: level,
contact: contact,
sport: sport,
time: Date.now()

});

registerForm.reset();

});

/* LOAD PLAYERS */
onValue(ref(db,'players'),(snapshot)=>{

registerContainer.innerHTML='';

snapshot.forEach((child)=>{

const data = child.val();

const div = document.createElement('div');
div.className='register-card';

div.innerHTML = `
<h3>👤 ${data.name}</h3>
<p>🏫 ห้อง : ${data.room}</p>
<p>🏆 กีฬา : ${data.sport}</p>
`;

registerContainer.prepend(div);

});

});
