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
/* ============================================================
   FIREBASE INITIALIZATION & MODULE IMPORTS
============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyArJWaOHz8XJmqeEBGTGT8UR4yBgyZayykqQ",
  authDomain: "pink-dynasty.firebaseapp.com",
  databaseURL: "https://pink-dynasty-default-rtdb.firebaseio.com",
  projectId: "pink-dynasty",
  storageBucket: "pink-dynasty.firebasestorage.app",
  messagingSenderId: "623669448137",
  appId: "1:623669448137:web:c007625a7913fcb7f46c18"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ============================================================
   VOTE SYSTEM
   ล็อกโหวตซ้ำ 1 ปี (Client-side Restriction) + Safe Transaction
============================================================ */
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

window.voteTeam = async function (teamId) {
  const normalizedTeam = String(teamId).trim();

  try {
    // 1. ตรวจสอบประวัติการโหวตจาก LocalStorage
    const lastVote = localStorage.getItem("lastVote");

    if (lastVote) {
      const diff = Date.now() - Number(lastVote);

      if (diff < ONE_YEAR_MS) {
        const nextVoteDate = new Date(Number(lastVote) + ONE_YEAR_MS);
        const oldTeam = localStorage.getItem("voteTeam") || normalizedTeam;

        alert(
          `⛔ คุณได้โหวตให้ "แบบที่ ${oldTeam}" ไปแล้ว\n\n` +
          `สามารถโหวตใหม่ได้ในวันที่:\n` +
          `${nextVoteDate.toLocaleDateString("th-TH")}`
        );
        return;
      }
    }

    // 2. ส่งคะแนนแบบ Atomic Transaction เข้า Firebase Realtime Database
    const voteRef = ref(db, `votes/${normalizedTeam}`);
    const result = await runTransaction(voteRef, (current) => (Number(current) || 0) + 1);

    if (!result.committed) {
      throw new Error("Transaction not committed");
    }

    const newScore = result.snapshot.val();

    // 3. บันทึกประวัติลง LocalStorage
    localStorage.setItem("lastVote", String(Date.now()));
    localStorage.setItem("voteTeam", normalizedTeam);

    // 4. แสดงผลลัพธ์และเรียกใช้ Visual Effects (ถ้ามี)
    if (typeof window.playSound === "function") window.playSound();
    if (typeof window.voteAnimation === "function") window.voteAnimation(normalizedTeam);
    if (typeof window.fireEffect === "function") window.fireEffect();

    alert(`🔥 โหวต "แบบที่ ${normalizedTeam}" สำเร็จ!\n\nคะแนนปัจจุบัน: ${newScore} คะแนน`);

  } catch (error) {
    console.error("Vote Error:", error);
    alert("❌ เกิดข้อผิดพลาดในการบันทึกคะแนน กรุณาลองใหม่อีกครั้ง");
  }
};

