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

"บาสเกตบอลชาย":"qrbasketball.png.png",

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

// 📑 ฐานข้อมูลรหัสประจำตัวนักเรียนที่มีสิทธิ์เข้าเว็บ
const studentDatabase = ["40005", "41879", "12347", "55432", "99887"];

// 🧪 ล้างความจำเก่าทิ้งเพื่อทดสอบระบบใหม่ทุกครั้งที่รีเฟรชหน้าจอ (ถ้าทำเสร็จให้ใส่ // ไว้หน้า 2 บรรทัดนี้ครับ)
localStorage.removeItem('web_access_granted'); 
localStorage.removeItem('is_logged_in');

// ⏱️ รอหน้าเว็บโหลดเสร็จ (Loader ทำงาน)
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
            
            // เช็คว่าถ้ายังไม่ได้เลือกสิทธิ์ ให้แสดงกล่องล็อกอินขึ้นมา
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
                }
            }
        }, 500);
    }, 3000); 
});

// 🔐 ฟังก์ชันตรวจสอบรหัสประจำตัวนักเรียน (เวอร์ชั่นแก้บั๊กค้างบนมือถือ)
function verifyWebAccess(event) {
    if (event) event.preventDefault(); // บล็อกระบบรีเฟรชหน้าจอของมือถือด่วนที่สุด

    const inputEl = document.getElementById('studentIdInput');
    const gateBox = document.querySelector('.gate-box');
    const errTxt = document.getElementById('errTxt');
    
    if (!inputEl) return; // กันระเบิดกรณีหาอินพุตไม่เจอ
  const inputId = inputEl.value.replace(/\D/g, '');

    if (studentDatabase.includes(inputId)) {
        localStorage.setItem('web_access_granted', 'true'); 
        localStorage.setItem('is_logged_in', 'true');       
        localStorage.setItem('logged_student_id', inputId);
        
        if (errTxt) errTxt.style.display = 'none';
        warpIntoWeb(); // วาร์ปเข้าสู่หน้าหลัก
    } else {
        // ❌ ถ้ารหัสผิด สั่งสั่นกล่องแจ้งเตือน
        if (errTxt) errTxt.style.display = 'block';
        if (gateBox) {
            gateBox.style.animation = 'none';
            gateBox.offsetHeight; 
            gateBox.style.animation = 'gateShake 0.4s ease';
        }
        if (inputEl) {
            inputEl.style.borderColor = '#e8005a';
            inputEl.style.boxShadow = '0 0 15px rgba(232, 0, 90, 0.4)';
            setTimeout(() => {
                inputEl.style.borderColor = 'rgba(201, 146, 10, 0.25)';
                inputEl.style.boxShadow = 'inset 0 2px 4px rgba(42, 0, 24, 0.04)';
            }, 400);
        }
    }
}

// 👁️ ฟังก์ชันสำหรับสายส่อง "เข้าชมทั่วไป" (ดูได้อย่างเดียว ปุ่มฟอร์มโดนแช่แข็ง)
function loginAsGuest(event) {
    if (event) event.preventDefault();
    localStorage.setItem('web_access_granted', 'true'); 
    localStorage.setItem('is_logged_in', 'false'); 
    
    freezeAllActions(); // แช่แข็งปุ่มทั้งหมดในเว็บทันที
    warpIntoWeb();      // วาร์ปเข้าเว็บ
}

// 🔒 ฟังก์ชันสั่งแช่แข็ง: บล็อกไม่ให้สายส่องกดปุ่มใดๆ ข้างในเว็บหลักได้เลย
function freezeAllActions() {
    const allButtons = document.querySelectorAll('button:not(#gatekeeper button), input[type="submit"], input[type="button"]');
    const allInputs = document.querySelectorAll('input:not(#studentIdInput), textarea, select');

    allButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.4';
        btn.style.cursor = 'not-allowed';
        btn.style.pointerEvents = 'none'; 
    });

    allInputs.forEach(input => {
        input.disabled = true;
        input.style.background = '#f5f5f5';
        input.style.cursor = 'not-allowed';
    });
}

// 🎬 เอฟเฟกต์หมุนกล่อง 3D ม้วนเสื่อเปิดม่านเข้าเว็บ
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

// ⌨️ ตรวจจับการกดปุ่ม Enter บนแป้นพิมพ์โทรศัพท์และคอม
const inputField = document.getElementById('studentIdInput');
if (inputField) {
    inputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            verifyWebAccess(e);
        }
    });
}
