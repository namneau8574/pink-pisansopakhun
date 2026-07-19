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
  alert("⏳ ยังไม่เปิดโหวตครับ กรุณารอก่อนนะครับ 🙏");
  return;

  // ----- โค้ดเดิมด้านล่างนี้จะไม่ถูกรันจนกว่าจะเปิดโหวต -----
  try {
    const NOW = Date.now();
    const COOLDOWN_TIME = 10 * 60 * 1000;

    const lastVoteTime = localStorage.getItem('lastVoteTime');
    const votedTeam = localStorage.getItem('votedTeam') || 'ทีมก่อนหน้านี้';

    if (lastVoteTime) {
      const timeElapsed = NOW - parseInt(lastVoteTime, 10);

      if (timeElapsed < COOLDOWN_TIME) {
        const timeRemainingMs = COOLDOWN_TIME - timeElapsed;
        const minutesLeft = Math.floor(timeRemainingMs / (60 * 1000));
        const secondsLeft = Math.floor((timeRemainingMs % (60 * 1000)) / 1000);

        alert(`⛔ คุณเพิ่งโหวตให้ "${votedTeam}" ไปไม่นานนี้\nกรุณารออีก ${minutesLeft} นาที ${secondsLeft} วินาที จึงจะโหวตใหม่ได้ครับ`);
        return;
      }
    }

    localStorage.setItem('votedTeam', team);
    localStorage.setItem('lastVoteTime', NOW);

    playSound();
    voteAnimation(team);

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
        "https://script.google.com/macros/s/AKfycbxjdfQSUS6clXl7-uEkjwINlLQfAYxgsAPare0o-LcvKTA_Ok-DmaatFy5cJcvcMDU0/exec",
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

const roomsByLevel = {
    "ม.1": ["1/2", "1/7", "1/15"],
    "ม.2": ["2/1", "2/8", "2/13"],
    "ม.3": ["3/1", "3/4", "3/5"],
    "ม.4": ["4/1", "4/6", "4/13"],
    "ม.5": ["5/3", "5/7", "5/11"],
    "ม.6": ["6/7", "6/9", "6/14"]
};

const levelGrid = document.getElementById('levelGrid');
const roomGrid = document.getElementById('roomGrid');
const roomSection = document.getElementById('roomSection');
const levelInput = document.getElementById('level');
const roomInput = document.getElementById('room');

if (levelGrid) {
    levelGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.pick-btn');
        if (!btn) return;

        const selectedLevel = btn.dataset.level;

        levelGrid.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

              // เปลี่ยนจาก ม.1-ม.6 เป็น มัธยมต้น/ปลาย
levelInput.value =
    ["ม.1", "ม.2", "ม.3"].includes(selectedLevel)
        ? "📘 มัธยมต้น"
        : "📕 มัธยมปลาย";

roomInput.value = '';
       
        const rooms = roomsByLevel[selectedLevel] || [];
        roomGrid.innerHTML = '';
        rooms.forEach(room => {
            const roomBtn = document.createElement('button');
            roomBtn.type = 'button';
            roomBtn.className = 'pick-btn';
            roomBtn.dataset.room = room;
            roomBtn.textContent = room;
            roomGrid.appendChild(roomBtn);
        });

        roomSection.style.display = 'block';
    });
}

if (roomGrid) {
    roomGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.pick-btn');
        if (!btn) return;

        roomGrid.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        roomInput.value = btn.dataset.room;
    });
}

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