/* ============================================================
   DONUT CHART & REALTIME UI RENDERER
============================================================ */
(function () {
  const VR_COLORS = [
    "#ff2a85", // ชมพูสดเข้ม (Theme Primary)
    "#02c5c5", // ฟ้าอมเขียว
    "#f0c14b", // เหลืองทอง
    "#e614b1", // ม่วงชมพู
    "#7b2cbf", // ม่วงเข้ม
    "#279b44"  // เขียว
  ];

  const VR_LABELS = [
    "แบบที่ 1",
    "แบบที่ 2",
    "แบบที่ 3",
    "แบบที่ 4",
    "แบบที่ 5",
    "แบบที่ 6"
  ];

  const MEDAL_BG = [
    "linear-gradient(135deg,#f0c14b,#c9920a)", // ทอง
    "linear-gradient(135deg,#d9d9d9,#a8a8a8)", // เงิน
    "linear-gradient(135deg,#e0a877,#b5713e)", // ทองแดง
    "#d8c9a8"                                 // ทั่วไป
  ];

  let displayedTotal = 0;
  let animFrameId = null;

  // Animate ตัวเลขคะแนนรวมแบบ Ease-Out
  function animateTotal(target) {
    const el = document.getElementById("totalVotes");
    if (!el) return;

    if (animFrameId) cancelAnimationFrame(animFrameId);

    const start = displayedTotal;
    const duration = 400;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(start + (target - start) * easeProgress);

      el.textContent = value.toLocaleString("th-TH");

      if (progress < 1) {
        animFrameId = requestAnimationFrame(step);
      } else {
        displayedTotal = target;
      }
    }

    animFrameId = requestAnimationFrame(step);
  }

  // Render Donut Chart, Ranking และ Legend
  function renderDonut(counts) {
    const donut = document.getElementById("donutChart");
    const glow = document.getElementById("donutGlow");
    const legend = document.getElementById("legend");
    const updatedEl = document.getElementById("updatedAt");
    const leaderBadge = document.getElementById("leaderBadge");
    const leaderText = document.getElementById("leaderText");

    if (!donut || !legend) return;

    const total = counts.reduce((sum, val) => sum + val, 0);
    animateTotal(total);

    // Dynamic Conic Gradient สำหรับ Donut Chart
    const gradientParts = [];
    let cursor = 0;

    counts.forEach((count, i) => {
      const pct = total === 0 ? 0 : (count / total) * 100;
      const deg = pct * 3.6;
      const end = cursor + deg;

      if (pct > 0) {
        gradientParts.push(`${VR_COLORS[i]} ${cursor}deg ${end}deg`);
      }
      cursor = end;
    });

    const bg = total === 0 ? "#e8e0cc" : `conic-gradient(${gradientParts.join(",")})`;
    donut.style.background = bg;
    if (glow) glow.style.background = bg;

    // คำนวณอันดับ และตรวจสอบกรณีคะแนนนำเท่ากัน (Tie Case)
    const ranked = counts
      .map((count, i) => ({
        index: i,
        count,
        pct: total === 0 ? 0 : (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count);

    if (leaderBadge && leaderText) {
      if (total > 0 && ranked[0].count > 0) {
        leaderBadge.style.display = "flex";
        const topCount = ranked[0].count;
        const leaders = ranked
          .filter(item => item.count === topCount)
          .map(item => VR_LABELS[item.index]);

        leaderText.textContent = leaders.length > 1
          ? `คะแนนเท่ากัน: ${leaders.join(", ")}`
          : `กำลังนำ: ${leaders[0]}`;
      } else {
        leaderBadge.style.display = "none";
      }
    }

    // สร้าง DOM Legend ด้วย DocumentFragment ช่วยเพิ่ม Performance
    const fragment = document.createDocumentFragment();

    ranked.forEach((item, rank) => {
      const isLeader = rank === 0 && total > 0;
      const row = document.createElement("div");
      row.className = `vr-legend-row ${isLeader ? "is-leader" : ""}`;

      const medalBg = MEDAL_BG[Math.min(rank, 3)];

      row.innerHTML = `
        <div class="vr-medal" style="background:${medalBg}">${rank + 1}</div>
        <div class="vr-legend-swatch" style="background:${VR_COLORS[item.index]}"></div>
        <div class="vr-legend-info">
          <div class="vr-legend-top">
            <span class="vr-name">${VR_LABELS[item.index]}</span>
            <span class="vr-pct">${item.pct.toFixed(1)}% · ${item.count.toLocaleString("th-TH")} คะแนน</span>
          </div>
          <div class="vr-legend-bar">
            <div
              class="vr-legend-bar-fill"
              style="width:${item.pct}%; background:${VR_COLORS[item.index]}"
            ></div>
          </div>
        </div>
      `;

      fragment.appendChild(row);
    });

    legend.innerHTML = "";
    legend.appendChild(fragment);

    if (updatedEl) {
      updatedEl.textContent = `อัปเดตล่าสุด ${new Date().toLocaleTimeString("th-TH")}`;
    }
  }

  // Realtime Firebase Listener (รับข้อมูล Realtime สดทุกวินาที)
  const votesRef = ref(db, "votes");
  onValue(
    votesRef,
    (snapshot) => {
      const data = snapshot.val() || {};
      const counts = Array.from({ length: 6 }, (_, index) => {
        const key = index + 1;
        return Number(data[key] ?? data[String(key)] ?? 0);
      });

      renderDonut(counts);
    },
    (error) => {
      console.error("Firebase Realtime Listener Error:", error);
    }
  );

  window.renderDonut = renderDonut;
})();


/* =========================
   FIRE EFFECT
========================= */

function fireEffect() {

  const count = 18;

  for (let i = 0; i < count; i++) {

    const fire =
      document.createElement("div");

    fire.innerText =
      ["🔥","🔥","🔥","✨","💫"][
        Math.floor(Math.random() * 5)
      ];


    fire.style.cssText = `
      position: fixed;
      font-size: ${14 + Math.random() * 22}px;
      left: ${20 + Math.random() * 60}%;
      bottom: 10%;
      z-index: 99999;
      pointer-events: none;
      animation:
        fireRise
        ${0.8 + Math.random() * 0.8}s
        ease forwards;
      animation-delay:
        ${Math.random() * 0.4}s;
    `;


    document.body.appendChild(fire);


    setTimeout(() => {

      fire.remove();

    },1600);

  }

}
;/* ============================================================
   สรุปผลโหวตแบบวงกลม (Donut Chart) — เวอร์ชันสวยขึ้น
   ต่อท้ายไฟล์ script.js เดิม
   ------------------------------------------------------------
   วิธีเชื่อมกับระบบโหวตจริงของคุณ:

   1) แก้ getVoteCounts() ด้านล่าง ให้ดึงยอดโหวตจริงจากที่ที่
      ปุ่ม VOTE NOW เดิมของคุณบันทึกข้อมูลไป (เช่น Google Sheets
      ผ่าน Apps Script, Firebase, หรือ backend อื่น ๆ)

   2) ในฟังก์ชัน voteTeam(id) ที่มีอยู่แล้ว หลังบันทึกโหวตสำเร็จ
      ให้เรียก window.registerVote(index) ทันที เพื่ออัปเดตวงกลม
      และเล่นเอฟเฟกต์ confetti โดยไม่ต้องรอ interval

   3) ถ้าอยากให้เห็นคนอื่นโหวตแบบสด ๆ ด้วย ให้ใช้ realtime listener
      ของ backend (เช่น Firebase onValue) แทนการ setInterval poll
      ที่ใส่ไว้เป็นตัวอย่างด้านล่าง
   ============================================================ */


/* =========================
   REGISTER SYSTEM
========================= */

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const room = document.getElementById('registerRoom').value.trim();
    const sport = document.getElementById('sport').value;
    const level = document.getElementById('registerLevel').value;
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
    "ม.3": ["3/4", "3/5", "3/10"],
    "ม.4": ["4/1", "4/6", "4/13"],
    "ม.5": ["5/3", "5/7", "5/11"],
    "ม.6": ["6/7", "6/9", "6/14"]
};

const levelGrid = document.getElementById('levelGrid');
const roomGrid = document.getElementById('roomGrid');
const roomSection = document.getElementById('registerRoomSection');
const levelInput = document.getElementById('registerLevel');
const roomInput = document.getElementById('registerRoom');

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

// แหล่งรวมลิงก์กลุ่ม Messenger ของแต่ละกีฬา
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

const GAS_URL = "https://script.google.com/macros/s/AKfycbxfIvRJik7PZonZcCUW5J5o9aLsqctN7D7up9BC4qCCES5EQC1EZ1zTJew01QdtY78W/exec";
 
const students = {
  // --- ม.5/11 ---
  "39079": { name: "นางสาว ธัญเรศ นรินทร์", room: "ม.5/11" },
  "39506": { name: "นาย เดโช ปานทอง", room: "ม.5/11" },
  "39979": { name: "นาย พิชญณุ อุ่นละม้าย", room: "ม.5/11" },
  "39991": { name: "นาย กฤษฎา แก้ววิจิตร", room: "ม.5/11" },
  "39997": { name: "นางสาว มนต์ธิชา แก้วอยู่", room: "ม.5/11" },
  "40103": { name: "นาย ธฤต แจ้ใจ", room: "ม.5/11" },
  "40105": { name: "นางสาว สาธิตา ปัญญา", room: "ม.5/11" },
  "40119": { name: "นาย ธนภัทร ใจบุญ", room: "ม.5/11" },
  "40123": { name: "นางสาว จุติพร ดวงตาทิพย์", room: "ม.5/11" },
  "40131": { name: "นาย นาวิน ปินตาแสน", room: "ม.5/11" },
  "40138": { name: "นางสาว งามเนตร ก้อนจำปา", room: "ม.5/11" },
  "40148": { name: "นางสาว ปานชีวา จุลเจิมศักดิ์", room: "ม.5/11" },
  "40166": { name: "นางสาว ชนิดนันท์ อนันต์กิจโรจนา", room: "ม.5/11" },
  "40186": { name: "นาย ยงยุทธ สุขสวัสดิ์", room: "ม.5/11" },
  "40190": { name: "นาย ดัสกร ใจยะสาร", room: "ม.5/11" },
  "40227": { name: "นาย ธนดล อ้นบ้านดง", room: "ม.5/11" },
  "40229": { name: "นางสาว สุธาสินี สุยะสัก", room: "ม.5/11" },
  "40243": { name: "นางสาว ธนัญชนก ไชยวงศ์", room: "ม.5/11" },
  "40344": { name: "นางสาว บุญยาพร มูลธิ", room: "ม.5/11" },
  "40346": { name: "นาย ธนกร ต๊ะกาบโพธิ์", room: "ม.5/11" },
  "40367": { name: "นางสาว พิชญาภา จำปาทอง", room: "ม.5/11" },
  "40369": { name: "นาย ปริญญา ธรรมยอม", room: "ม.5/11" },
  "40372": { name: "นาย วชิรวิทย์ ณะปัญญา", room: "ม.5/11" },
  "40389": { name: "นาย ชวัลลักษณ์ แดงเตจ๊ะ", room: "ม.5/11" },
  "40392": { name: "นางสาว ข้าวขวัญ ธำรงวิชชาการ", room: "ม.5/11" },
  "40432": { name: "นางสาว นันทิชา เบ้าสีดา", room: "ม.5/11" },
  "40437": { name: "นางสาว พิมพ์ลภัส อุนจะนำ", room: "ม.5/11" },
  "40443": { name: "นาย ณัฐพงษ์ ต้นเจริญ", room: "ม.5/11" },
  "40452": { name: "นางสาว พิมพ์มาดา เฮ้าปาน", room: "ม.5/11" },
  "40454": { name: "นางสาว พิมพ์ลภัส จอมขันเงิน", room: "ม.5/11" },
  "41907": { name: "นาย ปิติยังภูร สาวะจันทร์", room: "ม.5/11" },
  "42548": { name: "นาย ญาณวุฒิ เนตรนิลพฤกษ์", room: "ม.5/11" },
  "42549": { name: "นางสาว สุพิชญา คำปันนา", room: "ม.5/11" },
  "42550": { name: "นาย พงศกร หาทวี", room: "ม.5/11" },
  "42551": { name: "นางสาว ปริยาภรณ์ แรกนา", room: "ม.5/11" },
  "42552": { name: "นางสาว ขวัญจิรา คำนาศักดิ์", room: "ม.5/11" },
  "42553": { name: "นาย พงษธร ห้าแสน", room: "ม.5/11" },
  "42554": { name: "นาย ธณิษา วิเศษกาศ", room: "ม.5/11" },
  "42555": { name: "นาย อนาวิน ปาสีเลื่อม", room: "ม.5/11" },
  "42556": { name: "นาย อธิวัฒน์ ไชยชนะ", room: "ม.5/11" },

  // --- ม.5/7 ---
  "39858": { name: "นาย ชยพล แสนคะนารึ", room: "ม.5/7" },
  "39881": { name: "นางสาว พรปวีณ์ ทรัพย์สนธิ", room: "ม.5/7" },
  "39893": { name: "นาย ภูริวัชร์ อุดมทิพย์", room: "ม.5/7" },
  "39901": { name: "นางสาว ศุภิกา ชูกลิ่น", room: "ม.5/7" },
  "39936": { name: "นาย สุกฤต สิงห์โตวะนา", room: "ม.5/7" },
  "39942": { name: "นาย พีรพัฒน์ สมบูนไชย", room: "ม.5/7" },
  "39943": { name: "นางสาว พิชญ์สิริ โกมาร", room: "ม.5/7" },
  "39959": { name: "นางสาว อชิรญาณ์ บุตรนุชิต", room: "ม.5/7" },
  "39963": { name: "นางสาว ญาดากานต์ ศรีลองเมือง", room: "ม.5/7" },
  "39994": { name: "นาย ศุภโชค ใจจิตร", room: "ม.5/7" },
  "39995": { name: "นางสาว ณิชชา เทพพรมวงศ์", room: "ม.5/7" },
  "40005": { name: "นางสาว สุพิชช์นันท์ กิติทรัพย์", room: "ม.5/7" },
  "40040": { name: "นางสาว กัลย์รัตน์ กันทาทรัพย์", room: "ม.5/7" },
  "40042": { name: "นางสาว กนกนาถ สุปินน๊ะวรรณา", room: "ม.5/7" },
  "40045": { name: "นาย ณัฐกาส ศรีสด", room: "ม.5/7" },
  "40051": { name: "นาย ธนกฤต พื้นอินต๊ะศรี", room: "ม.5/7" },
  "40244": { name: "นาย นาคพิชัย กาวิเนตร", room: "ม.5/7" },
  "40246": { name: "นางสาว พิชชาภา บุญเฌอ", room: "ม.5/7" },
  "40249": { name: "นางสาว ขวัญวรินทร์ แก้วกันโท", room: "ม.5/7" },
  "40253": { name: "นางสาว ภคมน วงศ์สถาน", room: "ม.5/7" },
  "40267": { name: "นาย ธราเทพ ไชยส้าว", room: "ม.5/7" },
  "40277": { name: "นาย วรยุทธ ทิพยรักษ์", room: "ม.5/7" },
  "40327": { name: "นางสาว บุญยาพร เลิศวิไล", room: "ม.5/7" },
  "40352": { name: "นาย บูรพล สุธีรางกูร", room: "ม.5/7" },
  "40362": { name: "นาย นันทิพัฒน์ ปันศรี", room: "ม.5/7" },
  "40444": { name: "นางสาว นรมน จินาเดช", room: "ม.5/7" },
  "40455": { name: "นาย ปาณัท ไม้ประเสริฐ", room: "ม.5/7" },
  "41879": { name: "นาย น้ำเหนือ ศรีนาคำ", room: "ม.5/7" },
  "42513": { name: "นางสาว กัญญารัตน์ จันทร์ต๊ะ", room: "ม.5/7" },
  "42514": { name: "นางสาว มุริน วิชัยกิตติกุล", room: "ม.5/7" },
  "42515": { name: "นาย ธีร์ธวัช หิรัญบริรักษ์", room: "ม.5/7" },
  "42516": { name: "นางสาว ธญปดี วงศ์อนันต์ชัย", room: "ม.5/7" },
  "42517": { name: "นางสาว ปวิชญา ทรายใหม่", room: "ม.5/7" },
  "42518": { name: "นางสาว ศิรภัสสร ต้นกลาง", room: "ม.5/7" },
  "42519": { name: "นางสาว ศศิวิมล สุวรรณชีพ", room: "ม.5/7" },
  "42520": { name: "นาย จักริน หมื่นบาง", room: "ม.5/7" },
  "42521": { name: "นาย นพพล สุนันท์ต๊ะ", room: "ม.5/7" },
  "42522": { name: "นางสาว รมิตา กาตัญญูคุณานนท์", room: "ม.5/7" },
  "42523": { name: "นาย นพวัฒน์ สุยะวารี", room: "ม.5/7" },
  "42525": { name: "นางสาว เขมจิรา บุญมาอุป", room: "ม.5/7" },

  // --- ม.5/3 ---
  "39854": { name: "นางสาว ปวรวรรณ เมินชัยภูมิ", room: "ม.5/3" },
  "39917": { name: "นางสาว เยาวเรศ อภิวงศ์", room: "ม.5/3" },
  "39923": { name: "นาย กรกฤษณ์ ยะใจ", room: "ม.5/3" },
  "39927": { name: "นางสาว ชญาดา สินธุบุญ", room: "ม.5/3" },
  "39929": { name: "นางสาว กชพร สงวนศักดิ์", room: "ม.5/3" },
  "39938": { name: "นางสาว กุลสตรี จักขุเรือง", room: "ม.5/3" },
  "39948": { name: "นาย กิตติพงศ์ แก้วปัน", room: "ม.5/3" },
  "39950": { name: "นางสาว อริญชยา ตุ่นใจ", room: "ม.5/3" },
  "39956": { name: "นาย วิชานาถ โยศรี", room: "ม.5/3" },
  "39958": { name: "นางสาว ธัญชนก คำพิภาศ", room: "ม.5/3" },
  "39965": { name: "นางสาว ณัฏฐณิชา อินออม", room: "ม.5/3" },
  "39968": { name: "นางสาว ภัควลัญชน์ กันทะวรรณ์", room: "ม.5/3" },
  "39973": { name: "นาย ปกรณ์ ศรีบุญกอง", room: "ม.5/3" },
  "39998": { name: "นางสาว วิมลณัฐ วสุวัช", room: "ม.5/3" },
  "40002": { name: "นางสาว ไอยวรักฏ์ อินต๊ะปัน", room: "ม.5/3" },
  "40011": { name: "นางสาว อภิชญา ผาด่านสกุล", room: "ม.5/3" },
  "40014": { name: "นางสาว กวินตรา วรรณโชค", room: "ม.5/3" },
  "40025": { name: "นางสาว ธัญญลักษณ์ วงค์จันทร์", room: "ม.5/3" },
  "40242": { name: "นางสาว กรวรรณ กันธาทรัพย์", room: "ม.5/3" },
  "40282": { name: "นาย ณัฐปกรณ์ ตุ่นไชย", room: "ม.5/3" },
  "40414": { name: "นางสาว สิริภาพร บัวงาม", room: "ม.5/3" },
  "40453": { name: "นางสาว ชนกนันท์ พรมเสพสัก", room: "ม.5/3" },
  "42487": { name: "นาย จักรภพ พรมชัย", room: "ม.5/3" },
  "42488": { name: "นาย ต้นธาร ปัญโญศักดิ์", room: "ม.5/3" },
  "42489": { name: "นางสาว จุฬาลักษณ์ จิตวิจักร", room: "ม.5/3" },
  "42490": { name: "นางสาว กรรณิการ์ ศรีเกื้อกลิ่น", room: "ม.5/3" },
  "42491": { name: "นางสาว สุลาลีวัลย์ กัณทะ", room: "ม.5/3" }, 
  "42492": { name: "นางสาว ฐิตินันท์ ไชยเขื่อน", room: "ม.5/3" },
  "42493": { name: "นาย พีรพล ทองแดง", room: "ม.5/3" },
  "42494": { name: "นางสาว ณณิชา สุขสวัสดิ์", room: "ม.5/3" }
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




const SYSTEM_ENABLED = false; 


/* =========================================================
   ORDER + PAYMENT (ระบบเดียว)
   เลือกแบบ -> กรอกข้อมูล -> ชื่อ/เบอร์หลังเสื้อ -> ไซซ์ -> แนบสลิป -> ส่งครั้งเดียว
========================================================= */

// 🔗 แทนที่ด้วย Web app URL ที่ได้จากขั้นตอน Deploy Apps Script
const ORDER_GAS_URL = "https://script.google.com/macros/s/AKfycbyrBvbjDXWEbwS8ZY61HOMBH8rgS8nnn-ysMOOrIe45YrqJ1d86SnNbZXjzyK4vjAwl/exec";

/* =========================
   เลือกแบบเสื้อ (แบบที่1 / แบบที่2)
   - แบบที่1: ซ่อนเฉพาะช่อง "ชื่อหลังเสื้อ" (ช่องเบอร์ยังโชว์ปกติ)
   - แบบที่2: โชว์ทั้งชื่อและเบอร์ตามปกติ
========================= */
const orderDesignGrid = document.getElementById('orderDesignGrid');
const orderDesignInput = document.getElementById('orderDesign');

function updateBackNameVisibility(design) {
  const backNameField = document.getElementById('backNameField');
  const backNameInputEl = document.getElementById('orderBackName');

  if (design === '1') {
    if (backNameField) {
      backNameField.style.display = 'none';
    } else if (backNameInputEl) {
      backNameInputEl.style.display = 'none';
    }
    if (backNameInputEl) backNameInputEl.value = '';
  } else {
    if (backNameField) {
      backNameField.style.display = '';
    } else if (backNameInputEl) {
      backNameInputEl.style.display = '';
    }
  }
}

if (orderDesignGrid) {
  orderDesignGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.pick-btn');
    if (!btn) return;

    orderDesignGrid.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    const design = btn.dataset.design;
    if (orderDesignInput) orderDesignInput.value = design;
    updateBackNameVisibility(design);
  });

  updateBackNameVisibility('1');
}

