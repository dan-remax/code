const cloudContainer = document.getElementById('cloud-container');
const cloudImages = [
  'img/webp/1.webp','img/webp/2.webp','img/webp/3.webp','img/webp/4.webp',
  'img/webp/5.webp','img/webp/6.webp','img/webp/7.webp','img/webp/8.webp',
  'img/webp/9.webp','img/webp/10.webp','img/webp/11.webp','img/webp/12.webp'
];

function spawnCloud(initial = false) {
  const cloud = document.createElement('img');
  cloud.src = cloudImages[Math.floor(Math.random() * cloudImages.length)];
  cloud.className = 'cloud';
  cloud.decoding = 'async';
  cloud.loading = 'lazy';

  // Left vs right start
  const leftHalf = Math.random() < 0.5;
  const leftPct = leftHalf
    ? Math.random() * 50 - 75 // start between -67% and -17%
    : Math.random() * 50 + 50; // start between 33% and 83%

  // Vertical placement
  const topPct = 20 + Math.random() * 80;
  cloud.style.setProperty('--top', `${topPct}%`);
  cloud.style.setProperty('--left', `${leftPct}%`);

  // Depth & drift
  const zStart = -2000 + Math.random() * 1000;
  cloud.style.setProperty('width', `100%`);
  cloud.style.setProperty('--z-start', `${zStart}px`);
  const driftXPct = (Math.random() - 0.5) * 20;
  cloud.style.setProperty('--drift-x', `${driftXPct}%`);

  // Duration scaled by depth
  const baseDuration = 12; // seconds
  const depthFactor = 1 + (Math.abs(zStart) / 2000) * 0.5; // 1..1.5x
  const duration = (baseDuration + Math.random() * 4) * depthFactor;
  cloud.style.setProperty('--duration', `${duration.toFixed(2)}s`);

  // Delay & opacity
  const delay = initial ? -Math.random() * 10 : 0;
  cloud.style.setProperty('--delay', `${delay}s`);
  const opacityPeak = 0.3 + Math.random() * 0.5;
  cloud.style.setProperty('--opacity-peak', opacityPeak.toFixed(2));

  cloudContainer.appendChild(cloud);

  // Clean up when the animation actually ends
  const onDone = () => {
    cloud.removeEventListener('animationend', onDone);
    cloud.removeEventListener('animationcancel', onDone);
    cloud.remove();
  };
  cloud.addEventListener('animationend', onDone);
  cloud.addEventListener('animationcancel', onDone);
}

// RAF scheduler (pauses when hidden)
let rafId = null;
let last = 0;
let accumulator = 0;
const spawnEveryMs = 1000;

function tick(ts) {
  if (!last) last = ts;
  const dt = ts - last;
  last = ts;
  accumulator += dt;

  while (accumulator >= spawnEveryMs) {
    spawnCloud();
    accumulator -= spawnEveryMs;
  }
  rafId = requestAnimationFrame(tick);
}

function start() {
  if (rafId != null) return;    // already running
  last = 0;                     // reset time base to avoid jumps
  rafId = requestAnimationFrame(tick);
}

function stop() {
  if (rafId == null) return;
  cancelAnimationFrame(rafId);
  rafId = null;
}

// Initial burst + start
function seedInitial() {
  for (let i = 0; i < 16; i++) spawnCloud(true);
}
seedInitial();
start();

// Smooth pause/resume on visibility changes
function pauseVisuals() {
  cloudContainer.classList.add('paused'); // pauses CSS animations
  stop();                                  // stops spawning
}
function resumeVisuals() {
  cloudContainer.classList.remove('paused'); // resumes CSS animations
  start();                                   // resumes spawning
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pauseVisuals();
  } else {
    resumeVisuals();
  }
});

// (Optional) Better lifecycle on Safari / bfcache
window.addEventListener('pagehide', pauseVisuals);
window.addEventListener('pageshow', resumeVisuals);