"ฟุตบอลชาย":"qrfootball.png.jpg",
"บาสเกตบอลชาย":"qrbasketballl.png",
"บาสเกตบอลหญิง":"qrbasketballl.png",
"วอลเลย์บอลชาย":"qrvolleyballl.jpg",
"วอลเลย์บอลหญิง":"qrvolleyballl.jpg",
"แบดมินตันชาย":"qrbadminton.jpg",
"แบดมินตันหญิง":"qrbadminton.jpg",
"แฮนด์บอลชาย":"qrhandball.png.jpg",
"แฮนด์บอลหญิง":"qrhandball.png.jpg",
"กรีฑาชาย":"qrathletics.png.jpg",
"กรีฑาหญิง":"qrathletics.png.jpg",
"แชร์บอลชาย":"qrchairball.png.jpg",
"แชร์บอลหญิง":"qrchairball.png.jpg",
"ตะกร้อชาย":"qrtakrawt.jpg",
"ตะกร้อหญิง":"qrtakrawt.jpg",
"เปตองชาย":"qrpetanque.png.jpg",
"เปตองหญิง":"qrpetanque.png.jpg",
"เทเบิลเทนนิสชาย":"qrtabletennis.jpg",
"เทเบิลเทนนิสหญิง":"qrtabletennis.jpg"
};
// แหล่งรวมลิงก์กลุ่ม Messenger ของแต่ละกีฬา (ใส่ลิงก์จริงแทน xxxxxxx)
const qrLinks = {
    "ฟุตบอลชาย": "https://m.me/j/AbagNH1jRtE5crHJ/?send_source=gc:share_to_line",
    "บาสเกตบอลชาย": "https://m.me/j/AbZukYRd197hRbmV/?send_source=gc:share_to_line",
    "บาสเกตบอลหญิง": "https://m.me/j/AbZukYRd197hRbmV/?send_source=gc:share_to_line",
    "วอลเลย์บอลชาย": "https://m.me/j/AbZD7ERdBeKulDty/?send_source=gc:share_to_line",
    "วอลเลย์บอลหญิง": "https://m.me/j/AbZD7ERdBeKulDty/?send_source=gc:share_to_line",
    "แบดมินตันชาย": "https://m.me/j/AbYhHKZz1oddYFxJ/?send_source=gc:share_to_line",
    "แบดมินตันหญิง": "https://m.me/j/AbYhHKZz1oddYFxJ/?send_source=gc:share_to_line",
    "แฮนด์บอลชาย": "https://m.me/j/AbbrOntvOA1UTSJw/?send_source=gc:share_to_line",
   "แฮนด์บอลหญิง": "https://m.me/j/AbbrOntvOA1UTSJw/?send_source=gc:share_to_line",
    "กรีฑาชาย": "https://m.me/j/Abbk4m6GDPI2-TYJ/?send_source=gc:share_to_line",
    "กรีฑาหญิง": "https://m.me/j/Abbk4m6GDPI2-TYJ/?send_source=gc:share_to_line",
    "แชร์บอลชาย": "https://m.me/j/AbbqWlkmdRYtTFLq/?send_source=gc:share_to_line",
    "แชร์บอลหญิง": "https://m.me/j/AbbqWlkmdRYtTFLq/?send_source=gc:share_to_line",
    "ตะกร้อชาย": "https://m.me/j/AbYB8OkqN5GY8oyE/?send_source=gc:share_to_line",
    "ตะกร้อหญิง": "https://m.me/j/AbYB8OkqN5GY8oyE/?send_source=gc:share_to_line",
    "เปตองชาย": "https://m.me/j/AbbSSxsrD-UzqfQJ/?send_source=gc:share_to_line",
    "เปตองหญิง": "https://m.me/j/AbbSSxsrD-UzqfQJ/?send_source=gc:share_to_line",
    "เทเบิลเทนนิสชาย": "https://m.me/j/AbbHQ_zj1a-hD90X/?send_source=gc:share_to_line",
    "เทเบิลเทนนิสหญิง": "https://m.me/j/AbbHQ_zj1a-hD90X/?send_source=gc:share_to_line"
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
    const link = qrLinks[sport];

    if(!qr){
        alert("ไม่พบ QR ของ " + sport);
        return;
    }

    document.getElementById("qrTitle").innerText =
        "✅ สมัครสำเร็จ\n" + sport;
    document.getElementById("qrImage").src = qr;

    const qrLink = document.getElementById("qrLink");
    if (qrLink) {
        if (link) {
            qrLink.href = link;
            qrLink.style.display = "inline-block";
        } else {
            qrLink.style.display = "none";
        }
    }

    document.getElementById("qrPopup").style.display = "flex";
}

