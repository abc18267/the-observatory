/**
 * Signal Decoder mini-game.
 * Shows a sequence of colored dots (the "signal").
 * Player must click dots in the same order.
 * 5 rounds, sequence gets longer each round.
 */

interface Dot {
  x: number;
  y: number;
  radius: number;
  color: string;
  colorName: string;
  hue: number;
}

type Phase = 'showing' | 'input' | 'feedback' | 'done';

const COLORS = [
  { name: 'red', fill: '#ff4444', hue: 0 },
  { name: 'blue', fill: '#4488ff', hue: 220 },
  { name: 'green', fill: '#44dd44', hue: 120 },
  { name: 'yellow', fill: '#ffdd44', hue: 50 },
];

export function init(
  canvas: HTMLCanvasElement,
  onComplete: (score: number) => void,
): () => void {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;

  let running = true;
  let animId = 0;

  // Game state
  let round = 1;
  const maxRounds = 5;
  let score = 0;
  let phase: Phase = 'showing';
  let sequence: number[] = [];
  let playerInput: number[] = [];
  let showIndex = 0;
  let showTimer = 0;
  let feedbackTimer = 0;
  let feedbackCorrect = false;
  let lastTime = 0;

  // Layout: 4 dots in a 2x2 grid
  const dots: Dot[] = COLORS.map((c, i) => ({
    x: W * 0.3 + (i % 2) * (W * 0.4),
    y: H * 0.45 + Math.floor(i / 2) * (H * 0.2),
    radius: 40,
    color: c.fill,
    colorName: c.name,
    hue: c.hue,
  }));

  // Which dot is currently highlighted (-1 means none)
  let highlightDot = -1;

  function generateSequence() {
    const length = round + 2; // Round 1 = 3 dots, round 5 = 7 dots
    sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(Math.floor(Math.random() * 4));
    }
    showIndex = 0;
    showTimer = 0;
    playerInput = [];
    highlightDot = -1;
    phase = 'showing';
  }

  function hitTestDot(mx: number, my: number): number {
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const dx = d.x - mx;
      const dy = d.y - my;
      if (dx * dx + dy * dy <= (d.radius + 10) * (d.radius + 10)) {
        return i;
      }
    }
    return -1;
  }

  function handleClick(e: MouseEvent | TouchEvent) {
    if (phase !== 'input') return;
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

    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = cx * scaleX;
    const my = cy * scaleY;

    const hit = hitTestDot(mx, my);
    if (hit === -1) return;

    playerInput.push(hit);
    highlightDot = hit;

    // Flash highlight briefly
    setTimeout(() => {
      if (running) highlightDot = -1;
    }, 200);

    const idx = playerInput.length - 1;

    if (playerInput[idx] !== sequence[idx]) {
      // Wrong
      feedbackCorrect = false;
      feedbackTimer = 1.5;
      phase = 'feedback';
      return;
    }

    if (playerInput.length === sequence.length) {
      // Completed the round
      score += round * 10;
      feedbackCorrect = true;
      feedbackTimer = 1.2;
      phase = 'feedback';
    }
  }

  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('touchstart', handleClick, { passive: false });

  function update(dt: number) {
    if (phase === 'showing') {
      showTimer += dt;
      const interval = 0.7;
      if (showTimer >= interval) {
        showTimer -= interval;
        highlightDot = sequence[showIndex];
        showIndex += 1;

        // Clear highlight after a short time
        setTimeout(() => {
          if (running) highlightDot = -1;
        }, 350);

        if (showIndex >= sequence.length) {
          // Done showing, wait a beat then switch to input
          setTimeout(() => {
            if (running) phase = 'input';
          }, 600);
        }
      }
    }

    if (phase === 'feedback') {
      feedbackTimer -= dt;
      if (feedbackTimer <= 0) {
        if (feedbackCorrect) {
          round += 1;
          if (round > maxRounds) {
            phase = 'done';
            endGame();
            return;
          }
          generateSequence();
        } else {
          // Game over on wrong answer
          phase = 'done';
          endGame();
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#060612';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#c9d1d9';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Signal Decoder', W / 2, 30);

    // Round and score
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Round: ${round}/${maxRounds}`, 12, 60);
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, W - 12, 60);

    // Phase text
    ctx.textAlign = 'center';
    ctx.font = '14px monospace';
    ctx.fillStyle = '#8b949e';

    if (phase === 'showing') {
      ctx.fillText('Watch the sequence...', W / 2, 90);
    } else if (phase === 'input') {
      const remaining = sequence.length - playerInput.length;
      ctx.fillText(`Your turn! ${remaining} left`, W / 2, 90);
    } else if (phase === 'feedback') {
      ctx.fillStyle = feedbackCorrect ? '#44dd44' : '#ff4444';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(feedbackCorrect ? 'Correct!' : 'Wrong!', W / 2, 90);
    }

    // Draw dots
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const isHighlighted = highlightDot === i;
      const scale = isHighlighted ? 1.2 : 1;
      const r = d.radius * scale;

      // Glow when highlighted
      if (isHighlighted) {
        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r * 2);
        grad.addColorStop(0, `hsla(${d.hue}, 100%, 70%, 0.4)`);
        grad.addColorStop(1, `hsla(${d.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dot
      ctx.fillStyle = d.color;
      ctx.globalAlpha = phase === 'input' || isHighlighted ? 1 : 0.5;
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Border
      ctx.strokeStyle = isHighlighted ? '#ffffff' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isHighlighted ? 3 : 1;
      ctx.stroke();
    }

    // Sequence indicator (small circles at top showing progress)
    if (phase === 'input') {
      const indicatorY = 110;
      const totalW = sequence.length * 16;
      const startX = (W - totalW) / 2 + 8;

      for (let i = 0; i < sequence.length; i++) {
        const ix = startX + i * 16;
        ctx.beginPath();
        ctx.arc(ix, indicatorY, 5, 0, Math.PI * 2);
        if (i < playerInput.length) {
          ctx.fillStyle = COLORS[sequence[i]].fill;
          ctx.fill();
        } else {
          ctx.strokeStyle = '#444';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function endGame() {
    // Draw final screen
    setTimeout(() => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#060612';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#c9d1d9';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Signal Decoded!', W / 2, H / 2 - 30);
      ctx.font = '20px monospace';
      ctx.fillText(`Score: ${score}`, W / 2, H / 2 + 10);
      ctx.font = '14px monospace';
      ctx.fillStyle = '#8b949e';
      ctx.fillText(`Rounds completed: ${round > maxRounds ? maxRounds : round - 1}/${maxRounds}`, W / 2, H / 2 + 40);

      onComplete(score);
    }, 300);
  }

  function loop(timestamp: number) {
    if (!running) return;

    if (lastTime === 0) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (phase !== 'done') {
      update(dt);
    }
    draw();

    animId = requestAnimationFrame(loop);
  }

  // Start the first round
  generateSequence();
  animId = requestAnimationFrame(loop);

  return () => {
    running = false;
    cancelAnimationFrame(animId);
    canvas.removeEventListener('click', handleClick);
    canvas.removeEventListener('touchstart', handleClick);
  };
}