/* =========================
   เลือกระดับชั้น → ห้อง
========================= */
const orderRoomsByLevel = {
    "ม.1": ["1/2", "1/7", "1/15"],
    "ม.2": ["2/1", "2/8", "2/13"],
    "ม.3": ["3/4", "3/5", "3/10"],
    "ม.4": ["4/1", "4/6", "4/13"],
    "ม.5": ["5/3", "5/7", "5/11"],
    "ม.6": ["6/7", "6/9", "6/14"]
};

const orderLevelGrid = document.getElementById('orderLevelGrid');
const orderRoomGrid = document.getElementById('orderRoomGrid');
const orderRoomSection = document.getElementById('orderRoomSection');
const orderRoomInput = document.getElementById('orderRoom');

if (orderLevelGrid) {
    orderLevelGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.pick-btn');
        if (!btn) return;

        const selectedLevel = btn.dataset.level;

        orderLevelGrid.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        orderRoomInput.value = '';

        const rooms = orderRoomsByLevel[selectedLevel] || [];
        orderRoomGrid.innerHTML = '';
        rooms.forEach(room => {
            const roomBtn = document.createElement('button');
            roomBtn.type = 'button';
            roomBtn.className = 'pick-btn';
            roomBtn.dataset.room = room;
            roomBtn.textContent = room;
            orderRoomGrid.appendChild(roomBtn);
        });

        orderRoomSection.style.display = 'block';
    });
}