// 📑 ฐานข้อมูลรหัสประจำตัวนักเรียนที่มีสิทธิ์เข้าเว็บ
const studentDatabase = ["39019", "39150", "39153", "39159", "39169", "39212", "39217", "39246", "39499", "39519", "39522", "39523", "39536", "39567", "39570", "39577", "39627", "39638", "39665", "39672", "39713", "39720", "39748", "39754", "39757", "39774", "39776", "41215", "41886", "41887", "41888", "41889", "41890", "41891", "41892", "41893", "41895", "41897", "41898", "41899",
    "39152", "39180", "39198", "39244", "39248", "39249", "39264", "39272", "39287", "39291", "39303", "39319", "39323", "39326", "39344", "39350", "39413", "39508", "39515", "39528", "39539", "39540", "39566", "39636", "39670", "39674", "39704", "39727", "39752", "39756", "39769", "41825", "41826", "41827", "41828", "41829", "41830", "41831", "41832", "41833",
    "39220", "39236", "39268", "39279", "39288", "39289", "39321", "39335", "39346", "39364", "39375", "39527", "39537", "39561", "39593", "39597", "39604", "39606", "39617", "39626", "39635", "39650", "39671", "39673", "39682", "39688", "39702", "39715", "39716", "39717", "39730", "39766", "39788", "39840", "41844", "41845", "41846", "41847", "41848", "41849",
    "39858", "39881", "39893", "39901", "39936", "39942", "39943", "39959", "39963", "39994", "39995", "40005", "40040", "40042", "40045", "40051", "40244", "40246", "40249", "40253", "40267", "40277", "40327", "40352", "40362", "40444", "40455", "41879", "42513", "42514", "42515", "42516", "42517", "42518", "42519", "42520", "42521", "42522", "42523", "42525",
    "39079", "39506", "39979", "39991", "39997", "40103", "40105", "40119", "40123", "40131", "40138", "40148", "40166", "40186", "40190", "40227", "40229", "40243", "40344", "40346", "40367", "40369", "40372", "40389", "40392", "40432", "40437", "40443", "40452", "40454", "41907", "42548", "42549", "42550", "42551", "42552", "42553", "42554", "42555", "42556",
    "39854", "39917", "39923", "39927", "39929", "39938", "39948", "39950", "39956", "39958", "39965", "39968", "39973", "39998", "40002", "40011", "40014", "40025", "40242", "40282", "40414", "40453", "42487", "42488", "42489", "42490", "42491", "42492", "42493", "42494",
    "40575", "40576", "40582", "40604", "40607", "40609", "40635", "40645", "40680", "40685", "40701", "40709", "40710", "40713", "40716", "40719", "40720", "40721", "40722", "40726", "40735", "40738", "40740", "40741", "40742", "40755", "41031", "41074", "43195", "43196", "43197", "43198", "43199", "43200", "43201", "43202",
    "40536", "40584", "40667", "40797", "40805", "40814", "40816", "40855", "40868", "40895", "40899", "40916", "40918", "40995", "41010", "41014", "41016", "41021", "41026", "41034", "41040", "41044", "41053", "41057", "41063", "41065", "41076", "41087", "41092", "41095", "43251", "43252", "43253", "43254", "43255", "43256", "43257", "43258", "43259", "43260",
    "40542", "40543", "40545", "40546", "40547", "40550", "40556", "40559", "40564", "40571", "40577", "40580", "40587", "40592", "40596", "40598", "40636", "40639", "40646", "40665", "40774", "40777", "40818", "40831", "40832", "40834", "40864", "40870", "40891", "40939", "41089", "43181", "43182", "43183", "43184", "43185",
    "40697", "41335", "41336", "41338", "41339", "41340", "41341", "41342", "41343", "41344", "41345", "41346", "41347", "41348", "41349", "41350", "41351", "41352", "41353", "41354", "41355", "41356", "41357", "41358", "41359", "41360", "41361", "41362", "41363", "41364", "41365", "41366", "41367", "41368", "41369", "41370",
    "41077", "41557", "41558", "41559", "41560", "41561", "41562", "41563", "41564", "41565", "41566", "41567", "41568", "41569", "41570", "41571", "41572", "41573", "41574", "41575", "41576", "41577", "41578", "41579", "41580", "41581", "41582", "41583", "41584", "41585", "41586", "41588", "41589", "41590", "41591", "41592", "41593", "41594", "41595", "41906",
    "41371", "41372", "41373", "41374", "41375", "41376", "41377", "41378", "41379", "41380", "41381", "41382", "41383", "41384", "41385", "41386", "41387", "41388", "41389", "41390", "41391", "41392", "41393", "41394", "41395", "41396", "41397", "41398", "41399", "41400",
    "42361", "42362", "42363", "42364", "42365", "42366", "42367", "42368", "42369", "42370", "42371", "42372", "42373", "42374", "42375", "42376", "42377", "42378", "42379", "42380", "42381", "42382", "42383", "42384", "42385", "42386", "42387", "42388", "42389", "42390", "42391", "42392", "42393", "42394", "42395", "42396", "42397", "42398", "42399", "42400",
    "42161", "42162", "42163", "42164", "42165", "42166", "42167", "42168", "42169", "42170", "42171", "42172", "42173", "42174", "42175", "42176", "42177", "42178", "42179", "42180", "42181", "42182", "42183", "42184", "42185", "42186", "42187", "42188", "42189", "42190", "42191", "42192", "42193", "42194", "42195", "42196", "42197", "42198", "42199", "42200",
    "41912", "41913", "41914", "41915", "41916", "41917", "41918", "41919", "41920", "41921", "41922", "41923", "41924", "41925", "41926", "41927", "41928", "41929", "41930", "41931", "41932", "41933", "41934", "41935", "41936", "41937", "41938", "41939", "41940", "41941", "41942", "41943", "41944", "41945", "41946", "41947",
    "43141", "43142", "43143", "43144", "43145", "43146", "43147", "43148", "43149", "43150", "43151", "43152", "43153", "43154", "43155", "43156", "43157", "43158", "43159", "43160", "43161", "43162", "43163", "43164", "43165", "43166", "43167", "43168", "43169", "43170", "43171", "43172", "43173", "43174", "43175", "43176", "43177", "43178", "43179", "43180",
    "42821", "42822", "42823", "42824", "42825", "42826", "42827", "42828", "42829", "42830", "42831", "42832", "42833", "42834", "42835", "42836", "42837", "42838", "42839", "42840", "42841", "42842", "42843", "42844", "42845", "42846", "42847", "42848", "42849", "42850", "42851", "42852", "42853", "42854", "42855", "42856", "42857", "42858", "42859", "42860",
    "42647", "42648", "42649", "42650", "42651", "42652", "42653", "42654", "42655", "42656", "42657", "42658", "42659", "42660", "42661", "42662", "42663", "42664", "42665", "42666", "42667", "42668", "42669", "42670", "42671", "42672", "42673", "42674", "42675", "42676", "42677", "42678", "42679", "42680", "42681", "42682"];

// 🧪 ล้างความจำเก่าทิ้งเพื่อทดสอบระบบใหม่ทุกครั้งที่รีเฟรชหน้าจอ (ถ้าทำเสร็จให้ใส่ // ไว้หน้า 2 บรรทัดนี้ครับ)
//localStorage.removeItem('web_access_granted'); 
//localStorage.removeItem('is_logged_in');

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

// ===========================
// 🔐 ตรวจสอบรหัสนักเรียน
// รองรับ PC / Android / iPhone / iPad
// ===========================

function verifyWebAccess(e) {

    if (e) e.preventDefault();

    const input = document.getElementById("studentIdInput");

    const errTxt = document.getElementById("errTxt");

    const gateBox = document.querySelector(".gate-box");

    if (!input) return;

    // ลบช่องว่างทั้งหมด
    const inputId = input.value.replace(/\s+/g, "").trim();

    if (inputId === "") {
        if (errTxt) {
            errTxt.innerHTML = "กรุณากรอกเลขประจำตัว";
            errTxt.style.display = "block";
        }
        return;
    }

    // เปรียบเทียบเป็น String ทั้งหมด
    const found = studentDatabase.some(id => String(id) === String(inputId));

    if (found) {

        localStorage.setItem("web_access_granted", "true");
        localStorage.setItem("is_logged_in", "true");
        localStorage.setItem("logged_student_id", inputId);

        if (errTxt) errTxt.style.display = "none";

        warpIntoWeb();

    } else {

        if (errTxt) {
            errTxt.innerHTML = "ไม่พบเลขประจำตัวนักเรียน";
            errTxt.style.display = "block";
        }

        if (gateBox) {
            gateBox.style.animation = "none";
            gateBox.offsetHeight;
            gateBox.style.animation = "gateShake .4s";
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

const inputField = document.getElementById("studentIdInput");

if (inputField) {
    inputField.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            verifyWebAccess();
        }
    });
}

