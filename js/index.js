import { Wheel } from '../dist/spin-wheel-esm.js';
import { loadFonts } from '../dist/util.js';
import { props } from './props.js';
import { egrados } from "./egrados.js";

let Grado;

window.onload = async () => {
  await loadFonts(props.map(i => i.itemLabelFont));
  const urlParams = new URLSearchParams(window.location.search);
  Grado=urlParams.get('grado');
  console.log(Grado)
  init();
};

function init() {

  console.log(props);

  const sgrados = props.filter(p => p.name == 'Students').map(e => e.items)[0].map(e => {
    const s = e.label;
    return s.substring(s.indexOf('-') + 1, s.length)
  })
  let grados = new Set([...sgrados]);
  grados = ['', ...grados];
  const wheel = new Wheel(document.querySelector('.wheel-wrapper'));

  const dropdown = document.querySelector('.select1');
  const dropdowng = document.querySelector('.select2');
  // Initalise dropdown with the names of each example:
  for (const p of props) {
    const opt = document.createElement('option');
    opt.textContent = p.name;
    dropdown.append(opt);
  }

  for (const g of grados) {
    const opt = document.createElement('option');
    opt.textContent = g;
    dropdowng.append(opt);
  }

  if (Grado) dropdowng.value=Grado;
  // Handle dropdown change:
  dropdown.onchange = () => {
    wheel.init({
      ...props[dropdown.selectedIndex],
      rotation: wheel.rotation, // Preserve value.
    });
  };

  let interval;

  // Select default:
  dropdown.options[0].selected = 'selected';
  dropdown.onchange();
  



  const generate = (value) => {
    console.log(value)
    if (interval) clearInterval(interval);
    //const value=e.target.value;
    props[0].items = [...egrados];

    const props2 = [...props];
    props2[0].items = props[0].items.filter(g => g.label.includes(`-${value}`)).sort((a, b) => 0.5 - Math.random()).map(p => {
      const name = p.label;
      const sname = name.substring(0, name.indexOf('-'))
      return {
        label: sname
      }
    });
    wheel.init({
      ...props2[0],
      rotation: wheel.rotation, // Preserve value.
    });
    interval = setInterval(() => {
      const item = document.querySelector(".item")
      item.textContent = wheel.items[wheel._currentIndex].label;
    }, 100)
  }
  dropdowng.onchange = (e) => {
   // generate(dropdowng.value)
    buttoninit.click();
  };

 

  wheel.onCurrentIndexChange = e => {
    console.log(e);
    const item = document.querySelector(".item")
    item.textContent = wheel.items[wheel._currentIndex].label;
  }
  wheel.onRest = e => console.log(e);
  wheel.onSpin = e => console.log(e);

  wheel.onchange=e=>console.log(e)

  const button = document.getElementById("spin");
  const buttoninit = document.getElementById("spininit");
  buttoninit.addEventListener("click",e=>{
    console.log("...")
    window.location.href=`./?grado=${dropdowng.value}`;
  });
  button.addEventListener('click', e => {
    generate(dropdowng.value);
    let signo = (Math.floor(0.5 - Math.random()));
    signo = signo < 0 ? signo : 1;
    console.log(signo)
    wheel.spin(signo * (Math.floor(5000 * Math.random()) + Math.floor(10000 * Math.random())));
    wheel.onRest = async e => {
      console.log(e)
     console.log(wheel.items[e.currentIndex]._label)
     document.getElementById("canvas").style.display='';
     setTimeout(()=>{
      document.getElementById("canvas").style.display='none'
     },13000)
     await Swal.fire({
      title:"Ganador",
      html:`<h1 style='font-size:3rem;'>${wheel.items[e.currentIndex]._label}</h1>`
     })
    };
    wheel.onSpin = e => console.log(e);
  
    wheel.onchange=e=>console.log(e)
    /*  const index=wheel.items.findIndex((value) => {
      return value.label.includes('SARA MANUELA')
    }); 
    console.log(index);
    wheel.spinToItem(index) */
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