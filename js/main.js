// js/main.js

var game;  // ensure global for button hookup

const gameOptions = {
  sliceTeams: [
    "Team Alpha", "Team Bravo", "Nicole", "Team Charlie", "Team Delta",
    "Team Echo",  "Team Foxtrot", "Team Golf",    "Team Hotel",
    "Team India", "Takeda"   // example extra slice
  ],
  rotationTime: 6000
};

window.addEventListener("load", () => {
  game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent: "game-container",
    width: 950,
    height: 800,
    backgroundColor: 0x222222,
    scene: [PlayGame]
  });
});

class PlayGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }

  create() {
    // Canvas dimensions
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const cx = w / 2;
    const cy = h / 2 + 50;  // small offset for title area

    // Draw title at very top
    this.add
      .text(cx, 20,
        "Welcome to OpsMeeting\nLet's spin the wheel",
        { font: "bold 28px Arial", color: "#ffffff", align: "center" }
      )
      .setOrigin(0.5, 0);

    // Wheel parameters
    const sliceCount = gameOptions.sliceTeams.length;
    const sliceAngle = 360 / sliceCount;
    const radius     = Math.min(w, h - 200) * 0.4;

    // Container that will rotate
    this.wheelContainer = this.add.container(cx, cy);
    const g = this.add.graphics();
    this.wheelContainer.add(g);

    // Colors (wrap if fewer than sliceCount)
    const colors = [
      0xe74c3c, 0xf1c40f, 0x2ecc71, 0x3498db,
      0x9b59b6, 0xe67e22, 0x1abc9c, 0x34495e,
      0xfd79a8
    ];

    // Draw slices + labels
    for (let i = 0; i < sliceCount; i++) {
      // Draw wedge
      g.fillStyle(colors[i % colors.length], 1);
      g.slice(
        0, 0, radius,
        Phaser.Math.DegToRad(sliceAngle * i),
        Phaser.Math.DegToRad(sliceAngle * (i + 1)),
        false
      );
      g.fillPath();

      // Compute mid‐angle in radians
      const midRad = Phaser.Math.DegToRad(sliceAngle * (i + 0.5));
      // Position the label at 45% radius
      const labelRadius = radius * 0.45;
      const tx = labelRadius * Math.cos(midRad);
      const ty = labelRadius * Math.sin(midRad);

      // Add text, rotated so its baseline follows the slice
      this.wheelContainer.add(
        this.add.text(tx, ty, gameOptions.sliceTeams[i], {
          font: "bold 18px Arial",
          color: "#ffffff"
        })
        .setOrigin(0.5)
        .setRotation(midRad)  // align with slice
      );
    }

    // Fixed pointer at top
    const pointer = this.add.graphics({ x: cx, y: cy - radius - 20 });
    pointer.fillStyle(0xffffff, 1);
    pointer.beginPath();
    pointer.moveTo(0, 0);
    pointer.lineTo(-15, -30);
    pointer.lineTo(15, -30);
    pointer.closePath();
    pointer.fillPath();

    // Compute where to place the "Winner:" text between wheel bottom & button
    const wheelBottom = cy + radius;
    const btn = document.getElementById("spin-btn");
    const btnHeight = btn.clientHeight;
    const btnBottom = parseInt(getComputedStyle(btn).bottom, 10);
    const buttonTop = h - btnBottom - btnHeight;
    const resultY   = wheelBottom + 40 ;

    // Result text (fixed)
    this.resultText = this.add.text(
      cx, resultY, "",
      { font: "bold 32px Arial", color: "#ffffff" }
    ).setOrigin(0.5);

    // Hook up the HTML button
    this.canSpin = true;
    btn.disabled = false;
    btn.onclick = () => {
      if (!this.canSpin) return;
      this.spinWheel();
      btn.disabled = true;
    };
  }

  spinWheel() {
    this.canSpin = false;
    this.resultText.setText("");

    const sliceCount = gameOptions.sliceTeams.length;
    const sliceAngle = 360 / sliceCount;
    const rounds     = Phaser.Math.Between(4, 6);
    const degrees    = Phaser.Math.Between(0, 360);

    this.tweens.add({
      targets: this.wheelContainer,
      angle: 360 * rounds + degrees,
      duration: gameOptions.rotationTime,
      ease: "Cubic.easeOut",
      onComplete: () => {
        // find which slice lands at the fixed 270°
        const finalDeg     = (degrees % 360 + 360) % 360;
        const pointerAngle = (270 - finalDeg + 360) % 360;
        const winnerIdx    = Math.floor(pointerAngle / sliceAngle);

        this.resultText.setText(
          "Winner: " + gameOptions.sliceTeams[winnerIdx]
        );
      }
    });
  }
}

