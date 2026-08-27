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
