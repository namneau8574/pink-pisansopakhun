/* =========================
   LOADER
========================= */

window.addEventListener('load',()=>{

setTimeout(()=>{

document.getElementById('loader')
.style.display='none';

},3000);

});

/* =========================
   PARTICLES
========================= */

const particles =
document.querySelector('.particles');

for(let i=0;i<100;i++){

const span =
document.createElement('span');

span.style.left =
Math.random()*100 + '%';

span.style.animationDuration =
(2 + Math.random()*5) + 's';

span.style.animationDelay =
Math.random()*5 + 's';

particles.appendChild(span);

}

/* =========================
   CURSOR
========================= */



/* =========================
   SCROLL
========================= */

window.scrollToSection = function(id){

document.getElementById(id)
.scrollIntoView({
behavior:'smooth'
});

}

/* =========================
   SOUND
========================= */

function playSound(){

const audio = new Audio(
'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
);

audio.volume = 0.2;

audio.play();

}

/* =========================
   FIREBASE
========================= */

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getDatabase,
ref,
push,
onValue,
get,
set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {

apiKey: "AIzaSyArJWaOHz8XJmqeEBGT8UR4yBgyZayykqQ",

authDomain: "pink-dynasty.firebaseapp.com",

databaseURL:
"https://pink-dynasty-default-rtdb.firebaseio.com",

projectId: "pink-dynasty",

storageBucket:
"pink-dynasty.firebasestorage.app",

messagingSenderId:
"623669448137",

appId:
"1:623669448137:web:c007625a7913fcb7f46c18"

};

const app =
initializeApp(firebaseConfig);

const db =
getDatabase(app);

/* =========================
   VOTE SYSTEM
========================= */
/* =========================
   VOTE SYSTEM
========================= */

window.voteTeam = async function(team){

  try{

    // 🔒 กันโหวตซ้ำ 2 นาที
    const lastVote = localStorage.getItem('lastVote');

    if(lastVote){

      const diff = Date.now() - parseInt(lastVote);

      if(diff < 120000){

        const remain =
        Math.ceil((120000 - diff)/1000);

        alert(`⛔ รอ ${remain} วินาที`);

        return;
      }

    }

    // บันทึกเวลาโหวตล่าสุด
    localStorage.setItem(
      'lastVote',
      Date.now()
    );

    playSound();

    voteAnimation(team);

    const voteRef =
    ref(db, 'votes/' + team);

    const snapshot =
    await get(voteRef);

    let current =
    snapshot.exists()
    ? snapshot.val()
    : 0;

    await set(voteRef, current + 1);

    alert(
      `🔥 ${team} = ${current + 1} คะแนน`
    );

  }catch(error){

    console.error(error);

    alert("❌ โหวตไม่สำเร็จ");

  }

};



/* =========================
   COMMENT SYSTEM
========================= */

const commentForm =
document.getElementById('commentForm');

commentForm.addEventListener('submit',(e)=>{

e.preventDefault();

const name =
document.getElementById('commentName')
.value.trim() || 'ANONYMOUS';

const text =
document.getElementById('commentText')
.value.trim();

if(text === ''){

alert('กรุณาพิมพ์ข้อความ');
return;

}

push(ref(db,'comments'),{

name: name,
text: text,
time: Date.now()

});

alert('💬 ส่งความคิดเห็นแล้ว');

commentForm.reset();

});

/* =========================
   REGISTER SYSTEM
========================= */

