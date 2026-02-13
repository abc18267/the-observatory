/**
 * Nebula Painter mini-game.
 * Freeform drawing on a 400x600 canvas.
 * Brush leaves glowing trail with varying colors.
 * Moving mouse faster creates wider strokes.
 * Colors shift based on position (HSL based on x/y).
 * After 20 seconds, game ends and painting is scored based on coverage.
 */

export function init(
  canvas: HTMLCanvasElement,
  onComplete: (score: number) => void,
): () => void {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;

  let running = true;
  let animId = 0;
  let timeLeft = 20;
  let lastTime = 0;
  let isDrawing = false;
  let gameEnded = false;

  // Track mouse positions
  let prevX = -1;
  let prevY = -1;

  // Coverage tracking - divide canvas into a grid
  const GRID = 20;
  const gridCols = Math.ceil(W / GRID);
  const gridRows = Math.ceil(H / GRID);
  const coverageGrid = new Uint8Array(gridCols * gridRows);

  // Painting layer (separate canvas for the artwork)
  const paintCanvas = document.createElement('canvas');
  paintCanvas.width = W;
  paintCanvas.height = H;
  const paintCtx = paintCanvas.getContext('2d')!;

  // Start with a dark transparent background
  paintCtx.fillStyle = 'rgba(6, 6, 18, 0)';
  paintCtx.clearRect(0, 0, W, H);

  let countdownInterval = setInterval(() => {
    timeLeft -= 1;
    if (timeLeft <= 0 && !gameEnded) {
      endGame();
    }
  }, 1000);

  function getCoords(e: MouseEvent | TouchEvent): { x: number; y: number } | null {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function markCoverage(x: number, y: number, radius: number) {
    const minCol = Math.max(0, Math.floor((x - radius) / GRID));
    const maxCol = Math.min(gridCols - 1, Math.floor((x + radius) / GRID));
    const minRow = Math.max(0, Math.floor((y - radius) / GRID));
    const maxRow = Math.min(gridRows - 1, Math.floor((y + radius) / GRID));

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        coverageGrid[r * gridCols + c] = 1;
      }
    }
  }

  function paintStroke(x: number, y: number, px: number, py: number) {
    if (gameEnded) return;

    const dx = x - px;
    const dy = y - py;
    const speed = Math.sqrt(dx * dx + dy * dy);

    // Width based on speed
    const baseWidth = 4;
    const maxWidth = 30;
    const width = Math.min(maxWidth, baseWidth + speed * 0.3);

    // Color based on position
    const hue = (x / W) * 360;
    const saturation = 70 + (y / H) * 30;
    const lightness = 50 + Math.sin(x * 0.02) * 15;

    // Draw the glowing stroke
    paintCtx.lineCap = 'round';
    paintCtx.lineJoin = 'round';

    // Outer glow
    paintCtx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.15)`;
    paintCtx.lineWidth = width * 3;
    paintCtx.beginPath();
    paintCtx.moveTo(px, py);
    paintCtx.lineTo(x, y);
    paintCtx.stroke();

    // Middle glow
    paintCtx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness + 10}%, 0.4)`;
    paintCtx.lineWidth = width * 1.5;
    paintCtx.beginPath();
    paintCtx.moveTo(px, py);
    paintCtx.lineTo(x, y);
    paintCtx.stroke();

    // Core stroke
    paintCtx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 0.8)`;
    paintCtx.lineWidth = width;
    paintCtx.beginPath();
    paintCtx.moveTo(px, py);
    paintCtx.lineTo(x, y);
    paintCtx.stroke();

    markCoverage(x, y, width * 1.5);
  }

  function handleDown(e: MouseEvent | TouchEvent) {
    if (gameEnded) return;
    e.preventDefault();
    isDrawing = true;
    const pos = getCoords(e);
    if (pos) {
      prevX = pos.x;
      prevY = pos.y;
    }
  }

  function handleMove(e: MouseEvent | TouchEvent) {
    if (!isDrawing || gameEnded) return;
    e.preventDefault();
    const pos = getCoords(e);
    if (!pos) return;

    if (prevX >= 0 && prevY >= 0) {
      paintStroke(pos.x, pos.y, prevX, prevY);
    }
    prevX = pos.x;
    prevY = pos.y;
  }

  function handleUp() {
    isDrawing = false;
    prevX = -1;
    prevY = -1;
  }

  canvas.addEventListener('mousedown', handleDown);
  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('mouseup', handleUp);
  canvas.addEventListener('mouseleave', handleUp);
  canvas.addEventListener('touchstart', handleDown, { passive: false });
  canvas.addEventListener('touchmove', handleMove, { passive: false });
  canvas.addEventListener('touchend', handleUp);

  function calculateCoverage(): number {
    let filled = 0;
    const total = coverageGrid.length;
    for (let i = 0; i < total; i++) {
      if (coverageGrid[i]) filled++;
    }
    return Math.round((filled / total) * 100);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Dark background
    ctx.fillStyle = '#060612';
    ctx.fillRect(0, 0, W, H);

    // Draw the painting
    ctx.drawImage(paintCanvas, 0, 0);

    // HUD background strip
    ctx.fillStyle = 'rgba(6, 6, 18, 0.7)';
    ctx.fillRect(0, 0, W, 40);

    ctx.fillStyle = '#c9d1d9';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Time: ${timeLeft}s`, 12, 26);

    const coverage = calculateCoverage();
    ctx.textAlign = 'right';
    ctx.fillText(`Coverage: ${coverage}%`, W - 12, 26);

    if (!gameEnded) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#8b949e';
      ctx.font = '12px monospace';
      ctx.fillText('Draw with your mouse or finger', W / 2, H - 16);
    }
  }

  function endGame() {
    gameEnded = true;
    clearInterval(countdownInterval);

    const coverage = calculateCoverage();
    const score = coverage;

    // Draw final overlay
    setTimeout(() => {
      if (!running) return;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#060612';
      ctx.fillRect(0, 0, W, H);

      // Show the painting underneath
      ctx.globalAlpha = 0.5;
      ctx.drawImage(paintCanvas, 0, 0);
      ctx.globalAlpha = 1;

      // Overlay text
      ctx.fillStyle = 'rgba(6, 6, 18, 0.6)';
      ctx.fillRect(0, H / 2 - 80, W, 160);

      ctx.fillStyle = '#c9d1d9';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Nebula Created!', W / 2, H / 2 - 30);
      ctx.font = '20px monospace';
      ctx.fillText(`Coverage: ${coverage}%`, W / 2, H / 2 + 10);
      ctx.font = '14px monospace';
      ctx.fillStyle = '#8b949e';
      ctx.fillText('Click anywhere to close', W / 2, H / 2 + 50);

      onComplete(score);
    }, 300);
  }

  function loop(timestamp: number) {
    if (!running) return;

    if (lastTime === 0) lastTime = timestamp;
    lastTime = timestamp;

    if (!gameEnded) {
      draw();
    }

    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);

  return () => {
    running = false;
    clearInterval(countdownInterval);
    cancelAnimationFrame(animId);
    canvas.removeEventListener('mousedown', handleDown);
    canvas.removeEventListener('mousemove', handleMove);
    canvas.removeEventListener('mouseup', handleUp);
    canvas.removeEventListener('mouseleave', handleUp);
    canvas.removeEventListener('touchstart', handleDown);
    canvas.removeEventListener('touchmove', handleMove);
    canvas.removeEventListener('touchend', handleUp);
  };
}
