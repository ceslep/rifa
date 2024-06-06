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

  if(Grado) generate(Grado)


  wheel.onCurrentIndexChange = e => {
    console.log(e);
    const item = document.querySelector(".item")
    item.textContent = wheel.items[wheel._currentIndex].label;
  }
  wheel.onRest = e => console.log(e);
  wheel.onSpin = e => console.log(e);

  const button = document.getElementById("spin");
  const buttoninit = document.getElementById("spininit");
  buttoninit.addEventListener("click",e=>{
    console.log("...")
    window.location.href=`./?grado=${dropdowng.value}`;
  });
  button.addEventListener('click', e => {
    generate(dropdowng.value)
    let signo = (Math.floor(0.5 - Math.random()));
    signo = signo < 0 ? signo : 1;
    console.log(signo)
    wheel.spin(signo * (Math.floor(5000 * Math.random()) + Math.floor(10000 * Math.random())));
    /*  const index=wheel.items.findIndex((value) => {
      return value.label.includes('SARA MANUELA')
    }); 
    console.log(index);
    wheel.spinToItem(index) */
  })

 
  // Save object globally for easy debugging.
  window.wheel = wheel;


}