if (orderRoomGrid) {
    orderRoomGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.pick-btn');
        if (!btn) return;

        orderRoomGrid.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        orderRoomInput.value = btn.dataset.room;
    });
}

/* =========================
   เลือกไซซ์
========================= */
const sizeGrid = document.getElementById('sizeGrid');
const orderSizeInput = document.getElementById('orderSize');
const otherSizeInput = document.getElementById('otherSizeInput');

if (sizeGrid) {
  sizeGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.pick-btn');
    if (!btn) return;

    sizeGrid.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    if (btn.dataset.size === 'OTHER') {
      if (otherSizeInput) {
        otherSizeInput.style.display = 'block';
        otherSizeInput.focus();
      }
      orderSizeInput.value = '';
    } else {
      if (otherSizeInput) {
        otherSizeInput.style.display = 'none';
        otherSizeInput.value = '';
      }
      orderSizeInput.value = btn.dataset.size;
    }
  });
}

if (otherSizeInput) {
  otherSizeInput.addEventListener('input', () => {
    orderSizeInput.value = otherSizeInput.value.trim();
  });
}

/* =========================
   จำกัดให้ช่องเบอร์หลังเสื้อกรอกได้เฉพาะตัวเลข
========================= */
const orderBackNumberInput = document.getElementById('orderBackNumber');
if (orderBackNumberInput) {
  orderBackNumberInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });
}

