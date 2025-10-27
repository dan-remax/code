const cloudContainer = document.getElementById('cloud-container');
const cloudImages = ['img/webp/1.webp', 'img/webp/2.webp', 'img/webp/3.webp', 'img/webp/4.webp', 'img/webp/5.webp',
  'img/webp/6.webp', 'img/webp/7.webp', 'img/webp/8.webp', 'img/webp/9.webp', 'img/webp/10.webp',
  'img/webp/11.webp', 'img/webp/12.webp'];

function spawnCloud(initial = false) {
  const cloud = document.createElement('img');
  cloud.src = cloudImages[Math.floor(Math.random() * cloudImages.length)];
  cloud.className = 'cloud';

  const leftHalf = Math.random() < 0.5;
  const left = leftHalf
    ? Math.random() * (window.innerWidth / 2) - (window.innerWidth * 2 / 3)
    : Math.random() * (window.innerWidth / 2) + (window.innerWidth / 3);

  const topPct = 20 + Math.random() * 80; 
  cloud.style.setProperty('--top', `${topPct}%`);
  cloud.style.setProperty('--left', `${left}px`);

  // Depth: farther away starts more negative Z
  const zStart = -2000 + Math.random() * 1000; 
  cloud.style.setProperty('--z-start', `${zStart}px`);

  // Slight drift across flight so paths aren't dead straight
  const driftX = (Math.random() - 0.5) * 400; 
  cloud.style.setProperty('--drift-x', `${driftX}px`);

  // Duration scales a bit with depth so farther clouds take longer
  const baseDuration = 12;              // seconds
  const depthFactor = 1 + (Math.abs(zStart) / 2000) * 0.5; // 1..1.5x
  const duration = (baseDuration + Math.random() * 4) * depthFactor;
  cloud.style.setProperty('--duration', `${duration.toFixed(2)}s`);

  // Random stagger and opacity peak
  const delay = initial ? -Math.random() * 10 : 0;
  cloud.style.setProperty('--delay', `${delay}s`);
  const opacityPeak = 0.5 + Math.random() * 0.2;
  cloud.style.setProperty('--opacity-peak', opacityPeak.toFixed(2));
  
  cloud.style.width = `${window.innerWidth}px`;
  
  cloudContainer.appendChild(cloud);
  
  const life = Math.max(0, duration + Math.max(0, delay) + 1) * 1000;
  setTimeout(() => cloud.remove(), life);
}

// Spawn initial clouds
for (let i = 0; i < 12; i++) {
  spawnCloud(true);
}

// Loop clouds
setInterval(spawnCloud, 1000);