/* =========================
   เช็คชื่อเข้าร่วมกิจกรรม (ม.5)
========================= */

const GAS_URL = "https://script.google.com/macros/s/AKfycbwkDotSscBIrmmEoWSWN7fHZmTXrC6LJKdbnmW4g2_5h0_TJ7quRz8Q5mXsyy61rQ4o/exec";
 
const students = {
  // --- ม.5/3 ---
  "39079": { name: "นางสาว ธัญเรศ นรินทร์", room: "ม.5/3" },
  "39506": { name: "นาย เดโช ปานทอง", room: "ม.5/3" },
  "39979": { name: "นาย พิชญุ อุ่นละมัย", room: "ม.5/3" },
  "39991": { name: "นาย กฤษฎา แก้ววิจิตร", room: "ม.5/3" },
  "39997": { name: "นางสาว มนตรีชา แก้วยู่", room: "ม.5/3" },
  "40103": { name: "นาย ธฤต แจ้งใจ", room: "ม.5/3" },
  "40105": { name: "นางสาว สาธิตา ปัญญา", room: "ม.5/3" },
  "40119": { name: "นาย ธนภัทร ใจบุญ", room: "ม.5/3" },
  "40123": { name: "นางสาว ฐิติพร ดวงตาทิพย์", room: "ม.5/3" },
  "40131": { name: "นาย นาวิน ปิ่นตาเสน", room: "ม.5/3" },
  "40138": { name: "นางสาว งามเนตร ก้อนจำปา", room: "ม.5/3" },
  "40148": { name: "นางสาว ปานชีวา จุลเฉิมศักดิ์", room: "ม.5/3" },
  "40166": { name: "นางสาว ชนิดนันท์ อนันต์กิจเจริญฯ", room: "ม.5/3" },
  "40186": { name: "นาย ยงยุทธ สุขสวัสดิ์", room: "ม.5/3" },
  "40190": { name: "นาย ตัสกร ใจยะสาร", room: "ม.5/3" },
  "40227": { name: "นาย ธนดล อันบ้านดง", room: "ม.5/3" },
  "40229": { name: "นางสาว สุธาสินี สุยะสัก", room: "ม.5/3" },
  "40243": { name: "นางสาว ธนัญชนก ไชยวงศ์", room: "ม.5/3" },
  "40344": { name: "นางสาว บุญยาพร มูลธิ", room: "ม.5/3" },
  "40346": { name: "นาย ธนกร ต๊ะกาบโพธิ์", room: "ม.5/3" },
  "40367": { name: "นางสาว พิชญาภา จำปาทอง", room: "ม.5/3" },
  "40369": { name: "นาย ปริญญา ธรรมยอม", room: "ม.5/3" },
  "40372": { name: "นาย วชิรวิทย์ ณะปัญญา", room: "ม.5/3" },
  "40389": { name: "นาย ชวัลลักษณ์ แดงเต๊ะ", room: "ม.5/3" },
  "40392": { name: "นางสาว ข้าวขวัญ ธำรงวิชาการ", room: "ม.5/3" },
  "40432": { name: "นางสาว นันทชา เบ้าสีดา", room: "ม.5/3" },
  "40437": { name: "นางสาว พิมพันัส อุนะนำ", room: "ม.5/3" },
  "40443": { name: "นาย ณัฐพงษ์ ต้นเจริญ", room: "ม.5/3" },
  "40452": { name: "นางสาว พิมพ์มาดา เอ้าปาน", room: "ม.5/3" },
  "40454": { name: "นางสาว พิมพันัส จอมขันเงิน", room: "ม.5/3" },
  "41907": { name: "นาย บิดผึ้งกร สาวะจันทร์", room: "ม.5/3" },
  "42548": { name: "นาย ญาณณัฐ เนตรนิลพฤกษ์", room: "ม.5/3" },
  "42549": { name: "นางสาว สุพิชญา คำปันนา", room: "ม.5/3" },
  "42550": { name: "นาย พงศกร หาทวี", room: "ม.5/3" },
  "42551": { name: "นางสาว ปริยาภรณ์ แรกนา", room: "ม.5/3" },
  "42552": { name: "นางสาว ขวัญจิรา คำนาศักดิ์", room: "ม.5/3" },
  "42553": { name: "นาย พงษ์ธร ท้าแสน", room: "ม.5/3" },
  "42554": { name: "นาย ธณิษา วิเศษกาศ", room: "ม.5/3" },
  "42555": { name: "นาย อนาวิน ปาลีเลื่อม", room: "ม.5/3" },
  "42556": { name: "นาย อธิวัฒน์ ไชยชนะ", room: "ม.5/3" },

  // --- ม.5/7 ---
  "39858": { name: "นาย ชยพล แสนคะนารึ", room: "ม.5/7" },
  "39881": { name: "นางสาว พรปวีณ์ ทรัพย์สนธิ", room: "ม.5/7" },
  "39893": { name: "นาย ภูริวัชร อุดมทิพย์", room: "ม.5/7" },
  "39901": { name: "นางสาว ศุภิกา ชูกลิ่น", room: "ม.5/7" },
  "39936": { name: "นาย สุกฤต สิงห์โตชะนา", room: "ม.5/7" },
  "39942": { name: "นาย พีรพัฒน์ สมบูนไชย", room: "ม.5/7" },
  "39943": { name: "นางสาว พิชญ์สิริ โกมาร", room: "ม.5/7" },
  "39959": { name: "นางสาว อชิรญาณ์ บุตรนุชิต", room: "ม.5/7" },
  "39963": { name: "นางสาว ญาดากานต์ ศรีลองเมือง", room: "ม.5/7" },
  "39994": { name: "นาย ศุภโชค ใจจิตร", room: "ม.5/7" },
  "39995": { name: "นางสาว ณิชชา เทพพรมวงศ์", room: "ม.5/7" },
  "40005": { name: "นางสาว สุพิชช์นันท์ กิติทรัพย์", room: "ม.5/7" },
  "40040": { name: "นางสาว กัลย์รัตน์ กันทาทรัพย์", room: "ม.5/7" },
  "40042": { name: "นางสาว กนกนาถ สุปินนะวรรณา", room: "ม.5/7" },
  "40045": { name: "นาย ณัฐกาส ศรีสด", room: "ม.5/7" },
  "40051": { name: "นาย ธนกฤต พื้นอินต๊ะศรี", room: "ม.5/7" },
  "40244": { name: "นาย นาคพิชัย กาวิเนตร", room: "ม.5/7" },
  "40246": { name: "นางสาว พิชชาภา บุญเมอ", room: "ม.5/7" },
  "40249": { name: "นางสาว ขวัญวรินทร์ แก้วกันโท", room: "ม.5/7" },
  "40253": { name: "นางสาว ภคมน วงศ์สถาน", room: "ม.5/7" },
  "40267": { name: "นาย ธราเทพ ไชยล้ำว", room: "ม.5/7" },
  "40277": { name: "นาย วรยุทธ ทิพย์รักษ์", room: "ม.5/7" },
  "40327": { name: "นางสาว บุญยาพร เลิศวิไล", room: "ม.5/7" },
  "40352": { name: "นาย บูรพล สุธีรางกูร", room: "ม.5/7" },
  "40362": { name: "นาย นันทิพัฒน์ ปันศรี", room: "ม.5/7" },
  "40444": { name: "นางสาว นรมน จินาเดช", room: "ม.5/7" },
  "40455": { name: "นาย ปาณัท ไม้ประเสริฐ", room: "ม.5/7" },
  "41879": { name: "นาย น้ำเหนือ ศรีนาคำ", room: "ม.5/7" },
  "42513": { name: "นางสาว กัญญารัตน์ จันทร์ต๊ะ", room: "ม.5/7" },
  "42514": { name: "นางสาว มุริน วิชัยกิตติกุล", room: "ม.5/7" },
  "42515": { name: "นาย ธีรวัช หิรัญบริรักษ์", room: "ม.5/7" },
  "42516": { name: "นางสาว ธญปดี วงศ์อนันต์ชัย", room: "ม.5/7" },
  "42517": { name: "นางสาว ปวีชญา ทรายใหม่", room: "ม.5/7" },
  "42518": { name: "นางสาว ศิรภัสสร ต้นกลาง", room: "ม.5/7" },
  "42519": { name: "นางสาว ศศิวิมล สุวรรณชีพ", room: "ม.5/7" },
  "42520": { name: "นาย จักริน หมื่นบาง", room: "ม.5/7" },
  "42521": { name: "นาย นพพล สุนันท์ต๊ะ", room: "ม.5/7" },
  "42522": { name: "นางสาว รมิตา กาตัญญูคณานนท์", room: "ม.5/7" },
  "42523": { name: "นาย นพรัตน์ สุยะวารี", room: "ม.5/7" },
  "42525": { name: "นางสาว เขมจิรา บุญมาอุป", room: "ม.5/7" },

  // --- ม.5/11 ---
  "39854": { name: "นางสาว ปวรวรรณ เมินชัยภูมิ", room: "ม.5/11" },
  "39917": { name: "นางสาว เยาวเรศ อภิวงศ์", room: "ม.5/11" },
  "39923": { name: "นาย กรกฤษณ์ ยะใจ", room: "ม.5/11" },
  "39927": { name: "นางสาว ชญาดา ลินฐูญ", room: "ม.5/11" },
  "39929": { name: "นางสาว กชพร สงวนศักดิ์", room: "ม.5/11" },
  "39938": { name: "นางสาว กุลสตรี จักขุเรือง", room: "ม.5/11" },
  "39948": { name: "นาย กิตติพงศ์ แก้วปัน", room: "ม.5/11" },
  "39950": { name: "นางสาว อริญชยา ตุ่นใจ", room: "ม.5/11" },
  "39956": { name: "นาย วิชานาถ โยศรี", room: "ม.5/11" },
  "39958": { name: "นางสาว ธัญชนก คำพิภาค", room: "ม.5/11" },
  "39965": { name: "นางสาว ณัฐฐณิชา อินออม", room: "ม.5/11" },
  "39968": { name: "นางสาว ภัควัลญชน์ กันทะวรรณ์", room: "ม.5/11" },
  "39973": { name: "นาย ปกรณ์ ศรีบุญกอง", room: "ม.5/11" },
  "39998": { name: "นางสาว วิมลณัฐ วสุรัช", room: "ม.5/11" },
  "40002": { name: "นางสาว ไอยรัศฏ์ อินต๊ะปัน", room: "ม.5/11" },
  "40011": { name: "นางสาว อภิชญา ผาด่านสกุล", room: "ม.5/11" },
  "40014": { name: "นางสาว กวินตรา วรรณโชค", room: "ม.5/11" },
  "40025": { name: "นางสาว ธัญญลักษณ์ วงค์จันทร์", room: "ม.5/11" },
  "40242": { name: "นางสาว กรวรรณ กันธาทรัพย์", room: "ม.5/11" },
  "40282": { name: "นาย ณัฐปกรณ์ ตุ่นไชย", room: "ม.5/11" },
  "40414": { name: "นางสาว สิริภาพร บัวงาม", room: "ม.5/11" },
  "40453": { name: "นางสาว ชนกนันท์ พรมเสพสัก", room: "ม.5/11" },
  "42487": { name: "นาย จักรภพ พรมชัย", room: "ม.5/11" },
  "42488": { name: "นาย ต้นธาร ปัญโญชาติดี", room: "ม.5/11" },
  "42489": { name: "นางสาว จุฬาลักษณ์ จิตจักร", room: "ม.5/11" },
  "42490": { name: "นางสาว กรรณิการ์ ศรีเกื้อกลิ่น", room: "ม.5/11" },
  "42491": { name: "นางสาว ณัฐธิดา แสนคำ", room: "ม.5/11" }, 
  "42492": { name: "นางสาว ธิตินันท์ ไชยเขื่อน", room: "ม.5/11" },
  "42493": { name: "นาย พีรพล ทองแดง", room: "ม.5/11" },
  "42494": { name: "นางสาว ณณิชา สุขสวัสดิ์", room: "ม.5/11" }
};
 
