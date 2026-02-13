/**
 * Gravity Hop mini-game.
 * Side-scrolling platformer on a 400x600 canvas.
 * Small character (circle) hops between asteroid platforms.
 * Click/tap to jump. Platforms scroll left.
 * Score: distance traveled.
 * Game over when falling off screen.
 */

interface Platform {
  x: number;
  y: number;
  width: number;
}

export function init(
  canvas: HTMLCanvasElement,
  onComplete: (score: number) => void,
): () => void {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;

  let running = true;
  let animId = 0;
  let lastTime = 0;
  let gameOver = false;

  // Physics
  const GRAVITY = 900;
  const JUMP_VELOCITY = -420;
  const SCROLL_SPEED_BASE = 100;
  const SCROLL_ACCEL = 2; // Speed increases per second

  // Player
  let playerX = 80;
  let playerY = 400;
  let playerVY = 0;
  let playerRadius = 12;
  let onGround = false;

  // Score
  let distance = 0;
  let scrollSpeed = SCROLL_SPEED_BASE;

  // Platforms
  let platforms: Platform[] = [];

  // Generate initial platforms
  function initPlatforms() {
    platforms = [];
    // Starting platform (wide)
    platforms.push({ x: 30, y: 440, width: 120 });

    // Generate ahead
    let lastX = 150;
    let lastY = 440;

    for (let i = 0; i < 10; i++) {
      const gap = 80 + Math.random() * 60;
      const yShift = (Math.random() - 0.5) * 80;
      const newX = lastX + gap;
      const newY = Math.max(200, Math.min(520, lastY + yShift));
      const w = 60 + Math.random() * 60;

      platforms.push({ x: newX, y: newY, width: w });
      lastX = newX + w;
      lastY = newY;
    }
  }

  function spawnPlatform() {
    const last = platforms[platforms.length - 1];
    const gap = 80 + Math.random() * 80;
    const yShift = (Math.random() - 0.5) * 100;
    const newX = last.x + last.width + gap;
    const newY = Math.max(180, Math.min(530, last.y + yShift));
    const w = 50 + Math.random() * 70;

    platforms.push({ x: newX, y: newY, width: w });
  }

  function handleInput(e: MouseEvent | TouchEvent) {
    if (gameOver) return;
    e.preventDefault();

    if (onGround) {
      playerVY = JUMP_VELOCITY;
      onGround = false;
    }
  }

  canvas.addEventListener('click', handleInput);
  canvas.addEventListener('touchstart', handleInput, { passive: false });

  // Keyboard support
  function handleKey(e: KeyboardEvent) {
    if (gameOver) return;
    if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      if (onGround) {
        playerVY = JUMP_VELOCITY;
        onGround = false;
      }
    }
  }
  window.addEventListener('keydown', handleKey);

  function update(dt: number) {
    if (gameOver) return;

    // Increase scroll speed over time
    scrollSpeed += SCROLL_ACCEL * dt;
    distance += scrollSpeed * dt;

    // Scroll platforms left
    for (const p of platforms) {
      p.x -= scrollSpeed * dt;
    }

    // Remove platforms that go off the left edge
    while (platforms.length > 0 && platforms[0].x + platforms[0].width < -20) {
      platforms.shift();
    }

    // Spawn new platforms to keep screen filled
    while (platforms.length < 12) {
      spawnPlatform();
    }

    // Apply gravity
    playerVY += GRAVITY * dt;
    playerY += playerVY * dt;

    // Check platform collisions (only when falling)
    onGround = false;
    if (playerVY >= 0) {
      for (const p of platforms) {
        if (
          playerX + playerRadius > p.x &&
          playerX - playerRadius < p.x + p.width &&
          playerY + playerRadius >= p.y &&
          playerY + playerRadius <= p.y + 20
        ) {
          playerY = p.y - playerRadius;
          playerVY = 0;
          onGround = true;
          break;
        }
      }
    }

    // Game over if falling below the canvas
    if (playerY > H + 50) {
      endGame();
    }
  }

  function drawStarfield() {
    // Simple static starfield (using distance for parallax)
    ctx.fillStyle = '#ffffff';
    const seed = 42;
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137 + seed) % W + W - (distance * 0.1 * ((i % 3) + 1)) % W) % W;
      const sy = (i * 97 + seed * 3) % H;
      const size = (i % 3 === 0) ? 2 : 1;
      ctx.globalAlpha = 0.3 + (i % 5) * 0.1;
      ctx.fillRect(sx, sy, size, size);
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#060612';
    ctx.fillRect(0, 0, W, H);

    drawStarfield();

    // Draw platforms (asteroid-like)
    for (const p of platforms) {
      // Platform surface
      const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + 16);
      grad.addColorStop(0, '#555577');
      grad.addColorStop(1, '#333355');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y + 16);
      ctx.lineTo(p.x, p.y + 4);
      ctx.quadraticCurveTo(p.x + p.width * 0.3, p.y - 2, p.x + p.width * 0.5, p.y);
      ctx.quadraticCurveTo(p.x + p.width * 0.7, p.y - 2, p.x + p.width, p.y + 4);
      ctx.lineTo(p.x + p.width, p.y + 16);
      ctx.closePath();
      ctx.fill();

      // Top edge highlight
      ctx.strokeStyle = 'rgba(136, 192, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + 4);
      ctx.quadraticCurveTo(p.x + p.width * 0.3, p.y - 2, p.x + p.width * 0.5, p.y);
      ctx.quadraticCurveTo(p.x + p.width * 0.7, p.y - 2, p.x + p.width, p.y + 4);
      ctx.stroke();
    }

    // Draw player
    const glowGrad = ctx.createRadialGradient(
      playerX, playerY, 0,
      playerX, playerY, playerRadius * 3,
    );
    glowGrad.addColorStop(0, 'rgba(100, 200, 255, 0.3)');
    glowGrad.addColorStop(1, 'rgba(100, 200, 255, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(playerX, playerY, playerRadius * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#88ccff';
    ctx.beginPath();
    ctx.arc(playerX, playerY, playerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(playerX - 3, playerY - 3, playerRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // HUD
    ctx.fillStyle = '#c9d1d9';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Distance: ${Math.floor(distance)}`, 12, 28);

    if (gameOver) {
      // Darken
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#c9d1d9';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', W / 2, H / 2 - 30);
      ctx.font = '20px monospace';
      ctx.fillText(`Distance: ${Math.floor(distance)}`, W / 2, H / 2 + 10);
      ctx.font = '14px monospace';
      ctx.fillStyle = '#8b949e';
      ctx.fillText('Click anywhere to close', W / 2, H / 2 + 50);
    }
  }

  function endGame() {
    gameOver = true;
    onComplete(Math.floor(distance));
  }

  function loop(timestamp: number) {
    if (!running) return;

    if (lastTime === 0) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    update(dt);
    draw();

    animId = requestAnimationFrame(loop);
  }

  initPlatforms();
  animId = requestAnimationFrame(loop);

  return () => {
    running = false;
    cancelAnimationFrame(animId);
    canvas.removeEventListener('click', handleInput);
    canvas.removeEventListener('touchstart', handleInput);
    window.removeEventListener('keydown', handleKey);
  };
}
