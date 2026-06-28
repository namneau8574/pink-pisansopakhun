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

"บาสเกตบอลชาย":"images/qr-basketball-boy.png.jpg",

"บาสเกตบอลหญิง":"images/qr-basketball-girl.png",

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

// 📑 ฐานข้อมูลรหัสประจำตัวนักเรียนที่มีสิทธิ์เข้าเว็บ
const studentDatabase = ["12345", "12346", "12347", "55432", "99887"];

// 🧪 ล้างความจำเก่าทิ้งเพื่อทดสอบระบบใหม่ทุกครั้งที่รีเฟรชหน้าจอ (ถ้าทำเสร็จให้ใส่ // ไว้หน้า 2 บรรทัดนี้ครับ)
localStorage.removeItem('web_access_granted'); 
localStorage.removeItem('is_logged_in');

// ⏱️ รอหน้าเว็บโหลด (Loader ทำงาน)
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const gateKeeper = document.getElementById('gatekeeper');
    
    setTimeout(() => {
        if (loader) {
            loader.style.transition = "opacity 0.5s ease, visibility 0.5s ease";
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
        }
        
        setTimeout(() => {
            if (loader) loader.style.display = 'none';
            
            if (localStorage.getItem('web_access_granted') !== 'true') {
                if (gateKeeper) {
                    gateKeeper.style.setProperty('display', 'flex', 'important');
                    gateKeeper.style.zIndex = "9999999";
                    gateKeeper.style.opacity = "1";
                    
                    const gateBox = gateKeeper.querySelector('.gate-box');
                    if (gateBox) {
                        gateBox.style.background = "#ffffff"; 
                        gateBox.style.color = "#2a0018";      
                    }

                    addGuestButton();
                }
            }
        }, 500);
    }, 3000); 
});

// 👁️ ฟังก์ชันเพิ่มปุ่ม "เข้าชมเว็บไซต์ทั่วไป" อัตโนมัติ
function addGuestButton() {
    const gateBox = document.querySelector('.gate-box');
    const existingBtn = gateBox.querySelector('button');
    
    if (!document.getElementById('guestBtn')) {
        const guestBtn = document.createElement('button');
        guestBtn.id = 'guestBtn';
        guestBtn.type = 'button'; // ป้องกันบั๊กบนมือถือ
        guestBtn.innerText = '✦ เข้าชมเว็บไซต์ทั่วไป ✦';
        
        // สไตล์แต่งปุ่มชมทั่วไป
        guestBtn.style.width = '100%';
        guestBtn.style.marginTop = '12px';
        guestBtn.style.padding = '16px';
        guestBtn.style.background = '#f2f2f2';
        guestBtn.style.color = '#555555';
        guestBtn.style.border = 'none';
        guestBtn.style.borderRadius = '50px';
        guestBtn.style.cursor = 'pointer';
        guestBtn.style.fontWeight = '700';
        guestBtn.style.fontFamily = "'Anuphan', sans-serif";
        guestBtn.style.transition = 'all 0.3s ease';
        
        guestBtn.onmouseover = () => { guestBtn.style.background = '#e5e5e5'; };
        guestBtn.onmouseout = () => { guestBtn.style.background = '#f2f2f2'; };
        
        // เมื่อคลิก -> เข้าเว็บแบบ Guest (ดูได้อย่างเดียว ทำอะไรไม่ได้เลย)
        guestBtn.onclick = function() {
            localStorage.setItem('web_access_granted', 'true'); 
            localStorage.setItem('is_logged_in', 'false'); // ล็อกสถานะว่าไม่ได้ล็อกอิน
            
            // 🔒 สั่งแช่แข็งปุ่มทั้งหมดบนเว็บทันที!
            freezeAllActions(); 
            warpIntoWeb();
        };
        
        existingBtn.parentNode.insertBefore(guestBtn, existingBtn.nextSibling);
    }
}

// 🔒 ฟังก์ชันแช่แข็ง: สั่งปิดการใช้งานปุ่มโหวต ปุ่มสมัคร ฟอร์มทุกอย่างในเว็บ (สำหรับสายส่อง)
function freezeAllActions() {
    // หาปุ่มทั้งหมดในเว็บหลัก (ยกเว้นปุ่มในหน้ากากล็อกอิน)
    const allButtons = document.querySelectorAll('button:not(#gatekeeper button), input[type="submit"], input[type="button"]');
    const allInputs = document.querySelectorAll('input:not(#studentIdInput), textarea, select');

    // 1. สั่งเปิดโหมดเดดล็อกให้กับทุกปุ่ม เปลี่ยนสีให้จางลง และกดไม่ได้
    allButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.style.pointerEvents = 'none'; // บล็อกไม่ให้เกิดคลิกอีเวนต์เด็ดขาด
    });

    // 2. สั่งปิดฟอร์มกรอกข้อมูลทั้งหมด พิมพ์อะไรลงไปไม่ได้เลย
    allInputs.forEach(input => {
        input.disabled = true;
        input.style.background = '#f5f5f5';
        input.style.cursor = 'not-allowed';
    });
}

// 🔐 ฟังก์ชันตรวจสอบรหัสประจำตัวนักเรียน (แก้ไขรองรับมือถือ 100%)
function verifyWebAccess(event) {
    if (event) event.preventDefault(); 

    const inputEl = document.getElementById('studentIdInput');
    const gateBox = document.querySelector('.gate-box');
    const errTxt = document.getElementById('errTxt');
    const inputId = inputEl.value.trim();

    if (studentDatabase.includes(inputId)) {
        localStorage.setItem('web_access_granted', 'true'); 
        localStorage.setItem('is_logged_in', 'true');       
        localStorage.setItem('logged_student_id', inputId);
        
        if (errTxt) errTxt.style.display = 'none';
        warpIntoWeb(); 
    } else {
        if (errTxt) errTxt.style.display = 'block';
        if (gateBox) {
            gateBox.style.animation = 'none';
            gateBox.offsetHeight; 
            gateBox.style.animation = 'gateShake 0.4s ease';
        }
    }
}

// 🎬 เอฟเฟกต์วาร์ปเข้าเว็บ
function warpIntoWeb() {
    const gateBox = document.querySelector('.gate-box');
    const gateKeeper = document.getElementById('gatekeeper');
    
    if (gateBox) {
        gateBox.style.transition = "all 0.6s cubic-bezier(0.6, -0.28, 0.735, 0.045)";
        gateBox.style.transform = "perspective(1000px) rotateX(90deg) scale(0.7) translateY(-50px)";
        gateBox.style.opacity = "0";
    }
    setTimeout(() => {
        if (gateKeeper) {
            gateKeeper.style.transition = "all 0.5s ease";
            gateKeeper.style.opacity = "0";
            gateKeeper.style.backdropFilter = "blur(0px)";
        }
    }, 400);
    setTimeout(() => {
        if (gateKeeper) gateKeeper.style.display = 'none';
    }, 900);
}

// ⌨️ ตรวจจับการกดปุ่ม Enter บนมือถือและคอม
const inputField = document.getElementById('studentIdInput');
if (inputField) {
    inputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            verifyWebAccess(e);
        }
    });
}
