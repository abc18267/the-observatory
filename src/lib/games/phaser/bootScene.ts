/// <reference types="phaser" />

/**
 * Phaser Boot Scene.
 * Shows a loading bar and transitions to SpaceScene.
 * All assets are generated programmatically (no external files).
 */

export default class BootScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // Loading bar background
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x222244, 0.8);
    this.loadingBar.fillRoundedRect(centerX - 160, centerY - 12, 320, 24, 6);

    // Progress bar
    this.progressBar = this.add.graphics();

    // Title text
    this.add.text(centerX, centerY - 50, 'Deep Space Observatory', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#c9b8ff',
    }).setOrigin(0.5);

    // Loading text
    this.add.text(centerX, centerY + 30, 'Initializing...', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#8b949e',
    }).setOrigin(0.5);

    // Listen for progress
    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0x9966ff, 1);
      this.progressBar.fillRoundedRect(
        centerX - 156,
        centerY - 8,
        312 * value,
        16,
        4,
      );
    });

    // Generate textures programmatically
    this.generateTextures();
  }

  generateTextures() {
    // Ship texture (small triangle)
    const shipGraphics = this.make.graphics({ x: 0, y: 0 });
    shipGraphics.fillStyle(0x88ccff, 1);
    shipGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    // Cockpit
    shipGraphics.fillStyle(0xaaddff, 1);
    shipGraphics.fillCircle(16, 16, 5);
    shipGraphics.generateTexture('ship', 32, 32);
    shipGraphics.destroy();

    // Planet textures (3 colored circles)
    const planetColors = [0xff6644, 0x44bbff, 0x66ff88];
    const planetNames = ['planet_red', 'planet_blue', 'planet_green'];

    for (let i = 0; i < 3; i++) {
      const pg = this.make.graphics({ x: 0, y: 0 });
      pg.fillStyle(planetColors[i], 1);
      pg.fillCircle(24, 24, 24);
      // Add a subtle ring/highlight
      pg.lineStyle(2, 0xffffff, 0.3);
      pg.strokeCircle(24, 24, 24);
      pg.fillStyle(0xffffff, 0.15);
      pg.fillCircle(18, 18, 8);
      pg.generateTexture(planetNames[i], 48, 48);
      pg.destroy();
    }

    // Artifact texture (glowing diamond shape)
    const ag = this.make.graphics({ x: 0, y: 0 });
    ag.fillStyle(0xffdd44, 1);
    ag.fillTriangle(12, 0, 0, 12, 12, 24);
    ag.fillTriangle(12, 0, 24, 12, 12, 24);
    ag.fillStyle(0xffffff, 0.5);
    ag.fillTriangle(12, 4, 4, 12, 12, 20);
    ag.generateTexture('artifact', 24, 24);
    ag.destroy();

    // Character texture (small humanoid blob)
    const cg = this.make.graphics({ x: 0, y: 0 });
    // Body
    cg.fillStyle(0x88ccff, 1);
    cg.fillRoundedRect(4, 8, 16, 20, 4);
    // Head
    cg.fillCircle(12, 6, 6);
    // Visor
    cg.fillStyle(0xaaddff, 1);
    cg.fillCircle(14, 5, 3);
    cg.generateTexture('character', 24, 32);
    cg.destroy();

    // Star particle
    const sg = this.make.graphics({ x: 0, y: 0 });
    sg.fillStyle(0xffffff, 1);
    sg.fillCircle(2, 2, 2);
    sg.generateTexture('star_particle', 4, 4);
    sg.destroy();
  }

  create() {
    // Brief delay before transitioning so the loading is visible
    this.time.delayedCall(600, () => {
      this.scene.start('SpaceScene');
    });
  }
}
