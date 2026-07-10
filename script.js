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
window.voteTeam = async function(team) {
  try {
    const NOW = Date.now(); // เวลาปัจจุบัน (มิลลิวินาที)
    const COOLDOWN_TIME = 10 * 60 * 1000; // 10 นาที แปลงเป็นมิลลิวินาที (600,000 ms)

    // 🔒 ดึงข้อมูลเวลาที่เคยโหวตล่าสุด
    const lastVoteTime = localStorage.getItem('lastVoteTime');
    const votedTeam = localStorage.getItem('votedTeam') || 'ทีมก่อนหน้านี้';

    if (lastVoteTime) {
      const timeElapsed = NOW - parseInt(lastVoteTime, 10);

      // ถ้าเวลาที่ผ่านไป ยังไม่ถึง 10 นาที
      if (timeElapsed < COOLDOWN_TIME) {
        const timeRemainingMs = COOLDOWN_TIME - timeElapsed;
        const minutesLeft = Math.floor(timeRemainingMs / (60 * 1000));
        const secondsLeft = Math.floor((timeRemainingMs % (60 * 1000)) / 1000);

        alert(`⛔ คุณเพิ่งโหวตให้ "${votedTeam}" ไปไม่นานนี้\nกรุณารออีก ${minutesLeft} นาที ${secondsLeft} วินาที จึงจะโหวตใหม่ได้ครับ`);
        return;
      }
    }

    // 📝 บันทึกข้อมูลการโหวตรอบใหม่และอัปเดต Timestamp ปัจจุบัน
    localStorage.setItem('votedTeam', team);
    localStorage.setItem('lastVoteTime', NOW);

    // เอฟเฟกต์ระหว่างโหวต
    playSound();
    voteAnimation(team);

    // 📡 เชื่อมต่อ Firebase และอัปเดตคะแนน
    const voteRef = ref(db, 'votes/' + team);
    const snapshot = await get(voteRef);
    let current = snapshot.exists() ? snapshot.val() : 0;
    await set(voteRef, current + 1);

    alert(`🔥 โหวต "${team}" สำเร็จ!\n${team} = ${current + 1} คะแนน`);

    fireEffect();

  } catch (error) {
    console.error(error);
    alert("❌ โหวตไม่สำเร็จ");
  }
};


/* =========================
   COMMENT SYSTEM
========================= */

commentForm.addEventListener('submit',(e)=>{
  e.preventDefault();

  const name = document.getElementById('commentName').value.trim() || 'ANONYMOUS';
  const text = document.getElementById('commentText').value.trim();

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

  fireEffect(); // 🔥 เพิ่มบรรทัดนี้
});
/* =========================
   FIRE EFFECT
========================= */
function fireEffect() {
  const count = 18;

  for(let i = 0; i < count; i++){
    const fire = document.createElement('div');

    fire.innerText = ['🔥','🔥','🔥','✨','💫'][Math.floor(Math.random()*5)];

    fire.style.cssText = `
      position: fixed;
      font-size: ${14 + Math.random()*22}px;
      left: ${20 + Math.random()*60}%;
      bottom: 10%;
      z-index: 99999;
      pointer-events: none;
      animation: fireRise ${0.8 + Math.random()*0.8}s ease forwards;
      animation-delay: ${Math.random()*0.4}s;
    `;

    document.body.appendChild(fire);
    setTimeout(() => fire.remove(), 1600);
  }
}
/* =========================
   REGISTER SYSTEM
========================= */

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const room = document.getElementById('room').value.trim();
    const sport = document.getElementById('sport').value;
    const level = document.getElementById('level').value;
    const contact = document.getElementById('contact').value.trim();

    if (name === '' || room === '') {
        alert('กรอกข้อมูลให้ครบ');
        return;
    }

    // เด้ง QR ทันที
    registerForm.reset();
    showQR(sport);

    // ส่งข้อมูลไป Google Sheets แบบเบื้องหลัง
    fetch(
        "https://script.google.com/macros/s/AKfycbyc4XaEf7PkH_ZFaBjrsFgvp5nSaeO1mZAw799ylp_6TsCzAuavcK_q3WWV7fiKlXeS/exec",
        {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({
                name,
                room,
                level,
                contact,
                sport
            })
        }
    ).catch(err => {
        console.error(err);
    });

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

