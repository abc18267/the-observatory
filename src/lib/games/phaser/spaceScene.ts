/// <reference types="phaser" />

/**
 * Phaser Space Scene.
 * Top-down space exploration with a small ship.
 * WASD/arrow key movement. Procedural star background.
 * 3 planets at fixed positions. Fly to a planet to visit it.
 */

interface PlanetData {
  x: number;
  y: number;
  texture: string;
  name: string;
  visited: boolean;
}

export default class SpaceScene extends Phaser.Scene {
  private ship!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private stars: Phaser.GameObjects.Rectangle[] = [];
  private planets: PlanetData[] = [];
  private planetSprites: Phaser.GameObjects.Sprite[] = [];
  private planetLabels: Phaser.GameObjects.Text[] = [];
  private velocityX = 0;
  private velocityY = 0;
  private readonly THRUST = 300;
  private readonly DRAG = 0.97;
  private readonly MAX_SPEED = 250;
  private artifactsCollected: string[] = [];
  private hudText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'SpaceScene' });
  }

  init(data?: { collected?: string[] }) {
    if (data?.collected) {
      this.artifactsCollected = data.collected;
    }
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create starfield background
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() < 0.2 ? 2 : 1;
      const alpha = 0.2 + Math.random() * 0.6;
      const star = this.add.rectangle(x, y, size, size, 0xffffff, alpha);
      this.stars.push(star);
    }

    // Define planet positions
    this.planets = [
      { x: 200, y: 150, texture: 'planet_red', name: 'Pyros', visited: false },
      { x: 600, y: 300, texture: 'planet_blue', name: 'Aqueon', visited: false },
      { x: 350, y: 480, texture: 'planet_green', name: 'Verdant', visited: false },
    ];

    // Mark already-visited planets
    for (const p of this.planets) {
      if (this.artifactsCollected.includes(p.name)) {
        p.visited = true;
      }
    }

    // Create planet sprites
    this.planetSprites = [];
    this.planetLabels = [];

    for (const p of this.planets) {
      const sprite = this.add.sprite(p.x, p.y, p.texture);
      sprite.setScale(2);
      sprite.setAlpha(p.visited ? 0.5 : 1);

      // Pulsing animation
      if (!p.visited) {
        this.tweens.add({
          targets: sprite,
          scaleX: 2.15,
          scaleY: 2.15,
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }

      this.planetSprites.push(sprite);

      // Planet label
      const label = this.add.text(p.x, p.y + 40, p.visited ? `${p.name} (visited)` : p.name, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: p.visited ? '#666688' : '#c9d1d9',
      }).setOrigin(0.5);
      this.planetLabels.push(label);
    }

    // Create ship at center
    this.ship = this.add.sprite(width / 2, height / 2, 'ship');
    this.ship.setScale(1.2);

    // Engine glow effect
    const glow = this.add.circle(0, 0, 20, 0x4488ff, 0.15);
    glow.setPosition(this.ship.x, this.ship.y);
    this.data.set('glow', glow);

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // HUD
    const collected = this.artifactsCollected.length;
    this.hudText = this.add.text(12, 12, `Artifacts: ${collected}/3`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#c9b8ff',
    });

    // Instructions
    this.add.text(width / 2, height - 16, 'WASD or Arrow Keys to fly. Approach a planet to land.', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#8b949e',
    }).setOrigin(0.5);

    // Check if all artifacts collected
    if (this.artifactsCollected.length >= 3) {
      this.time.delayedCall(500, () => {
        this.scene.start('EndScene', { collected: this.artifactsCollected });
      });
    }
  }

  update(_time: number, delta: number) {
    if (!this.cursors || !this.wasd) return;

    const dt = delta / 1000;

    // Input
    let ax = 0;
    let ay = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) ax -= this.THRUST;
    if (this.cursors.right.isDown || this.wasd.right.isDown) ax += this.THRUST;
    if (this.cursors.up.isDown || this.wasd.up.isDown) ay -= this.THRUST;
    if (this.cursors.down.isDown || this.wasd.down.isDown) ay += this.THRUST;

    // Apply acceleration
    this.velocityX += ax * dt;
    this.velocityY += ay * dt;

    // Apply drag
    this.velocityX *= this.DRAG;
    this.velocityY *= this.DRAG;

    // Clamp speed
    const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    if (speed > this.MAX_SPEED) {
      const scale = this.MAX_SPEED / speed;
      this.velocityX *= scale;
      this.velocityY *= scale;
    }

    // Move ship
    this.ship.x += this.velocityX * dt;
    this.ship.y += this.velocityY * dt;

    // Wrap around screen
    const { width, height } = this.cameras.main;
    if (this.ship.x < -20) this.ship.x = width + 20;
    if (this.ship.x > width + 20) this.ship.x = -20;
    if (this.ship.y < -20) this.ship.y = height + 20;
    if (this.ship.y > height + 20) this.ship.y = -20;

    // Rotate ship toward movement direction
    if (speed > 5) {
      const angle = Math.atan2(this.velocityY, this.velocityX) + Math.PI / 2;
      this.ship.rotation = angle;
    }

    // Update glow position
    const glow = this.data.get('glow') as Phaser.GameObjects.Arc;
    if (glow) {
      glow.setPosition(this.ship.x, this.ship.y);
      glow.setAlpha(speed > 10 ? 0.15 + (speed / this.MAX_SPEED) * 0.2 : 0.1);
    }

    // Check planet proximity
    for (let i = 0; i < this.planets.length; i++) {
      const p = this.planets[i];
      if (p.visited) continue;

      const dx = this.ship.x - p.x;
      const dy = this.ship.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 50) {
        this.scene.start('PlanetScene', {
          planetName: p.name,
          planetIndex: i,
          collected: [...this.artifactsCollected],
        });
        return;
      }
    }
  }
}
