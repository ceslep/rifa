import { Wheel } from '../dist/spin-wheel-esm.js';
import { loadFonts } from '../dist/util.js';
import { props } from './props.js';
import { egrados } from "./egrados.js";

let Grado;

window.onload = async () => {
  await loadFonts(props.map(i => i.itemLabelFont));
  const urlParams = new URLSearchParams(window.location.search);
  Grado=urlParams.get('grado');
  init();
};

function init() {

  const sgrados = props.filter(p => p.name == 'Students').map(e => e.items)[0].map(e => {
    const s = e.label;
    return s.substring(s.indexOf('-') + 1, s.length)
  })
  let grados = new Set([...sgrados]);
  grados = ['', ...grados];
  const wheel = new Wheel(document.querySelector('.wheel-wrapper'));

  const dropdowng = document.querySelector('.select2');

  dropdowng.append(document.createElement('option'));

  for (const g of grados) {
    if (g == '') continue;
    const opt = document.createElement('option');
    opt.textContent = g;
    dropdowng.append(opt);
  }

  if (Grado) dropdowng.value = Grado;

  let interval;

  // Audio de aplausos: precargado y reutilizado.
  const aplauso = new Audio('aplauso.mp3');
  aplauso.preload = 'auto';

  // Initialise wheel with the Students props:
  wheel.init({
    ...props[0],
    rotation: wheel.rotation, // Preserve value.
  });

  const generate = (value) => {
    if (interval) clearInterval(interval);

    // Sin grado: gira con todos. Con grado: solo ese grado.
    const source = value
      ? egrados.filter(g => g.label.slice(g.label.lastIndexOf('-') + 1) === value)
      : egrados;
    const items = source
      .slice()
      .sort(() => 0.5 - Math.random())
      .map(p => ({ label: p.label.substring(0, p.label.indexOf('-')) }));

    wheel.init({
      ...props[0],
      items,
      rotation: wheel.rotation, // Preserve value.
    });
    interval = setInterval(() => {
      const current = wheel.items[wheel._currentIndex];
      if (!current) return;
      document.querySelector(".item").textContent = current.label;
    }, 100)
  }
  dropdowng.onchange = (e) => {
    buttoninit.click();
  };

  wheel.onCurrentIndexChange = e => {
    const current = wheel.items[wheel._currentIndex];
    if (!current) return;
    document.querySelector(".item").textContent = current.label;
  }

  const button = document.getElementById("spin");
  const buttoninit = document.getElementById("spininit");
  buttoninit.addEventListener("click", e => {
    window.location.href = `./?grado=${dropdowng.value}`;
  });
  button.addEventListener('click', e => {
    const grado = dropdowng.value;
    // Desbloquea el audio dentro del gesto del usuario (política de autoplay).
    aplauso.play().then(() => { aplauso.pause(); aplauso.currentTime = 0; }).catch(() => {});
    generate(grado); // sin grado: gira con todos los datos
    let signo = (Math.floor(0.5 - Math.random()));
    signo = signo < 0 ? signo : 1;
    wheel.spin(signo * (Math.floor(5000 * Math.random()) + Math.floor(10000 * Math.random())));
    wheel.onRest = async e => {
     document.getElementById("canvas").style.display='';
     setTimeout(()=>{
      document.getElementById("canvas").style.display='none'
     },13000)
     aplauso.currentTime = 0;
     aplauso.play().catch(err => console.warn('No se pudo reproducir audio:', err));
     await Swal.fire({
      title:"Ganador",
      html:`<h1 style='font-size:3rem;'>${wheel.items[e.currentIndex]._label}</h1>`
     })
    };
  })

  if(Grado) {
    generate(Grado);
    button.click();
  }

  // Save object globally for easy debugging.
  window.wheel = wheel;


}


let W = window.innerWidth;
let H = window.innerHeight;
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const maxConfettis = 150;
const particles = [];

const possibleColors = [
  "DodgerBlue",
  "OliveDrab",
  "Gold",
  "Pink",
  "SlateBlue",
  "LightBlue",
  "Gold",
  "Violet",
  "PaleGreen",
  "SteelBlue",
  "SandyBrown",
  "Chocolate",
  "Crimson"
];

function randomFromTo(from, to) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}

function confettiParticle() {
  this.x = Math.random() * W; // x
  this.y = Math.random() * H - H; // y
  this.r = randomFromTo(11, 33); // radius
  this.d = Math.random() * maxConfettis + 11;
  this.color =
    possibleColors[Math.floor(Math.random() * possibleColors.length)];
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

function Draw() {
  const results = [];

  // Magical recursive functional love
  requestAnimationFrame(Draw);

  context.clearRect(0, 0, W, window.innerHeight);

  for (var i = 0; i < maxConfettis; i++) {
    results.push(particles[i].draw());
  }

  let particle = {};
  let remainingFlakes = 0;
  for (var i = 0; i < maxConfettis; i++) {
    particle = particles[i];

    particle.tiltAngle += particle.tiltAngleIncremental;
    particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
    particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;

    if (particle.y <= H) remainingFlakes++;

    // If a confetti has fluttered out of view,
    // bring it back to above the viewport and let if re-fall.
    if (particle.x > W + 30 || particle.x < -30 || particle.y > H) {
      particle.x = Math.random() * W;
      particle.y = -30;
      particle.tilt = Math.floor(Math.random() * 10) - 20;
    }
  }

  return results;
}

window.addEventListener(
  "resize",
  function() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  },
  false
);

// Push new confetti objects to `particles[]`
for (var i = 0; i < maxConfettis; i++) {
  particles.push(new confettiParticle());
}

// Initialize
canvas.width = W;
canvas.height = H;
Draw();