"บาสเกตบอลหญิง":"qrbasketball.png.png",

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
// QR CLOSE
window.closeQR = function() {
  document.getElementById('qrPopup').style.display = 'none';
  document.getElementById('registerForm').reset();
};

// กดพื้นหลังเพื่อปิด
document.getElementById('qrPopup').addEventListener('click', function(e) {
  if (e.target.id === 'qrPopup') window.closeQR();
});

// กด Escape เพื่อปิด
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.closeQR();
});
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

/* =========================
   เช็คชื่อเข้าร่วมกิจกรรม (ม.5)
========================= */
const GAS_URL = "https://script.google.com/macros/s/AKfycbyLQfyGwNAzPurlESWsi5VgbuQN6T21MrkIIRUMYlWLv64EHCZt5W416YGftPptR6Ry/exec";
 
const students = {
  "39079":"นางสาว ธัญเรศ นรินทร์","39506":"นาย เดโช ปานทอง",
  "39979":"นาย พิชญุ อุ่นละมัย","39991":"นาย กฤษฎา แก้ววิจิตร",
  "39997":"นางสาว มนตรีชา แก้วยู่","40103":"นาย ธฤต แจ้งใจ",
  "40105":"นางสาว สาธิตา ปัญญา","40119":"นาย ธนภัทร ใจบุญ",
  "40123":"นางสาว ฐิติพร ดวงตาทิพย์","40131":"นาย นาวิน ปิ่นตาเสน",
  "40138":"นางสาว งามเนตร ก้อนจำปา","40148":"นางสาว ปานชีวา จุลเฉิมศักดิ์",
  "40166":"นางสาว ชนิดนันท์ อนันต์กิจเจริญฯ","40186":"นาย ยงยุทธ สุขสวัสดิ์",
  "40190":"นาย ตัสกร ใจยะสาร","40227":"นาย ธนดล อันบ้านดง",
  "40229":"นางสาว สุธาสินี สุยะสัก","40243":"นางสาว ธนัญชนก ไชยวงศ์",
  "40344":"นางสาว บุญยาพร มูลธิ","40346":"นาย ธนกร ต๊ะกาบโพธิ์",
  "40367":"นางสาว พิชญาภา จำปาทอง","40369":"นาย ปริญญา ธรรมยอม",
  "40372":"นาย วชิรวิทย์ ณะปัญญา","40389":"นาย ชวัลลักษณ์ แดงเต๊ะ",
  "40392":"นางสาว ข้าวขวัญ ธำรงวิชาการ","40432":"นางสาว นันทชา เบ้าสีดา",
  "40437":"นางสาว พิมพันัส อุนะนำ","40443":"นาย ณัฐพงษ์ ต้นเจริญ",
  "40452":"นางสาว พิมพ์มาดา เอ้าปาน","40454":"นางสาว พิมพันัส จอมขันเงิน",
  "41907":"นาย บิดผึ้งกร สาวะจันทร์","42548":"นาย ญาณณัฐ เนตรนิลพฤกษ์",
  "42549":"นางสาว สุพิชญา คำปันนา","42550":"นาย พงศกร หาทวี",
  "42551":"นางสาว ปริยาภรณ์ แรกนา","42552":"นางสาว ขวัญจิรา คำนาศักดิ์",
  "42553":"นาย พงษ์ธร ท้าแสน","42554":"นาย ธณิษา วิเศษกาศ",
  "42555":"นาย อนาวิน ปาลีเลื่อม","42556":"นาย อธิวัฒน์ ไชยชนะ",
  "39858":"นาย ชยพล แสนคะนารึ","39881":"นางสาว พรปวีณ์ ทรัพย์สนธิ",
  "39893":"นาย ภูริวัชร อุดมทิพย์","39901":"นางสาว ศุภิกา ชูกลิ่น",
  "39936":"นาย สุกฤต สิงห์โตชะนา","39942":"นาย พีรพัฒน์ สมบูนไชย",
  "39943":"นางสาว พิชญ์สิริ โกมาร","39959":"นางสาว อธิฐญาณ์ บุตรชนิต",
  "39963":"นางสาว ญาดากานต์ ศรีลองเมือง","39994":"นาย ศุภโชค ใจจิตร",
  "39995":"นางสาว ณิชชา เทพพรมวงศ์","40005":"นางสาว สุพิชช์นันท์ กิติทรัพย์",
  "40040":"นางสาว กัลย์รัตน์ กันทาทรัพย์","40042":"นางสาว กนกนาถ สุปินนะวรรณา",
  "40045":"นาย ณัฐกาส ศรีสด","40051":"นาย ธนกฤต พื้นอินต๊ะศรี",
  "40244":"นาย นาคพิชัย กาวิเนตร","40246":"นางสาว พิชชาภา บุญเมอ",
  "40249":"นางสาว ขวัญวรินทร์ แก้วกันโท","40253":"นางสาว ภคมน วงศ์สถาน",
  "40267":"นาย ธราเทพ ไชยล้ำว","40277":"นาย วรยุทธ ทิพย์รักษ์",
  "40327":"นางสาว บุญยาพร เลิศวิไล","40352":"นาย บูรพล สุธีรางกูร",
  "40362":"นาย นันทิพัฒน์ ปันศรี","40444":"นางสาว นรมน จินาเดช",
  "40455":"นาย ปาณัท ไม้ประเสริฐ","41879":"นาย น้ำเหนือ ศรีนาคำ",
  "42513":"นางสาว กัญญารัตน์ จันทร์ต๊ะ","42514":"นางสาว มุริน วิชัยกิตติกุล",
  "42515":"นาย ธีรวัช หิรัญบริรักษ์","42516":"นางสาว ธญปดี วงศ์อนันต์ชัย",
  "42517":"นางสาว ปวีชญา ทรายใหม่","42518":"นางสาว ศิรภัสสร ต้นกลาง",
  "42519":"นางสาว ศศิวิมล สุวรรณชีพ","42520":"นาย จักริน หมื่นบาง",
  "42521":"นาย นพพล สุนันท์ต๊ะ","42522":"นางสาว รมิตา กาตัญญูคณานนท์",
  "42523":"นาย นพรัตน์ สุยะวารี","42525":"นางสาว เขมจิรา บุญมาอุป",
  "39854":"นางสาว ปวรวรรณ เมินชัยภูมิ","39917":"นางสาว เยาวเรศ อภิวงศ์",
  "39923":"นาย กรกฤษณ์ ยะใจ","39927":"นางสาว ชญาดา ลินฐูญ",
  "39929":"นางสาว กชพร สงวนศักดิ์","39938":"นางสาว กุลสตรี จักขุเรือง",
  "39948":"นาย กิตติพงศ์ แก้วปัน","39950":"นางสาว อริญชยา ตุ่นใจ",
  "39956":"นาย วิชานาถ โยศรี","39958":"นางสาว ธัญชนก คำพิภาค",
  "39965":"นางสาว ณัฐฐณิชา อินออม","39968":"นางสาว ภัควัลญชน์ กันทะวรรณ์",
  "39973":"นาย ปกรณ์ ศรีบุญกอง","39998":"นางสาว วิมลณัฐ วสุรัช",
  "40002":"นางสาว ไอยรัศฏ์ อินต๊ะปัน","40011":"นางสาว อภิชญา ผาด่านสกุล",
  "40014":"นางสาว กวินตรา วรรณโชค","40025":"นางสาว ธัญญลักษณ์ วงค์จันทร์",
  "40242":"นางสาว กรวรรณ กันธาทรัพย์","40282":"นาย ณัฐปกรณ์ ตุ่นไชย",
  "40414":"นางสาว สิริภาพร บัวงาม","40453":"นางสาว ชนกนันท์ พรมเสพสัก",
  "42487":"นาย จักรภพ พรมชัย","42488":"นาย ต้นธาร ปัญโญชาติดี",
  "42489":"นางสาว จุฬาลักษณ์ จิตจักร","42490":"นางสาว กรรณิการ์ ศรีเกื้อกลิ่น",
  "42491":"sans-serif","42492":"นางสาว ธิตินันท์ ไชยเขื่อน",
  "42493":"นาย พีรพล ทองแดง","42494":"นางสาว ณณิชา สุขสวัสดิ์"
};
 