/* =========================
   แนบสลิปโอนเงิน (ขั้นตอนที่ 5)
========================= */
let orderSlipBase64 = "";

const orderSlipInput = document.getElementById('orderSlipInput');
const orderUploadDrop = document.getElementById('orderUploadDrop');

if (orderSlipInput) {
  orderSlipInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (ev) {
      orderSlipBase64 = ev.target.result;
      const previewEl = document.getElementById('orderSlipPreview');
      const previewBox = document.getElementById('orderSlipPreviewBox');

      if (previewEl) previewEl.src = orderSlipBase64;
      if (previewBox) previewBox.classList.add('show');
      if (orderUploadDrop) orderUploadDrop.querySelector('.upload-text').textContent = '✅ แนบสลิปแล้ว (แตะเพื่อเปลี่ยน)';
    };
    reader.readAsDataURL(file);
  });
}

function resetSlipUpload() {
  orderSlipBase64 = "";
  const previewBox = document.getElementById('orderSlipPreviewBox');
  const previewEl = document.getElementById('orderSlipPreview');
  if (previewBox) previewBox.classList.remove('show');
  if (previewEl) previewEl.src = '';
  if (orderUploadDrop) orderUploadDrop.querySelector('.upload-text').textContent = 'แตะเพื่อเลือกรูปสลิป';
  if (orderSlipInput) orderSlipInput.value = '';
}

