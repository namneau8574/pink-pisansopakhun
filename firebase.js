/* =========================
   LOADER (รวมเป็นตัวเดียว — ของเดิมมี 2 อันซ้ำกัน ทำให้ fade ไม่ทำงานจริง)
========================= */

window.addEventListener('load', () => {

  setTimeout(() => {

    const loader = document.getElementById('loader');

    loader.style.opacity = '0';

    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);

  }, 3000);

});

/* =========================
   PARTICLES
========================= */

const particles = document.querySelector('.particles');

for (let i = 0; i < 100; i++) {

  const span = document.createElement('span');

  span.style.left = Math.random() * 100 + '%';
  span.style.animationDuration = (2 + Math.random() * 5) + 's';
  span.style.animationDelay = Math.random() * 5 + 's';

  particles.appendChild(span);

}

/* =========================
   CURSOR
========================= */

const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

/* =========================
   SCROLL
========================= */

window.scrollToSection = function (id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
};

/* =========================
   SOUND
========================= */

function playSound() {
  const audio = new Audio(
    'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
  );
  audio.volume = 0.2;
  audio.play();
}

/* =========================================================
   FIREBASE + VOTE SYSTEM
   6 แบบเสื้อ
   กันโหวตซ้ำ 1 ปี / เครื่อง
   ใช้ Firebase Realtime Database
========================================================= */

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

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


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);


/* =========================================================
   SETTINGS
========================================================= */

const ONE_YEAR =
  365 * 24 * 60 * 60 * 1000;


/* =========================================================
   VOTE SYSTEM
========================================================= */

window.voteTeam = async function (team) {

  try {

    /* -----------------------------------------------------
       ตรวจสอบว่า team ถูกต้อง
    ----------------------------------------------------- */

    const validTeams = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6"
    ];

    team = String(team);

    if (!validTeams.includes(team)) {

      alert("❌ ไม่พบแบบเสื้อที่เลือก");

      return;
    }


    /* -----------------------------------------------------
       ตรวจสอบว่าเครื่องนี้เคยโหวตแล้วหรือยัง
    ----------------------------------------------------- */

    const lastVote =
      localStorage.getItem("lastVote");


    if (lastVote) {

      const lastVoteTime =
        parseInt(lastVote, 10);

      const elapsed =
        Date.now() - lastVoteTime;


      if (elapsed < ONE_YEAR) {

        const nextVote =
          new Date(
            lastVoteTime + ONE_YEAR
          );


        const oldTeam =
          localStorage.getItem("voteTeam") ||
          "แบบที่เลือกไว้";


        alert(
          "⛔ คุณโหวตไปแล้ว\n\n" +

          `คุณโหวตให้ ${oldTeam}\n\n` +

          "สามารถโหวตได้อีกวันที่\n" +

          nextVote.toLocaleDateString(
            "th-TH",
            {
              year: "numeric",
              month: "long",
              day: "numeric"
            }
          )
        );


        return;
      }
    }


    /* -----------------------------------------------------
       ตำแหน่งคะแนนใน Firebase

       votes
        ├── 1
        ├── 2
        ├── 3
        ├── 4
        ├── 5
        └── 6
    ----------------------------------------------------- */

    const voteRef =
      ref(db, `votes/${team}`);


    /* -----------------------------------------------------
       เพิ่มคะแนนด้วย Transaction

       ป้องกันกรณีหลายคนกดพร้อมกัน
    ----------------------------------------------------- */

    const result =
      await runTransaction(
        voteRef,

        (currentValue) => {

          if (
            typeof currentValue !== "number"
          ) {

            currentValue = 0;

          }

          return currentValue + 1;

        }
      );


    /* -----------------------------------------------------
       ตรวจสอบว่าบันทึกสำเร็จ
    ----------------------------------------------------- */

    if (!result.committed) {

      throw new Error(
        "Firebase transaction ไม่สำเร็จ"
      );

    }


    /* -----------------------------------------------------
       คะแนนล่าสุด
    ----------------------------------------------------- */

    const newScore =
      result.snapshot.val();


    /* -----------------------------------------------------
       บันทึกว่าเครื่องนี้โหวตแล้ว
       ล็อก 1 ปี
    ----------------------------------------------------- */

    localStorage.setItem(
      "lastVote",
      String(Date.now())
    );


    localStorage.setItem(
      "voteTeam",
      team
    );


    /* -----------------------------------------------------
       เอฟเฟกต์
    ----------------------------------------------------- */

    if (
      typeof playSound === "function"
    ) {

      playSound();

    }


    if (
      typeof voteAnimation === "function"
    ) {

      voteAnimation(team);

    }


    if (
      typeof fireEffect === "function"
    ) {

      fireEffect();

    }


    /* -----------------------------------------------------
       แจ้งผล
    ----------------------------------------------------- */

    alert(
      `🔥 โหวตแบบที่ ${team} สำเร็จ!\n\n` +

      `คะแนนปัจจุบัน: ${newScore} คะแนน`
    );


  } catch (error) {

    console.error(
      "❌ Vote error:",
      error
    );


    alert(
      "❌ โหวตไม่สำเร็จ\n\n" +
      "กรุณาลองใหม่อีกครั้ง"
    );

  }

};
/* =========================
   COMMENT SYSTEM
========================= */