const departments = [
  "ประธานคณะสี","ผู้ช่วยคณะสี","รองประธานคณะสี",
  "เลขานุการ","สวัสดิการและปฎิคม","เหรัญญิก",
  "แสตนเชียร์","อัฒจันทร์","ขบวนพาเหรด",
  "กีฬา","กรีฑา","สปอตแดนซ์",
  "เชียร์หลีดเดอร์","ฝ่ายอุปกรณ์"
];
 

// 📍 1. ตั้งค่าลิงก์พิกัดและระยะทางของคณะสี
const GOOGLE_MAPS_URL = "https://www.google.com/maps/dir/18.5791586,99.0239452/%E0%B9%82%E0%B8%A3%E0%B8%87%E0%B9%80%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%99%E0%B8%88%E0%B8%B1%E0%B8%81%E0%B8%A3%E0%B8%84%E0%B9%8D%E0%B8%B2%E0%B8%84%E0%B8%93%E0%B8%B2%E0%B8%97%E0%B8%A3/data=!4m6!4m5!1m0!1m2!1m1!1s0x30dbd2aadd7b605f:0x32d89249057f38eb!3e0?sa=X&ved=1t:196274&ictx=111"; 
const MAX_DISTANCE_METERS = 100000; // 🎯 ขยายรัศมีเป็น 100 กิโลให้ครอบคลุมทั่วโรงเรียน

