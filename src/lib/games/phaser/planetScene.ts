/// <reference types="phaser" />

/**
 * Phaser Planet Scene.
 * Side-view of a planet surface.
 * Character walks left/right with arrow keys.
 * Simple terrain with hills (drawn with graphics).
 * A glowing artifact on each planet.
 * Walking to artifact collects it and returns to SpaceScene.
 */

export default class PlanetScene extends Phaser.Scene {
  private character!: Phaser.GameObjects.Sprite;
  private artifact!: Phaser.GameObjects.Sprite;
  private artifactGlow!: Phaser.GameObjects.Arc;
  private ground!: Phaser.GameObjects.Graphics;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private planetName = '';
  private planetIndex = 0;
  private collected: string[] = [];
  private charX = 100;
  private charY = 0;
  private charVY = 0;
  private onGround = false;
  private facingRight = true;
  private readonly GRAVITY = 600;
  private readonly MOVE_SPEED = 180;
  private readonly JUMP_VEL = -320;
  private terrainPoints: { x: number; y: number }[] = [];
  private artifactCollected = false;
  private readonly WORLD_WIDTH = 1200;

  constructor() {
    super({ key: 'PlanetScene' });
  }

  init(data: { planetName: string; planetIndex: number; collected: string[] }) {
    this.planetName = data.planetName;
    this.planetIndex = data.planetIndex;
    this.collected = data.collected || [];
    this.artifactCollected = false;
    this.charX = 100;
    this.charVY = 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Sky gradient (different color per planet)
    const skyColors: Record<string, number[]> = {
      Pyros: [0x1a0505, 0x3a1010],
      Aqueon: [0x050510, 0x101830],
      Verdant: [0x051005, 0x103018],
    };

    const colors = skyColors[this.planetName] || [0x060612, 0x101025];
    const sky = this.add.graphics();
    sky.fillGradientStyle(colors[0], colors[0], colors[1], colors[1], 1);
    sky.fillRect(0, 0, width, height);

    // Small stars in the sky
    for (let i = 0; i < 40; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * (height * 0.5);
      const alpha = 0.2 + Math.random() * 0.5;
      this.add.rectangle(sx, sy, 1, 1, 0xffffff, alpha);
    }

    // Planet label
    this.add.text(width / 2, 20, `Planet ${this.planetName}`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#c9d1d9',
    }).setOrigin(0.5);

    // Generate terrain
    this.generateTerrain();

    // Draw terrain
    this.ground = this.add.graphics();
    this.drawTerrain();

    // Place artifact at a position along the terrain
    const artifactTerrainX = this.WORLD_WIDTH * 0.75;
    const artifactTerrainY = this.getTerrainY(artifactTerrainX);

    // Artifact glow
    this.artifactGlow = this.add.circle(artifactTerrainX, artifactTerrainY - 30, 25, 0xffdd44, 0.2);
    this.tweens.add({
      targets: this.artifactGlow,
      alpha: 0.05,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Artifact sprite
    this.artifact = this.add.sprite(artifactTerrainX, artifactTerrainY - 30, 'artifact');
    this.artifact.setScale(1.5);
    this.tweens.add({
      targets: this.artifact,
      y: artifactTerrainY - 40,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Character
    const startY = this.getTerrainY(this.charX);
    this.charY = startY - 16;
    this.character = this.add.sprite(this.charX, this.charY, 'character');
    this.character.setScale(1.2);

    // Camera follows character
    this.cameras.main.startFollow(this.character, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, height);

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      };
    }

    // Instructions
    const instrText = this.add.text(width / 2, height - 16, 'Arrow keys or WASD to move. Find the artifact!', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#8b949e',
    }).setOrigin(0.5);
    instrText.setScrollFactor(0);

    // Back button
    const backBtn = this.add.text(12, height - 16, '< Back to space', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#8b949e',
    }).setInteractive({ useHandCursor: true }).setScrollFactor(0);