const commentForm = document.getElementById('commentForm');

commentForm.addEventListener('submit', (e) => {

  e.preventDefault();

  const name = document.getElementById('commentName').value.trim() || 'ANONYMOUS';
  const text = document.getElementById('commentText').value.trim();

  if (text === '') {
    alert('กรุณาพิมพ์ข้อความ');
    return;
  }

  push(ref(db, 'comments'), {
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

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {

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

  const params = new URLSearchParams({ name, room, sport, level, contact });

  try {

    await fetch(
      'https://script.google.com/macros/s/AKfycbxLz64OOBbu9TBfT7oyY_41B8lrZtzAVfUxgLmaLyTJBDsKW9bhWnQmvlbuFYQYs04/exec',
      {
        method: 'POST',
        body: params,
      }
    );

    alert('⚔️ สมัคร ' + sport + ' สำเร็จ!');
    registerForm.reset();

  } catch (error) {

    console.error(error);
    alert('❌ เกิดข้อผิดพลาด: ' + error.message);

  }

});

/* =========================
   POPUP TOAST
========================= */

function showPopup(text) {

  const popup = document.getElementById('popup');

  popup.innerText = text;
  popup.classList.add('show');

  setTimeout(() => {
    popup.classList.remove('show');
  }, 2000);

}

/* =========================
   VOTE ANIMATION
========================= */

function voteAnimation(team) {

  const div = document.createElement('div');

  div.className = 'vote-pop';
  div.innerText = '🔥 +' + team;

  document.body.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 600);

}

/* =========================
   LOAD VOTES (log ไว้ดูใน console)
========================= */

onValue(ref(db, 'votes'), (snapshot) => {
  console.log("VOTES:", snapshot.val());
});

/* =========================
   CARD TILT EFFECT (ใช้ได้กับทุกการ์ด รวมเสื้อที่เพิ่มใหม่
   ตราบใดที่การ์ดนั้นอยู่ใน HTML ตั้งแต่หน้าเว็บโหลดเสร็จ)
========================= */

const cards = document.querySelectorAll('.card');

cards.forEach(card => {

  const img = card.querySelector('.jersey-img');

  if (!img) return; // กันพลาด กรณีการ์ดไหนไม่มีรูปคลาสนี้

  card.addEventListener('mousemove', (e) => {

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

  card.addEventListener('mouseleave', () => {
    img.style.transform = `
      rotateY(0deg)
      rotateX(0deg)
      scale(1)
    `;
  });

});
