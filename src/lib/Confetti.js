export function createConfetti(canvas) {
  const context = canvas.getContext("2d");
  let W = window.innerWidth;
  let H = window.innerHeight;
  const maxConfettis = 150;
  const particles = [];

  const possibleColors = [
    "DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue",
    "LightBlue", "Gold", "Violet", "PaleGreen", "SteelBlue",
    "SandyBrown", "Chocolate", "Crimson"
  ];

  function randomFromTo(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
  }

  function ConfettiParticle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H - H;
    this.r = randomFromTo(11, 33);
    this.d = Math.random() * maxConfettis + 11;
    this.color = possibleColors[Math.floor(Math.random() * possibleColors.length)];
    this.tilt = Math.floor(Math.random() * 33) - 11;
    this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
    this.tiltAngle = 0;

    this.draw = function() {
      context.beginPath();
      context.lineWidth = this.r / 2;
      context.strokeStyle = this.color;
      context.moveTo(this.x + this.tilt + this.r / 3, this.y);
      context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
      return context.stroke();
    };
  }

  for (let i = 0; i < maxConfettis; i++) {
    particles.push(new ConfettiParticle());
  }

  let animationId;

  function Draw() {
    animationId = requestAnimationFrame(Draw);
    context.clearRect(0, 0, W, H);

    for (let i = 0; i < maxConfettis; i++) {
      particles[i].draw();
    }

    for (let i = 0; i < maxConfettis; i++) {
      let particle = particles[i];
      particle.tiltAngle += particle.tiltAngleIncremental;
      particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
      particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;

      if (particle.x > W + 30 || particle.x < -30 || particle.y > H) {
        particle.x = Math.random() * W;
        particle.y = -30;
        particle.tilt = Math.floor(Math.random() * 10) - 20;
      }
    }
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  }

  window.addEventListener("resize", resize);
  resize();

  return {
    start: () => {
      if (!animationId) Draw();
    },
    stop: () => {
      cancelAnimationFrame(animationId);
      animationId = null;
      context.clearRect(0, 0, W, H);
    },
    destroy: () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    }
  };
}