    backBtn.on('pointerover', () => backBtn.setColor('#c9d1d9'));
    backBtn.on('pointerout', () => backBtn.setColor('#8b949e'));
    backBtn.on('pointerdown', () => {
      this.scene.start('SpaceScene', { collected: this.collected });
    });
  }

  generateTerrain() {
    this.terrainPoints = [];
    const segments = 40;
    const segWidth = this.WORLD_WIDTH / segments;

    for (let i = 0; i <= segments; i++) {
      const x = i * segWidth;
      // Base height with some hills
      let y = 480;
      // Add hills using sine waves
      y -= Math.sin(i * 0.3) * 30;
      y -= Math.sin(i * 0.7 + 2) * 20;
      y -= Math.sin(i * 0.15) * 40;

      // Add a bigger hill in the middle
      const midDist = Math.abs(i - segments / 2) / (segments / 2);
      y -= Math.max(0, (1 - midDist * 2)) * 50;

      this.terrainPoints.push({ x, y });
    }
  }

  getTerrainY(x: number): number {
    // Interpolate terrain height at x
    for (let i = 0; i < this.terrainPoints.length - 1; i++) {
      const p1 = this.terrainPoints[i];
      const p2 = this.terrainPoints[i + 1];
      if (x >= p1.x && x <= p2.x) {
        const t = (x - p1.x) / (p2.x - p1.x);
        return p1.y + (p2.y - p1.y) * t;
      }
    }
    return 480;
  }

  drawTerrain() {
    const { height } = this.cameras.main;
    const groundColors: Record<string, number> = {
      Pyros: 0x553322,
      Aqueon: 0x223355,
      Verdant: 0x225533,
    };
    const color = groundColors[this.planetName] || 0x333355;

    this.ground.clear();
    this.ground.fillStyle(color, 1);

    this.ground.beginPath();
    this.ground.moveTo(0, height);

    for (const p of this.terrainPoints) {
      this.ground.lineTo(p.x, p.y);
    }

    this.ground.lineTo(this.WORLD_WIDTH, height);
    this.ground.closePath();
    this.ground.fillPath();

    // Surface highlight
    this.ground.lineStyle(2, 0xffffff, 0.1);
    this.ground.beginPath();
    for (let i = 0; i < this.terrainPoints.length; i++) {
      const p = this.terrainPoints[i];
      if (i === 0) {
        this.ground.moveTo(p.x, p.y);
      } else {
        this.ground.lineTo(p.x, p.y);
      }
    }
    this.ground.strokePath();
  }

  update(_time: number, delta: number) {
    if (!this.cursors || !this.wasd || this.artifactCollected) return;

    const dt = delta / 1000;

    // Horizontal movement
    let moveX = 0;
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      moveX = -this.MOVE_SPEED;
      this.facingRight = false;
    }
    if (this.cursors.right.isDown || this.wasd.right.isDown) {
      moveX = this.MOVE_SPEED;
      this.facingRight = true;
    }

    // Jump
    if ((this.cursors.up.isDown || this.wasd.up.isDown) && this.onGround) {
      this.charVY = this.JUMP_VEL;
      this.onGround = false;
    }

    // Apply gravity
    this.charVY += this.GRAVITY * dt;
    this.charX += moveX * dt;
    this.charY += this.charVY * dt;

    // Clamp to world bounds
    this.charX = Math.max(12, Math.min(this.WORLD_WIDTH - 12, this.charX));

    // Check terrain collision
    const terrainY = this.getTerrainY(this.charX);
    const charBottom = this.charY + 16; // character is about 32px tall

    if (charBottom >= terrainY && this.charVY >= 0) {
      this.charY = terrainY - 16;
      this.charVY = 0;
      this.onGround = true;
    }

    // Update character sprite
    this.character.setPosition(this.charX, this.charY);
    this.character.setFlipX(!this.facingRight);

    // Check artifact collision
    if (!this.artifactCollected) {
      const dx = this.charX - this.artifact.x;
      const dy = this.charY - this.artifact.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 40) {
        this.collectArtifact();
      }
    }
  }

  collectArtifact() {
    this.artifactCollected = true;

    // Visual feedback
    this.tweens.add({
      targets: [this.artifact, this.artifactGlow],
      alpha: 0,
      scaleX: 3,
      scaleY: 3,
      duration: 500,
      ease: 'Power2',
    });

    // Add to collected list
    if (!this.collected.includes(this.planetName)) {
      this.collected.push(this.planetName);
    }

    // Show collection message
    const { width, height } = this.cameras.main;
    const msg = this.add.text(width / 2, height / 2 - 40, `${this.planetName} artifact collected!`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffdd44',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0);

    const subMsg = this.add.text(width / 2, height / 2, `${this.collected.length}/3 artifacts found`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#c9d1d9',
    }).setOrigin(0.5).setScrollFactor(0);

    // Return to space after a delay
    this.time.delayedCall(2000, () => {
      this.scene.start('SpaceScene', { collected: this.collected });
    });
  }
}