// 📍 ตั้งค่าพิกัดเริ่มต้นเป็นของ โรงเรียนจักรคำคณาทร ลำพูน (Lat: 18.586, Lng: 99.039)
let SCHOOL_LAT = 18.586221; 
let SCHOOL_LNG = 99.039017;

let currentId   = null;
let currentName = null;
let currentDept = null;
let base64Image = ""; 
let isLocationValid = false; 
let userCurrentLat = null;
let userCurrentLng = null;

// แกะรอยพิกัดโรงเรียนจากลิงก์อัตโนมัติ
function extractCoordsFromUrl(url) {
  try {
    // 1. ตรวจสอบว่าถ้าเป็นลิงก์โรงเรียนจักรคำคณาทรตามที่ส่งมา ให้ล็อกพิกัดโรงเรียนโดยตรง
    if (url.includes("%E0%B9%82%E0%B8%A3%E0%B8%87%E0%B9%80%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%99%E0%B8%88%E0%B8%B1%E0%B8%81%E0%B8%A3%E0%B8%84%E0%B9%8D%E0%B8%B2")) {
      SCHOOL_LAT = 18.586221;
      SCHOOL_LNG = 99.039017;
      console.log(`📍 ล็อกตำแหน่ง: โรงเรียนจักรคำคณาทร (Lat ${SCHOOL_LAT}, Lng ${SCHOOL_LNG})`);
      return;
    }

    // 2. แบบปกติ (ถ้าเป็นลิงก์ยาวที่มีเครื่องหมาย @)
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      SCHOOL_LAT = parseFloat(match[1]);
      SCHOOL_LNG = parseFloat(match[2]);
      console.log(`📍 ดึงพิกัดจากลิงก์สำเร็จ: Lat ${SCHOOL_LAT}, Lng ${SCHOOL_LNG}`);
    }
  } catch (e) {
    console.error("❌ ไม่สามารถแกะพิกัดจากลิงก์ได้", e);
  }
}
extractCoordsFromUrl(GOOGLE_MAPS_URL);

// คำนวณระยะห่างระหว่างจุด 2 จุด
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; 
  const phi1 = lat1 * Math.PI/180;
  const phi2 = lat2 * Math.PI/180;
  const deltaPhi = (lat2-lat1) * Math.PI/180;
  const deltaLambda = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
}