/* =========================
   ส่งฟอร์ม: สั่งจอง + ชำระเงิน ในครั้งเดียว
========================= */
const orderForm = document.getElementById('orderForm');
if (orderForm) {
  orderForm.noValidate = true;

  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 🚧 เช็คก่อนเสมอว่าระบบเปิดใช้งานหรือยัง
    if (typeof SYSTEM_ENABLED !== 'undefined' && !SYSTEM_ENABLED) {
      alert('🚧 ระบบสั่งจองเสื้อยังไม่เปิดให้ใช้งานในขณะนี้ กรุณารอประกาศอีกครั้ง');
      return;
    }

    const design = orderDesignInput ? orderDesignInput.value : '';
    const name = document.getElementById('orderName').value.trim();
    const room = document.getElementById('orderRoom').value.trim();
    const rollNo = document.getElementById('orderRollNo') ? document.getElementById('orderRollNo').value.trim() : '';
    const backName = document.getElementById('orderBackName') ? document.getElementById('orderBackName').value.trim() : '';
    const backNumber = document.getElementById('orderBackNumber') ? document.getElementById('orderBackNumber').value.trim() : '';
    const size = orderSizeInput ? orderSizeInput.value : '';

    if (!design) {
      alert('⚠️ กรุณาเลือกแบบเสื้อ');
      return;
    }
    if (!name || !room || !rollNo || !size) {
      alert('⚠️ กรุณากรอกชื่อ เลือกระดับชั้น/ห้อง เลขที่ และเลือกไซซ์ให้ครบ');
      return;
    }
    if (!orderSlipBase64) {
      alert('⚠️ กรุณาแนบรูปสลิปโอนเงินก่อนกดยืนยัน');
      return;
    }

    const btn = document.getElementById('orderSubmitBtn');
    btn.disabled = true;
    btn.textContent = '⏳ กำลังส่งข้อมูล...';

    try {
      // ⚠️ ฝั่ง Apps Script (ORDER_GAS_URL) ต้องอัปเดตให้รับ action นี้
      //    และบันทึกข้อมูลออเดอร์ + รูปสลิปในแถวเดียวกันตั้งแต่ครั้งแรก
      //    (เดิมแบ่งเป็น 2 ขั้นตอน: สร้างแถว -> ค้นหาแล้วแนบสลิปทีหลัง)
      const payload = {
        action: 'orderAndPay',
        design: design,
        name: name,
        room: room,
        rollNo: rollNo,
        backName: backName,
        backNumber: backNumber,
        size: size,
        photo: orderSlipBase64
      };

      const response = await fetch(ORDER_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ สั่งจองและชำระเงินสำเร็จ! ขอบคุณครับ 🌸');
        orderForm.reset();

        if (orderDesignGrid) {
          orderDesignGrid.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
          if (orderDesignInput) orderDesignInput.value = '';
          updateBackNameVisibility('1');
        }
        if (orderLevelGrid) {
          orderLevelGrid.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
        }
        if (orderRoomGrid) {
          orderRoomGrid.innerHTML = '';
        }
        if (orderRoomSection) {
          orderRoomSection.style.display = 'none';
        }
        if (sizeGrid) {
          sizeGrid.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
        }
        resetSlipUpload();
      } else {
        alert('❌ เกิดข้อผิดพลาดจากระบบ: ' + data.error);
      }

    } catch (err) {
      console.error(err);
      alert('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      btn.disabled = false;
      btn.textContent = '⚡ ยืนยันการสั่งจองและชำระเงิน';
    }
  });
}





/* =========================
   SASH ORDER SYSTEM
   ผ้าคาดคณะสี 35 บาท
========================= */
const SASH_SYSTEM_ENABLED = true;
const SASH_GAS_URL = 'https://script.google.com/macros/s/AKfycbzB0vxpjFjev_AserRtSn-l51CvBoxAncP6RV7zAm6-pagP8kRcXQqHcFqYfsa1r_mPkQ/exec';
const sashLevelGrid = document.getElementById('sashLevelGrid');
const sashRoomGrid  = document.getElementById('sashRoomGrid');
const sashRoomInput = document.getElementById('sashRoom');


/* =========================
   ห้องแต่ละระดับชั้น
========================= */

const sashRoomsByLevel = {
  "ม.1": ["1/2", "1/7", "1/15"],
  "ม.2": ["2/1", "2/8", "2/13"],
  "ม.3": ["3/4", "3/5", "3/10"],
  "ม.4": ["4/1", "4/6", "4/13"],
  "ม.5": ["5/3", "5/7", "5/11"],
  "ม.6": ["6/7", "6/9", "6/14"]
};


/* =========================
   เลือกระดับชั้น
========================= */

if (sashLevelGrid) {

  sashLevelGrid.addEventListener('click', (e) => {

    const btn = e.target.closest('.pick-btn');

    if (!btn) return;

    const selectedLevel = btn.dataset.level;


    // ทำให้ระดับที่เลือกเป็นสีชมพู
    sashLevelGrid
      .querySelectorAll('.pick-btn')
      .forEach(b => b.classList.remove('selected'));

    btn.classList.add('selected');


    // ล้างห้องเดิม
    sashRoomInput.value = '';
    sashRoomGrid.innerHTML = '';


    // ดึงข้อมูลห้อง
    const rooms = sashRoomsByLevel[selectedLevel] || [];


    // สร้างปุ่มห้อง
    rooms.forEach(room => {

      const roomBtn = document.createElement('button');

      roomBtn.type = 'button';
      roomBtn.className = 'pick-btn';
      roomBtn.dataset.room = room;
      roomBtn.textContent = room;

      sashRoomGrid.appendChild(roomBtn);

    });


    updateSashProgress();

  });

}


