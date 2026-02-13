/**
 * Star Catcher mini-game.
 * Stars fall from the top of a 400x600 canvas.
 * Click/tap stars before they fade out.
 * Score: number of stars caught in 30 seconds.
 * Speed increases over time.
 */

interface Star {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  hue: number;
}

export function init(
  canvas: HTMLCanvasElement,
  onComplete: (score: number) => void,
): () => void {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;

  let score = 0;
  let timeLeft = 30;
  let stars: Star[] = [];
  let animId = 0;
  let lastTime = 0;
  let spawnTimer = 0;
  let running = true;
  let countdownInterval: ReturnType<typeof setInterval>;

  // Start the 30-second countdown
  countdownInterval = setInterval(() => {
    timeLeft -= 1;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  function spawnStar() {
    const elapsed = 30 - timeLeft;
    const speedMult = 1 + elapsed * 0.05;

    stars.push({
      x: Math.random() * (W - 40) + 20,
      y: -10,
      radius: 8 + Math.random() * 8,
      speed: (60 + Math.random() * 60) * speedMult,
      opacity: 1,
      hue: Math.random() * 60 + 40, // gold-ish range
    });
  }

  function hitTest(star: Star, mx: number, my: number): boolean {
    const dx = star.x - mx;
    const dy = star.y - my;
    // Use a slightly generous hit radius
    const hitRadius = star.radius + 8;
    return dx * dx + dy * dy <= hitRadius * hitRadius;
  }

  function handleClick(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    let cx: number, cy: number;

    if ('touches' in e && e.touches.length > 0) {
      cx = e.touches[0].clientX - rect.left;
      cy = e.touches[0].clientY - rect.top;
    } else if ('clientX' in e) {
      cx = e.clientX - rect.left;
      cy = e.clientY - rect.top;
    } else {
      return;
    }

    // Scale coordinates if canvas is displayed at a different size
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = cx * scaleX;
    const my = cy * scaleY;

    for (let i = stars.length - 1; i >= 0; i--) {
      if (hitTest(stars[i], mx, my)) {
        // Create a small flash effect by setting opacity to 2 (will be clamped)
        stars.splice(i, 1);
        score += 1;
        break;
      }
    }
  }

  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('touchstart', handleClick, { passive: false });

  function update(dt: number) {
    // Spawn stars
    spawnTimer += dt;
    const elapsed = 30 - timeLeft;
    const spawnRate = Math.max(0.2, 0.6 - elapsed * 0.012);
    if (spawnTimer >= spawnRate) {
      spawnTimer -= spawnRate;
      spawnStar();
    }

    // Update star positions and fade
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.y += s.speed * dt;
      // Fade when near bottom
      if (s.y > H * 0.7) {
        s.opacity -= dt * 1.5;
      }
      // Remove if off screen or fully faded
      if (s.y > H + 20 || s.opacity <= 0) {
        stars.splice(i, 1);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#060612';
    ctx.fillRect(0, 0, W, H);

    // Draw stars
    for (const s of stars) {
      const alpha = Math.max(0, Math.min(1, s.opacity));

      // Outer glow
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * 2.5);
      grad.addColorStop(0, `hsla(${s.hue}, 100%, 80%, ${alpha * 0.6})`);
      grad.addColorStop(1, `hsla(${s.hue}, 100%, 60%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `hsla(${s.hue}, 100%, 90%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // HUD
    ctx.fillStyle = '#c9d1d9';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 12, 28);
    ctx.textAlign = 'right';
    ctx.fillText(`Time: ${timeLeft}s`, W - 12, 28);
  }

  function loop(timestamp: number) {
    if (!running) return;

    if (lastTime === 0) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    update(dt);
    draw();

    animId = requestAnimationFrame(loop);
  }

  function endGame() {
    running = false;
    clearInterval(countdownInterval);
    cancelAnimationFrame(animId);

    // Draw final screen
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#060612';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#c9d1d9';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Time\'s Up!', W / 2, H / 2 - 30);
    ctx.font = '20px monospace';
    ctx.fillText(`Stars caught: ${score}`, W / 2, H / 2 + 10);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#8b949e';
    ctx.fillText('Click anywhere to close', W / 2, H / 2 + 50);

    onComplete(score);
  }

  // Start the game loop
  animId = requestAnimationFrame(loop);

  // Return cleanup function
  return () => {
    running = false;
    clearInterval(countdownInterval);
    cancelAnimationFrame(animId);
    canvas.removeEventListener('click', handleClick);
    canvas.removeEventListener('touchstart', handleClick);
  };
}
