const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const yearSelect = document.getElementById("yearSelect");
const monthDisplay = document.getElementById("monthDisplay");
const deathInfo = document.getElementById("deathInfo");

const backgroundImg = new Image();
backgroundImg.src = "https://www.drivetaiwan.tw/Public/Images/202409/457240928143857f4b.JPG";

const yearlyData = {
  2024: [4, 1, 2, 1, 2, 3, 5, 5, 3, 7, 6, 6],
  2023: [3, 2, 3, 4, 3, 2, 3, 3, 5, 4, 7, 2],
  2022: [2, 2, 0, 3, 2, 1, 4, 2, 3, 7, 5, 1],
  2021: [1, 3, 2, 3, 3, 3, 0, 1, 1, 3, 3, 2],
  2020: [5, 1, 0, 1, 1, 2, 0, 1, 2, 2, 2, 1],
  2019: [5, 0, 0, 1, 1, 4, 7, 4, 3, 2, 3, 1],
  2018: [3, 0, 2, 0, 1, 0, 3, 0, 1, 0, 0, 2],
  2017: [1, 1, 0, 2, 0, 0, 0, 2, 4, 1, 1, 2],
  2016: [3, 2, 0, 0, 0, 0, 2, 0, 1, 0, 2, 1],
  2015: [1, 0, 1, 0, 1, 1, 1, 1, 2, 2, 3, 0],
  2014: [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1],
  2013: [0, 0, 0, 3, 0, 0, 1, 2, 0, 1, 2, 0],
  2012: [0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 1, 0],
  2011: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
};

const balls = [];
let animationFrame;
let breakInterval;

Object.keys(yearlyData).sort().reverse().forEach((year) => {
  const option = document.createElement("option");
  option.value = year;
  option.textContent = year;
  yearSelect.appendChild(option);
});

class Ball {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    this.alive = true;
    this.scale = 1;
    this.fragments = [];
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * this.scale, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  break() {
    this.alive = false;

    for (let i = 0; i < 10; i++) {
      this.fragments.push({
        x: this.x,
        y: this.y,
        dx: (Math.random() - 0.5) * 10,
        dy: (Math.random() - 0.5) * 10,
        alpha: 1,
        color: this.color,
      });
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  balls.forEach((b) => b.draw(ctx));

  balls.forEach((b) => {
    b.fragments.forEach((f) => {
      ctx.globalAlpha = f.alpha;
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
      ctx.fill();
      f.x += f.dx;
      f.y += f.dy;
      f.alpha -= 0.03;
    });
    b.fragments = b.fragments.filter((f) => f.alpha > 0);
  });

  ctx.globalAlpha = 1;
  animationFrame = requestAnimationFrame(draw);
}

function startAnimation(year) {
  cancelAnimationFrame(animationFrame);
  clearInterval(breakInterval);
  balls.length = 0;

  const count = Math.floor(Math.random() * 31) + 70;
  for (let i = 0; i < count; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    balls.push(new Ball(x, y, 10));
  }

  draw();
  let month = 0;
  const data = yearlyData[year];

  breakInterval = setInterval(() => {
    if (month >= data.length) {
      clearInterval(breakInterval);
      return;
    }

    const monthDeath = data[month];
    const totalToNow = data.slice(0, month + 1).reduce((a, b) => a + b, 0);
    monthDisplay.textContent = `${year} 年 ${month + 1} 月`;
    deathInfo.textContent = `本月死亡數量：${monthDeath}，累計：${totalToNow}`;

    const alive = balls.filter((b) => b.alive);
    for (let i = 0; i < monthDeath && alive.length > 0; i++) {
      const index = Math.floor(Math.random() * alive.length);
      alive[index].break();
      alive.splice(index, 1);
    }

    month++;
  }, 3000);
}

yearSelect.addEventListener("change", (e) => {
  const year = e.target.value;
  startAnimation(year);
});

backgroundImg.onload = () => {
  const firstYear = yearSelect.value || Object.keys(yearlyData)[0];
  startAnimation(firstYear);
};

const bgm = document.getElementById("bgm");
const toggleBtn = document.getElementById("toggleMusic");

toggleBtn.addEventListener("click", () => {
  if (bgm.paused) {
    bgm.play();
    toggleBtn.textContent = "🎵 暫停音樂";
  } else {
    bgm.pause();
    toggleBtn.textContent = "🎶 播放音樂";
  }
});

window.addEventListener("click", () => {
  if (bgm.paused) {
    bgm.play().catch(err => {
      console.log("音樂播放失敗：", err);
    });
  }
}, { once: true });
