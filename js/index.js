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

  // Grupos ya rifados guardados en localStorage (no se vuelven a mostrar).
  const RIFADOS_KEY = 'gruposRifados';
  const getRifados = () => {
    try { return JSON.parse(localStorage.getItem(RIFADOS_KEY)) || []; }
    catch { return []; }
  };
  const addRifado = (g) => {
    const r = getRifados();
    if (!r.includes(g)) { r.push(g); localStorage.setItem(RIFADOS_KEY, JSON.stringify(r)); }
  };

  const rellenarSelect = () => {
    const rifados = getRifados();
    dropdowng.innerHTML = '';
    dropdowng.append(document.createElement('option')); // opción vacía
    for (const g of grados) {
      if (g == '') continue;
      if (rifados.includes(g)) continue; // ya rifado: ocultar
      const opt = document.createElement('option');
      opt.textContent = g;
      dropdowng.append(opt);
    }
  };
  rellenarSelect();

  if (Grado) dropdowng.value = Grado;

  let interval;

  // Estilos de animación del ganador (inyectados una sola vez en <head>).
  if (!document.getElementById('ganador-anim-style')) {
    const st = document.createElement('style');
    st.id = 'ganador-anim-style';
    st.textContent = `
      @keyframes ganadorBrillo {
        0%, 100% { color:#d4af37; text-shadow:0 0 8px rgba(212,175,55,0.6); }
        50% { color:#ff5e00; text-shadow:0 0 24px rgba(255,94,0,0.9); }
      }
      @keyframes ganadorFlota {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(-12px); }
      }
      .ganador-img { animation: ganadorFlota 2s ease-in-out infinite; }

      /* 5 animaciones de entrada aleatorias */
      @keyframes animPop {
        0% { transform: scale(0.3); opacity: 0; }
        60% { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes animSlide {
        0% { transform: translateX(-120%); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes animFlip {
        0% { transform: rotateY(90deg); opacity: 0; }
        100% { transform: rotateY(0); opacity: 1; }
      }
      @keyframes animShake {
        0% { transform: translateX(0); opacity:0; }
        10% { opacity:1; }
        20% { transform: translateX(-15px); }
        40% { transform: translateX(15px); }
        60% { transform: translateX(-10px); }
        80% { transform: translateX(10px); }
        100% { transform: translateX(0); }
      }
      @keyframes animBounce {
        0% { transform: translateY(-150%); opacity:0; }
        60% { transform: translateY(20px); opacity:1; }
        80% { transform: translateY(-10px); }
        100% { transform: translateY(0); }
      }
      .ganador-nombre { animation-fill-mode: both; }
      .anim-1 { animation: animPop .8s cubic-bezier(.18,.89,.32,1.28) both, ganadorBrillo 1.6s ease-in-out .8s infinite; }
      .anim-2 { animation: animSlide .7s ease-out both, ganadorBrillo 1.6s ease-in-out .7s infinite; }
      .anim-3 { animation: animFlip .8s ease-out both, ganadorBrillo 1.6s ease-in-out .8s infinite; }
      .anim-4 { animation: animShake .9s ease-in-out both, ganadorBrillo 1.6s ease-in-out .9s infinite; }
      .anim-5 { animation: animBounce 1s cubic-bezier(.28,.84,.42,1) both, ganadorBrillo 1.6s ease-in-out 1s infinite; }
    `;
    document.head.appendChild(st);
  }

  // Audio de aplausos: precargado y reutilizado.
  const aplauso = new Audio('./aplauso.mp3');
  aplauso.preload = 'auto';
  aplauso.volume = 1;
  aplauso.load();

  // Desbloqueo de audio: reproducir en silencio desde el primer gesto.
  // Un elemento ya reproduciéndose nunca dispara NotAllowedError al desmutear.
  let audioDesbloqueado = false;
  const desbloquearAudio = () => {
    if (audioDesbloqueado) return;
    aplauso.muted = true;
    aplauso.loop = true;
    aplauso.play().then(() => {
      audioDesbloqueado = true;
    }).catch(() => {});
  };
  document.addEventListener('pointerdown', desbloquearAudio);
  document.addEventListener('keydown', desbloquearAudio);

  // Reproduce aplausos audibles desde el inicio (audio ya activo).
  const sonarAplauso = () => {
    aplauso.loop = false;
    aplauso.muted = false;
    aplauso.currentTime = 0;
    aplauso.play().catch(err => console.warn('No se pudo reproducir audio:', err));
  };

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
    // Spin en la misma página para conservar el gesto del usuario (audio).
    desbloquearAudio();
    button.click();
  });
  button.addEventListener('click', e => {
    const grado = dropdowng.value;
    // Desbloquea el audio dentro del gesto del usuario (política de autoplay).
    desbloquearAudio();
    generate(grado); // sin grado: gira con todos los datos
    let signo = (Math.floor(0.5 - Math.random()));
    signo = signo < 0 ? signo : 1;
    wheel.spin(signo * (Math.floor(5000 * Math.random()) + Math.floor(10000 * Math.random())));
    wheel.onRest = async e => {
     document.getElementById("canvas").style.display='';
     setTimeout(()=>{
      document.getElementById("canvas").style.display='none'
     },13000)
     sonarAplauso();
     const animRnd = Math.floor(Math.random() * 5) + 1; // 1..5 aleatorio
await Swal.fire({
       title:"Ganador",
       width:'90%',
       background:'#111',
       color:'#fff',
       html:`<div style='display:flex;align-items:center;justify-content:center;gap:1.5rem;flex-wrap:wrap;'>
         <h1 class='ganador-nombre anim-${animRnd}' style='font-size:5rem;margin:0;flex:1;min-width:300px;line-height:1.1;color:#fff;'>${wheel.items[e.currentIndex]._label}</h1>
         <img class='ganador-img' src='@public/au6h6r.gif' alt='Ganador' style='width:200px;height:auto;flex-shrink:0;'/>
       </div>`
      })
     // Marca el grupo como rifado y lo quita del select.
     if (grado) {
       addRifado(grado);
       rellenarSelect();
     }
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