/* =========================
   เลือกห้อง
========================= */

if (sashRoomGrid) {

  sashRoomGrid.addEventListener('click', (e) => {

    const btn = e.target.closest('.pick-btn');

    if (!btn) return;


    // เอาสี selected ออกจากห้องอื่น
    sashRoomGrid
      .querySelectorAll('.pick-btn')
      .forEach(b => b.classList.remove('selected'));


    // เลือกห้องนี้
    btn.classList.add('selected');

    sashRoomInput.value = btn.dataset.room;


    updateSashProgress();

  });

}

const sashNameInput    = document.getElementById('sashName');
const sashRollNoInput  = document.getElementById('sashRollNo');
const sashContactInput = document.getElementById('sashContact');

if (sashNameInput) sashNameInput.addEventListener('input', updateSashProgress);
if (sashRollNoInput) {
  sashRollNoInput.addEventListener('input', () => {
    sashRollNoInput.value = sashRollNoInput.value.replace(/[^0-9]/g, '');
    updateSashProgress();
  });
}
if (sashContactInput) sashContactInput.addEventListener('input', updateSashProgress);

// ===== แนบรูปสลิป =====
let sashSlipBase64 = "";
const sashSlipInput      = document.getElementById('sashSlipInput');
const sashUploadDrop     = document.getElementById('sashUploadDrop');
const sashSlipPreviewBox = document.getElementById('sashSlipPreviewBox');
const sashChangeSlipBtn  = document.getElementById('sashChangeSlip');

if (sashSlipInput) {
  sashSlipInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      sashSlipBase64 = ev.target.result;
      document.getElementById('sashSlipPreview').src = sashSlipBase64;
      sashSlipPreviewBox.classList.add('show');
      sashUploadDrop.classList.add('hidden');
      updateSashProgress();
    };
    reader.readAsDataURL(file);
  });
}

if (sashChangeSlipBtn) {
  sashChangeSlipBtn.addEventListener('click', () => {
    sashSlipInput.click();
  });
}

// ===== อัปเดตแถบสถานะตามความครบถ้วนของข้อมูล =====
function updateSashProgress() {
  const name    = sashNameInput ? sashNameInput.value.trim() : '';
  const room    = sashRoomInput ? sashRoomInput.value.trim() : '';
  const rollNo  = sashRollNoInput ? sashRollNoInput.value.trim() : '';
  const contact = sashContactInput ? sashContactInput.value.trim() : '';

  const infoComplete = name && room && rollNo && contact;
  const payComplete  = infoComplete && sashSlipBase64;

  const fill = document.getElementById('sashProgressFill');
  const labels = document.querySelectorAll('#sashProgress .sash-progress-label');

  let percent = 8;
  let activeStep = 1;

  if (payComplete) { percent = 100; activeStep = 3; }
  else if (infoComplete) { percent = 55; activeStep = 2; }
  else if (name || room || rollNo) { percent = 25; activeStep = 1; }

  if (fill) fill.style.width = percent + '%';
  labels.forEach(l => l.classList.toggle('active', Number(l.dataset.step) <= activeStep));
}

// ===== ส่งฟอร์ม =====
const sashForm = document.getElementById('sashForm');
if (sashForm) {
  sashForm.noValidate = true;

  sashForm.addEventListener('submit', async (e) => {
    e.preventDefault();
 // 🚧 ระบบยังไม่เปิดให้สั่งซื้อจริง — เช็คเป็นด่านแรกสุดเสมอ
    if (!SASH_SYSTEM_ENABLED) {
      alert('🚧 ระบบสั่งซื้อผ้าคาดยังไม่เปิดให้ใช้งานในขณะนี้ กรุณารอประกาศอีกครั้ง');
      return;
    }
    const name    = sashNameInput.value.trim();
    const room    = sashRoomInput.value.trim();
    const rollNo  = sashRollNoInput.value.trim();
    const contact = sashContactInput.value.trim();

    if (!name || !room || !rollNo || !contact) {
      alert('⚠️ กรุณากรอกชื่อ เลือกระดับชั้น/ห้อง เลขที่ และช่องทางติดต่อให้ครบ');
      return;
    }
    if (!sashSlipBase64) {
      alert('⚠️ กรุณาแนบรูปสลิปโอนเงิน');
      return;
    }

    const btn = document.getElementById('sashSubmitBtn');
    btn.disabled = true;
    btn.textContent = '⏳ กำลังส่งข้อมูล...';

    try {
  const payload = { action: 'sash', name, room, rollNo, contact, price: 35, photo: sashSlipBase64 };

  const response = await fetch(SASH_GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (data.success) {
    sashForm.style.display = 'none';
    const successBox = document.getElementById('sashSuccessBox');
    successBox.innerHTML = `
      <div class="sash-success-icon">🎗️</div>
      <h3>สั่งซื้อผ้าคาดสำเร็จแล้ว!</h3>
      <p class="sash-success-note">ขอบคุณสำหรับการสั่งซื้อนะครับ 🌸</p>
    `;
    successBox.style.display = 'block';
  } else {
    alert('❌ เกิดข้อผิดพลาดจากระบบ: ' + data.error);
  }
} catch (err) {
  console.error(err);
  alert('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
} finally {
  btn.disabled = false;
  btn.textContent = '⚡ ยืนยันการสั่งซื้อผ้าคาด';
}
 });
}



/* =========================================================
   SPOT DANCE REGISTER (#spotdance)
   ⚠️ แก้ SD_GAS_URL เป็น Apps Script Web app URL ของคุณ
   ⚠️ แก้ลิงก์กลุ่มใน HTML (#sdQrLink) หรือแก้ตรง SD_GROUP_LINK ด้านล่างก็ได้
========================================================= */

const SD_GAS_URL = "https://script.google.com/macros/s/AKfycbzNVD0af-zr-_3hGNZR3ZFlAH1zp7YPmRfQtQCOdzQGt_CRGMbXUbJprYR_C2qzQZJW/exec";
const SD_GROUP_LINK = "https://ig.me/j/AbbCm3vvtoarsh_o/"; // ลิงก์กลุ่ม สปอตแดนซ์

const sdRoomsByLevel = {
    "ม.2": ["2/1", "2/8", "2/13"],
    "ม.3": ["3/4", "3/5", "3/10"],
    "ม.4": ["4/1", "4/6", "4/13"],
    "ม.5": ["5/3", "5/7", "5/11"],
    "ม.6": ["6/7", "6/9", "6/14"]
};

const sdLevelGrid = document.getElementById('sdLevelGrid');
const sdRoomGrid  = document.getElementById('sdRoomGrid');
const sdRoomInput = document.getElementById('sdRoom');

if (sdLevelGrid) {
  Object.keys(sdRoomsByLevel).forEach(level => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick-btn';
    b.dataset.level = level;
    b.textContent = level;
    sdLevelGrid.appendChild(b);
  });

  sdLevelGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.pick-btn');
    if (!btn) return;
    const selectedLevel = btn.dataset.level;

    sdLevelGrid.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    sdRoomInput.value = '';

    const rooms = sdRoomsByLevel[selectedLevel] || [];
    sdRoomGrid.innerHTML = '';
    rooms.forEach(room => {
      const roomBtn = document.createElement('button');
      roomBtn.type = 'button';
      roomBtn.className = 'pick-btn';
      roomBtn.dataset.room = room;
      roomBtn.textContent = room;
      sdRoomGrid.appendChild(roomBtn);
    });
  });
}

