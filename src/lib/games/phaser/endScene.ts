/// <reference types="phaser" />

/**
 * Phaser End Scene.
 * Congratulations screen shown after collecting all 3 artifacts.
 * Calls addDiscovery to record the achievement.
 * Button to close and return to the site.
 */

export default class EndScene extends Phaser.Scene {
  private collected: string[] = [];

  constructor() {
    super({ key: 'EndScene' });
  }

  init(data: { collected: string[] }) {
    this.collected = data.collected || [];
  }

  async create() {
    const { width, height } = this.cameras.main;

    // Background with subtle particle effect
    this.cameras.main.setBackgroundColor(0x060612);

    // Stars
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() < 0.15 ? 2 : 1;
      const alpha = 0.2 + Math.random() * 0.6;
      const star = this.add.rectangle(x, y, size, size, 0xffffff, alpha);

      // Twinkle
      this.tweens.add({
        targets: star,
        alpha: alpha * 0.3,
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000,
      });
    }

    // Title
    const titleText = this.add.text(width / 2, 80, 'You found everything.', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffdd44',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      y: 70,
      duration: 1000,
      ease: 'Power2',
    });

    // Subtitle
    const subText = this.add.text(width / 2, 110, 'All artifacts have been collected.', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#c9d1d9',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: subText,
      alpha: 1,
      duration: 1000,
      delay: 500,
    });

    // Display collected artifacts
    const artifactColors: Record<string, number> = {
      Pyros: 0xff6644,
      Aqueon: 0x44bbff,
      Verdant: 0x66ff88,
    };

    const startY = 200;
    const spacing = 120;
    const startX = width / 2 - ((this.collected.length - 1) * spacing) / 2;

    for (let i = 0; i < this.collected.length; i++) {
      const name = this.collected[i];
      const x = startX + i * spacing;
      const color = artifactColors[name] || 0xffffff;

      // Artifact display (glowing circle)
      const glow = this.add.circle(x, startY, 35, color, 0.15);
      this.tweens.add({
        targets: glow,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: 0.05,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        delay: i * 200,
      });

      const artifactIcon = this.add.sprite(x, startY, 'artifact');
      artifactIcon.setScale(2);
      artifactIcon.setTint(color);
      artifactIcon.setAlpha(0);

      this.tweens.add({
        targets: artifactIcon,
        alpha: 1,
        scaleX: 2.5,
        scaleY: 2.5,
        duration: 800,
        delay: 800 + i * 300,
        ease: 'Back.easeOut',
      });

      // Planet name label
      const label = this.add.text(x, startY + 50, name, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#c9d1d9',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: label,
        alpha: 1,
        duration: 600,
        delay: 1100 + i * 300,
      });
    }

    // Congratulations message
    const congrats = this.add.text(width / 2, 340, 'The observatory remembers your journey.', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#8b949e',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: congrats,
      alpha: 1,
      duration: 1000,
      delay: 2000,
    });

    // Close button
    const btnBg = this.add.rectangle(width / 2, 420, 200, 40, 0x9966ff, 0.2);
    btnBg.setStrokeStyle(1, 0x9966ff, 0.5);
    btnBg.setAlpha(0);
    btnBg.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(width / 2, 420, 'Return to Observatory', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#c9b8ff',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [btnBg, btnText],
      alpha: 1,
      duration: 800,
      delay: 2500,
    });

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x9966ff, 0.35);
    });

    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x9966ff, 0.2);
    });

    btnBg.on('pointerdown', () => {
      // Dispatch close event so the Svelte wrapper can destroy Phaser
      window.dispatchEvent(new CustomEvent('observatory:game-close'));
    });

    // Record the discovery
    try {
      const { addDiscovery } = await import('../../../lib/discovery/store');
      addDiscovery('game:deep-complete', 'meta', 'Completed the deep game');
    } catch {
      // Discovery store not available (shouldn't happen but play it safe)
    }
  }
}