const departments = [
  "ประธานคณะสี","ผู้ช่วยคณะสี","รองประธานคณะสี",
  "เลขานุการ","ฝ่ายสวัสดิการ","เหรัญญิก",
  "แสตนเชียร์","อัฒจันทร์","ขบวนพาเหรด",
  "กีฬา","กรีฑา","สปอตแดนซ์",
  "เชียร์หลีดเดอร์","ฝ่ายอุปกรณ์","ปฏิคม"
];
 
const deptGrid = document.getElementById('deptGrid');
if (deptGrid) {
  departments.forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'dept-btn';
    btn.textContent = d;
    btn.onclick = () => selectDept(d);
    deptGrid.appendChild(btn);
  });
}
 
let currentId   = null;
let currentName = null;
let currentDept = null;
 
window.searchStudent = async function () {
  const id = document.getElementById('studentId').value.trim();
  hideAllCheckin();
  currentDept = null;
  document.getElementById('roomSelect').value = "";
  resetDeptBtns();
  if (!id) return;
 
  const name = students[id];
  if (!name) {
    document.getElementById('errorBox').style.display = 'block';
    return;
  }
 
  currentId   = id;
  currentName = name;
  document.getElementById('nameId').textContent   = '🎓 เลขประจำตัว ' + id;
  document.getElementById('nameText').textContent = name;
  document.getElementById('nameBox').style.display     = 'block';
  document.getElementById('roomSection').style.display = 'block';
  document.getElementById('deptSection').style.display = 'block';
};
 