if (sdRoomGrid) {
  sdRoomGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.pick-btn');
    if (!btn) return;
    sdRoomGrid.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    sdRoomInput.value = btn.dataset.room;
  });
}

const sdRollNoInput = document.getElementById('sdRollNo');
const sdPhoneInput  = document.getElementById('sdPhone');

if (sdRollNoInput) {
  sdRollNoInput.addEventListener('input', () => {
    sdRollNoInput.value = sdRollNoInput.value.replace(/[^0-9]/g, '');
  });
}
if (sdPhoneInput) {
  sdPhoneInput.addEventListener('input', () => {
    sdPhoneInput.value = sdPhoneInput.value.replace(/[^0-9]/g, '');
  });
}

/* ===== Popup QR ===== */
function showSdQrPopup() {
  const popup = document.getElementById('sdQrPopup');
  const link = document.getElementById('sdQrLink');
  if (link) link.href = SD_GROUP_LINK;
  if (popup) popup.classList.add('show');
}
function closeSdQrPopup() {
  const popup = document.getElementById('sdQrPopup');
  if (popup) popup.classList.remove('show');
}

const sdQrCloseBtn = document.getElementById('sdQrCloseBtn');
if (sdQrCloseBtn) sdQrCloseBtn.addEventListener('click', closeSdQrPopup);

const sdQrPopupEl = document.getElementById('sdQrPopup');
if (sdQrPopupEl) {
  sdQrPopupEl.addEventListener('click', (e) => {
    if (e.target.id === 'sdQrPopup') closeSdQrPopup();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSdQrPopup();
});

/* ===== ส่งฟอร์ม ===== */
const sdForm = document.getElementById('sdForm');
if (sdForm) {
  sdForm.noValidate = true;

  sdForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name     = document.getElementById('sdName').value.trim();
    const nickname = document.getElementById('sdNickname').value.trim();
    const room     = sdRoomInput.value.trim();
    const rollNo   = sdRollNoInput.value.trim();
    const phone    = sdPhoneInput.value.trim();

    if (!name || !nickname || !room || !rollNo || !phone) {
      alert('⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    if (phone.length < 9) {
      alert('⚠️ กรุณากรอกเบอร์โทรให้ครบ 9-10 หลัก');
      return;
    }

    const btn = document.getElementById('sdSubmitBtn');
    btn.disabled = true;
    btn.textContent = '⏳ กำลังส่งข้อมูล...';

    // เด้ง QR ทันที ไม่ต้องรอผลจากชีต (UX ลื่นเหมือนระบบ register เดิม)
    sdForm.reset();
    if (sdLevelGrid) sdLevelGrid.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('selected'));
    if (sdRoomGrid) sdRoomGrid.innerHTML = '';
    showSdQrPopup();

    try {
      const payload = { action: 'spotdance', name, nickname, room, rollNo, phone };

      fetch(SD_GAS_URL, {
        method: 'POST',
        mode: 'no-cors', // ส่งเบื้องหลังแบบเดียวกับ registerForm เดิม
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).catch(err => console.error(err));

      const successBox = document.getElementById('sdSuccessBox');
      successBox.innerHTML = `
        <div class="sd-success-icon">💃</div>
        <h3>สมัครสปอตแดนซ์สำเร็จแล้ว!</h3>
        <div class="sd-success-row"><span>ชื่อ</span><b>${name} (${nickname})</b></div>
        <div class="sd-success-row"><span>ห้อง</span><b>${room} เลขที่ ${rollNo}</b></div>
        <div class="sd-success-row"><span>เบอร์โทร</span><b>${phone}</b></div>
        <p class="sd-success-note">อย่าลืมสแกน QR เข้ากลุ่มด้วยนะครับ 🌸</p>
      `;
      successBox.style.display = 'block';

    } catch (err) {
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = '💃 ยืนยันสมัครสปอตแดนซ์';
    }
  });
}