const registerForm =
document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e)=>{

e.preventDefault();

const name =
document.getElementById('name').value.trim();

const room =
document.getElementById('room').value.trim();

const sport =
document.getElementById('sport').value;

const level =
document.getElementById('level').value;

const contact =
document.getElementById('contact').value.trim();

if(name === '' || room === ''){

alert('กรอกข้อมูลให้ครบ');
return;

}

try{

await fetch(
"https://script.google.com/macros/s/AKfycbzZAejKi5eQzsDTOu627FCYqJpoaWDoMrp_KutnKlEekyvA4ynP-sXqBH382SArxlo/exec",
{
method:"POST",
mode:"no-cors",
body:JSON.stringify({
name,
room,
level,
contact,
sport
})
}
);

// ถือว่าส่งแล้ว
registerForm.reset();

// เด้ง QR
showQR(sport);

}catch(err){

console.error(err);

alert("❌ ส่งข้อมูลไม่สำเร็จ");

}

});
function showPopup(text){

const popup =
document.getElementById('popup');

popup.innerText = text;

popup.classList.add('show');

setTimeout(()=>{

popup.classList.remove('show');

},2000);

}
function voteAnimation(team){

const div = document.createElement('div');

div.className = 'vote-pop';

div.innerText = '🔥 +' + team;

document.body.appendChild(div);

setTimeout(()=>{
div.remove();
},600);

}
function canVote(team){

  const lastVote = localStorage.getItem('vote_' + team);

  if(!lastVote) return true;

  const diff = Date.now() - parseInt(lastVote);

  return diff > 10000; // 10 วิ
}
/* =========================
   LOAD VOTES
========================= */

onValue(ref(db,'votes'),(snapshot)=>{

  console.log("VOTES:", snapshot.val());

});
const cards = document.querySelectorAll('.card');

cards.forEach(card => {

const img = card.querySelector('.jersey-img');

card.addEventListener('mousemove',(e)=>{

const rect = card.getBoundingClientRect();

const x = e.clientX - rect.left;
const y = e.clientY - rect.top;

const centerX = rect.width / 2;
const centerY = rect.height / 2;

const rotateY = ((x - centerX) / centerX) * 15;
const rotateX = ((centerY - y) / centerY) * 15;

img.style.transform = `
rotateY(${rotateY}deg)
rotateX(${rotateX}deg)
scale(1.08)
`;

});

card.addEventListener('mouseleave',()=>{

img.style.transform = `
rotateY(0deg)
rotateX(0deg)
scale(1)
`;

});

});
window.addEventListener("load",()=>{

setTimeout(()=>{

document.getElementById("loader").style.opacity="0";

setTimeout(()=>{

document.getElementById("loader").style.display="none";

},500);

},3000);

});

const qrImages={

"ฟุตบอลชาย":"images/qr-football.png",

"บาสเกตบอลชาย":"qqrbasketball.png.png",

"บาสเกตบอลหญิง":"qr-basketball-boy.png.png",

"วอลเลย์บอลชาย":"images/qr-volleyball-boy.png",

"วอลเลย์บอลหญิง":"images/qr-volleyball-girl.png",

"แบดมินตันชาย":"images/qr-badminton-boy.png",

"แบดมินตันหญิง":"images/qr-badminton-girl.png",

"แฮนด์บอลหญิง":"images/qr-handball.png",

"กรีฑาชาย":"images/qr-athletics-boy.png",

"กรีฑาหญิง":"images/qr-athletics-girl.png",

"แชร์บอลชาย":"images/qr-chairball-boy.png",

"แชร์บอลหญิง":"images/qr-chairball-girl.png",

"ตะกร้อชาย":"images/qr-sepak-boy.png",

"ตะกร้อหญิง":"images/qr-sepak-girl.png",

"เปตองชาย":"images/qr-petanque-boy.png",

"เปตองหญิง":"images/qr-petanque-girl.png",

"เทเบิลเทนนิสชาย":"images/qr-tabletennis-boy.png",

"เทเบิลเทนนิสหญิง":"images/qr-tabletennis-girl.png"

};

function showQR(sport){

    const qr = qrImages[sport];

    if(!qr){
        alert("ไม่พบ QR ของ " + sport);
        return;
    }

    document.getElementById("qrTitle").innerText =
    "✅ สมัครสำเร็จ\n" + sport;

    document.getElementById("qrImage").src = qr;

    document.getElementById("qrPopup").style.display = "flex";

}

window.closeQR = function () {
    document.getElementById("qrPopup").style.display = "none";
}