// ตรวจสอบตำแหน่งพิกัดปัจจุบันของนักเรียน
function verifyLocation() {
  const statusEl = document.getElementById('locationStatus');
  if (!navigator.geolocation) {
    statusEl.innerHTML = "❌ เบราว์เซอร์ไม่รองรับการเช็คพิกัด GPS";
    return;
  }

  statusEl.innerHTML = "⏳ กำลังดึงพิกัดจากดาวเทียม...";
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userCurrentLat = position.coords.latitude;
      userCurrentLng = position.coords.longitude;
      
      const distance = calculateDistance(userCurrentLat, userCurrentLng, SCHOOL_LAT, SCHOOL_LNG);
      
      if (distance <= MAX_DISTANCE_METERS) {
        statusEl.innerHTML = `✅ พิกัดถูกต้อง! อยู่ในเขตกิจกรรม (ห่างจากจุดนัดหมาย ${Math.round(distance)} เมตร)`;
        statusEl.style.color = "green";
        isLocationValid = true;
        window.checkFormReady();
      } else {
        statusEl.innerHTML = `❌ คุณอยู่ห่างเกินไป (${Math.round(distance)} เมตร) ไม่อนุญาตให้เช็คชื่อนอกพื้นที่งานครับ`;
        statusEl.style.color = "red";
        isLocationValid = false;
        document.getElementById('confirmBtn').style.display = 'none';
      }
    },
    (error) => {
      statusEl.innerHTML = "❌ ไม่สามารถเข้าถึงพิกัดได้ กรุณาเปิด Location/GPS บนมือถือและยินยอมให้สิทธิ์";
      statusEl.style.color = "red";
      isLocationValid = false;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ดูตัวอย่างภาพที่ถ่าย
window.previewImage = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    base64Image = e.target.result; 
    document.getElementById('imagePreview').src = base64Image;
    document.getElementById('imagePreviewContainer').style.display = 'block';
    window.checkFormReady();
  };
  reader.readAsDataURL(file);
};

// ตรวจเงื่อนไขความพร้อมปุ่มยืนยัน
window.checkFormReady = function() {
  const room = document.getElementById('roomSelect').value;
  if (currentId && currentDept && room && isLocationValid && base64Image) {
    document.getElementById('confirmBtn').style.display = 'block';
  } else {
    document.getElementById('confirmBtn').style.display = 'none';
  }
};

// ฟังก์ชันค้นหารายชื่อ
window.searchStudent = async function () {
  const id = document.getElementById('studentId').value.trim();
  window.hideAllCheckin();
  currentDept = null;
  base64Image = "";
  isLocationValid = false;
  document.getElementById('roomSelect').value = "";
  document.getElementById('imageInput').value = "";
  document.getElementById('imagePreviewContainer').style.display = 'none';
  window.resetDeptBtns();
  if (!id) return;
 
  const studentData = students[id];
  if (!studentData) {
    document.getElementById('errorBox').style.display = 'block';
    return;
  }
 
  currentId   = id;
  currentName = studentData.name;
  
  document.getElementById('nameId').textContent   = '🎓 เลขประจำตัว ' + id;
  document.getElementById('nameText').textContent = currentName;
  document.getElementById('roomSelect').value = studentData.room;

  document.getElementById('nameBox').style.display     = 'block';
  document.getElementById('roomSection').style.display = 'block';
  document.getElementById('deptSection').style.display = 'block';
  document.getElementById('verificationSection').style.display = 'block';

  verifyLocation();
};

// ฟังก์ชันบันทึกข้อมูลและส่งค่าไปยังคอลัมน์ต่างๆ บนชีต
window.confirmCheckIn = async function () {
  const room = document.getElementById('roomSelect').value;
  if (!currentId || !currentDept || !room || !isLocationValid || !base64Image) {
    window.showCheckinToast('⚠️ ข้อมูลไม่ครบถ้วน หรือ พิกัดไม่อยู่ในเขตพื้นที่งาน');
    return;
  }
 
  const now  = new Date();
  const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('th-TH');
  
  // แปลงพิกัดจริงของเครื่องนักเรียนให้กลายเป็นลิงก์ Google Maps พร้อมระบุหมุดนำทาง
  const studentMapUrl = `https://www.google.com/maps?q=${userCurrentLat},${userCurrentLng}`;
 
  const btn = document.getElementById('confirmBtn');
  btn.disabled = true;
  btn.textContent = '⏳ กำลังบันทึกข้อมูลและรูปภาพ...';
 
  try {
    if (typeof set === 'function' && typeof ref === 'function' && typeof db !== 'undefined') {
        await set(ref(db, 'checkin/' + currentId), {
          name: currentName, room: room, dept: currentDept,
          time, date, photo: base64Image, studentLocation: studentMapUrl,
          timestamp: now.getTime()
        });
    }
 
    const params = new URLSearchParams({
      sheet: 'เช็คชื่อ', id: currentId,
      name: currentName, room: room, dept: currentDept,
      time: time, date: date, maps: studentMapUrl, photo: base64Image 
    });
 
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: params
    });
 
    window.hideAllCheckin();
    document.getElementById('successName').textContent = currentName;
    document.getElementById('successRoomBadge').textContent = '🏫 ' + room;
    document.getElementById('successDeptBadge').textContent = '🏮 ' + currentDept;
    document.getElementById('successBox').style.display = 'block';
    document.getElementById('studentId').value = '';
    
    window.showCheckinToast('✅ เช็คชื่อพร้อมหลักฐานสำเร็จ! ' + currentName);
    currentId = currentName = currentDept = base64Image = userCurrentLat = userCurrentLng = null;
 
  } catch (err) {
    console.error(err);
    window.showCheckinToast('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  } finally {
    btn.disabled = false;
    btn.textContent = '✅ ยืนยันเช็คชื่อ';
  }
};