function selectDept(dept) {
  currentDept = dept;
  resetDeptBtns();
  [...document.querySelectorAll('.dept-btn')]
    .find(b => b.textContent === dept)
    ?.classList.add('selected');
  document.getElementById('confirmBtn').style.display = 'block';
}
 
function resetDeptBtns() {
  document.querySelectorAll('.dept-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('confirmBtn').style.display = 'none';
}
 
window.confirmCheckIn = async function () {
  const room = document.getElementById('roomSelect').value;
 
  if (!currentId || !currentDept) return;
  if (!room) {
    showCheckinToast('⚠️ กรุณาเลือกห้องเรียนก่อนครับ');
    return;
  }
 
  const now  = new Date();
  const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('th-TH');
 
  const btn = document.getElementById('confirmBtn');
  btn.disabled = true;
  btn.textContent = '⏳ กำลังบันทึก...';
 
  try {
    await set(ref(db, 'checkin/' + currentId), {
      name: currentName,
      room: room,
      dept: currentDept,
      time, date,
      timestamp: now.getTime()
    });
 
    const params = new URLSearchParams({
      sheet: 'เช็คชื่อ', id: currentId,
      name: currentName, room: room, dept: currentDept,
      time, date
    });
 
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: params
    });
 
    hideAllCheckin();
    document.getElementById('successName').textContent = currentName;
    document.getElementById('successRoomBadge').textContent = '🏫 ' + room;
    document.getElementById('successDeptBadge').textContent = '🏮 ' + currentDept;
    document.getElementById('successBox').style.display = 'block';
    document.getElementById('studentId').value = '';
    showCheckinToast('✅ เช็คชื่อสำเร็จ! ' + currentName);
    currentId = currentName = currentDept = null;
 
  } catch (err) {
    console.error(err);
    showCheckinToast('❌ เกิดข้อผิดพลาดกับ Google Sheets กรุณาตรวจสอบ URL การ deploy');
  } finally {
    btn.disabled = false;
    btn.textContent = '✅ ยืนยันเช็คชื่อ';
  }
};
 
function hideAllCheckin() {
  ['errorBox', 'nameBox', 'roomSection', 'deptSection', 'successBox'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const confirmBtn = document.getElementById('confirmBtn');
  if (confirmBtn) confirmBtn.style.display = 'none';
}
 
function showCheckinToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