window.hideAllCheckin = function() {
  document.getElementById('errorBox').style.display = 'none';
  document.getElementById('nameBox').style.display = 'none';
  document.getElementById('roomSection').style.display = 'none';
  document.getElementById('deptSection').style.display = 'none';
  document.getElementById('verificationSection').style.display = 'none';
  document.getElementById('confirmBtn').style.display = 'none';
  document.getElementById('successBox').style.display = 'none';
}

window.resetDeptBtns = function() {
  document.querySelectorAll('.dept-btn').forEach(b => b.classList.remove('selected'));
  window.checkFormReady();
}

window.selectDept = function(dept) {
  currentDept = dept;
  window.resetDeptBtns();
  [...document.querySelectorAll('.dept-btn')]
    .find(b => b.textContent === dept)
    ?.classList.add('selected');
  window.checkFormReady();
}

window.showCheckinToast = function(msg) {
  const toastEl = document.getElementById('toast');
  if (toastEl) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => { toastEl.classList.remove('show'); }, 3000);
  } else {
    alert(msg);
  }
}

// ผูกตัวแปรเลือกห้องเข้ากับตัวเช็คความพร้อม
document.addEventListener("DOMContentLoaded", () => {
  const roomSel = document.getElementById('roomSelect');
  if(roomSel) roomSel.onchange = window.checkFormReady;

  const deptGrid = document.getElementById('deptGrid');
  if (deptGrid) {
    deptGrid.innerHTML = ''; 
    departments.forEach(d => {
      const btn = document.createElement('button');
      btn.className = 'dept-btn';
      btn.textContent = d;
      btn.onclick = () => window.selectDept(d);
      deptGrid.appendChild(btn);
    });
  }
});

 
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

const checkStatusBtn = document.getElementById('checkStatusBtn');
if (checkStatusBtn) {
    checkStatusBtn.addEventListener('click', async () => {
        const nameInput = document.getElementById('checkName') || document.getElementById('name');
        const roomInput = document.getElementById('checkRoom') || document.getElementById('room');
        
        const resultBox = document.getElementById('checkResult');
        if (!nameInput || !roomInput) {
            resultBox.innerHTML = '<p style="color:red;">❌ ข้อผิดพลาดทางระบบ: หาช่องกรอกชื่อหรือห้องในหน้าเว็บไม่พบ</p>';
            return;
        }
        const name = nameInput.value.trim();
        const room = roomInput.value.trim();
        if (!name || !room) {
            resultBox.innerHTML = '<p style="color:red;">⚠️ กรุณากรอกชื่อและห้องให้ครบถ้วนก่อนกดปุ่ม</p>';
            return;
        }

        // 🔒 ปิดปุ่มกันกดซ้ำ + เปลี่ยนข้อความปุ่ม
        checkStatusBtn.disabled = true;
        const originalText = checkStatusBtn.innerText;
        checkStatusBtn.innerText = 'กำลังตรวจสอบ...';

        resultBox.innerHTML = '<p>⏳ กำลังตรวจสอบข้อมูล กรุณารอสักครู่...</p>';
        try {
            const baseUrl = "https://script.google.com/macros/s/AKfycbxjdfQSUS6clXl7-uEkjwINlLQfAYxgsAPare0o-LcvKTA_Ok-DmaatFy5cJcvcMDU0/exec"
            const url = `${baseUrl}?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.error) {
                resultBox.innerHTML = `<p style="color:red;">❌ ${data.error}</p>`;
                return;
            }
            if (!data.results || data.results.length === 0) {
                resultBox.innerHTML = '<p style="color:orange;">❌ ไม่พบข้อมูลการสมัคร ยังไม่เคยลงทะเบียนกีฬาใดเลย</p>';
                return;
            }
            let html = '<p style="color:green; font-weight:bold;">✅ พบข้อมูลการสมัครเรียบร้อย:</p><ul style="text-align:left; display:inline-block;">';
            data.results.forEach(r => {
                html += `<li style="margin-bottom: 5px;">🏆 <strong>${r.sport}</strong> (ระดับ: ${r.level || '-'})</li>`;
            });
            html += '</ul>';
            resultBox.innerHTML = html;
        } catch (err) {
            console.error(err);
            resultBox.innerHTML = '<p style="color:red;">❌ เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล ลองใหม่อีกครั้ง</p>';
        } finally {
            // 🔓 เปิดปุ่มกลับคืน ไม่ว่าจะสำเร็จหรือ error
            checkStatusBtn.disabled = false;
            checkStatusBtn.innerText = originalText;
        }
    });
}
// ทำความสะอาดข้อมูลห้อง: ลบเว้นวรรค, ลบคำนำหน้า ม./ม, แปลงเป็นพิมพ์เล็ก
function normalizeRoom(str) {
  return String(str)
    .replace(/\s+/g, '')           // ลบช่องว่างทั้งหมด
    .toLowerCase()
    .replace(/^ม\.?/, '')          // ลบ "ม." หรือ "ม" ที่นำหน้า (เช่น ม.4/7 -> 4/7, ม4/7 -> 4/7)
    .replace(/^m\.?/, '');         // เผื่อกรณีพิมพ์ภาษาอังกฤษ m.4/7 -> 4/7
}
