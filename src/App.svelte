<script>
  import { onMount, onDestroy } from 'svelte';
  import { Wheel } from './wheel.js';
  import { loadFonts } from './util.js';
  import { props } from './lib/props.js';
  import { egrados as initialEgrados } from './lib/egrados.js';
  import { createConfetti } from './lib/Confetti.js';
  import Settings from './lib/Settings.svelte';
  import Swal from 'sweetalert2';

  let wheel;
  let wheelContainer;
  let canvas;
  let confetti;
  let selectedGrado = '';
  let currentItemLabel = '';
  let interval;
  let showCanvas = false;
  let showSettings = false;

  const currentYear = new Date().getFullYear();

  const RIFADOS_KEY = 'gruposRifados';
  const DATA_KEY = 'egradosData';
  
  let rifados = [];
  let currentEgrados = [];

  // Audio
  let aplauso;
  let audioDesbloqueado = false;

  const loadInitialData = () => {
    // Cargar rifados
    try {
      rifados = JSON.parse(localStorage.getItem(RIFADOS_KEY)) || [];
    } catch {
      rifados = [];
    }

    // Cargar datos de estudiantes
    try {
      const savedData = localStorage.getItem(DATA_KEY);
      if (savedData) {
        currentEgrados = JSON.parse(savedData);
      } else {
        currentEgrados = initialEgrados;
        localStorage.setItem(DATA_KEY, JSON.stringify(initialEgrados));
      }
    } catch {
      currentEgrados = initialEgrados;
    }
  };

  const addRifado = (g) => {
    if (g && !rifados.includes(g)) {
      rifados = [...rifados, g];
      localStorage.setItem(RIFADOS_KEY, JSON.stringify(rifados));
    }
  };

  $: sgrados = currentEgrados.map(e => {
    const s = e.label;
    const lastDash = s.lastIndexOf('-');
    return lastDash !== -1 ? s.substring(lastDash + 1) : '';
  }).filter(g => g !== '');
  
  $: todosLosGrados = [...new Set(sgrados)];
  $: availableGrados = todosLosGrados.filter(g => !rifados.includes(g));

  onMount(async () => {
    loadInitialData();

    await loadFonts(props.map(i => i.itemLabelFont));

    const urlParams = new URLSearchParams(window.location.search);
    const gradoFromUrl = urlParams.get('grado');
    if (gradoFromUrl) selectedGrado = gradoFromUrl;

    wheel = new Wheel(wheelContainer);
    wheel.init({
      ...props[0],
      rotation: wheel.rotation,
    });

    wheel.onCurrentIndexChange = e => {
      const current = wheel.items[wheel._currentIndex];
      if (current) currentItemLabel = current.label;
    };

    confetti = createConfetti(canvas);

    aplauso = new Audio('aplauso.mp3');
    aplauso.preload = 'auto';
    aplauso.volume = 1;
    aplauso.load();

    if (selectedGrado) {
      handleGenerate(selectedGrado);
      handleSpin();
    }
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
    if (confetti) confetti.destroy();
  });

  const desbloquearAudio = () => {
    if (audioDesbloqueado) return;
    aplauso.muted = true;
    aplauso.loop = true;
    aplauso.play().then(() => {
      audioDesbloqueado = true;
    }).catch(() => {});
  };

  const sonarAplauso = () => {
    if (aplauso) {
      aplauso.loop = false;
      aplauso.muted = false;
      aplauso.currentTime = 0;
      aplauso.play().catch(err => console.warn('No se pudo reproducir audio:', err));
    }
  };

  function handleGenerate(value) {
    if (interval) clearInterval(interval);

    const source = value
      ? currentEgrados.filter(g => g.label.slice(g.label.lastIndexOf('-') + 1) === value)
      : currentEgrados;

    const items = source
      .slice()
      .sort(() => 0.5 - Math.random())
      .map(p => ({ label: p.label.substring(0, p.label.indexOf('-')) }));

    wheel.init({
      ...props[0],
      items,
      rotation: wheel.rotation,
    });

    interval = setInterval(() => {
      const current = wheel.items[wheel._currentIndex];
      if (current) currentItemLabel = current.label;
    }, 100);
  }

  function handleSpin() {
    desbloquearAudio();
    handleGenerate(selectedGrado);

    let signo = (Math.floor(0.5 - Math.random()));
    signo = signo < 0 ? signo : 1;
    wheel.spin(signo * (Math.floor(5000 * Math.random()) + Math.floor(10000 * Math.random())));

    wheel.onRest = async e => {
      showCanvas = true;
      confetti.start();
      setTimeout(() => {
        showCanvas = false;
        confetti.stop();
      }, 13000);

      sonarAplauso();

      const animRnd = Math.floor(Math.random() * 5) + 1;
      await Swal.fire({
        title: "Ganador",
        width: '90%',
        html: `<div style='display:flex;align-items:center;justify-content:center;gap:1.5rem;flex-wrap:wrap;'>
          <h1 class='ganador-nombre anim-${animRnd}' style='font-size:5rem;margin:0;flex:1;min-width:300px;line-height:1.1;'>${wheel.items[e.currentIndex]._label}</h1>
          <img class='ganador-img' src='ganador-sin-fondo.png' alt='Ganador' style='width:200px;height:auto;flex-shrink:0;'/>
        </div>`
      });

      // Detener audio al cerrar el modal (OK o clic fuera)
      if (aplauso) {
        aplauso.pause();
        aplauso.currentTime = 0;
      }

      if (selectedGrado) {
        addRifado(selectedGrado);
        selectedGrado = ''; // Reset select
      }
    };
  }

  function handleInit() {
    desbloquearAudio();
    handleSpin();
  }

  function handleSaveData(event) {
    currentEgrados = event.detail.newData;
    localStorage.setItem(DATA_KEY, JSON.stringify(currentEgrados));
    handleGenerate(selectedGrado);
  }

  function handleResetRifados() {
    rifados = [];
    localStorage.removeItem(RIFADOS_KEY);
  }

</script>

<svelte:window on:pointerdown={desbloquearAudio} on:keydown={desbloquearAudio} />

{#if showSettings}
  <Settings 
    rifados={rifados} 
    currentData={currentEgrados}
    on:close={() => showSettings = false}
    on:save={handleSaveData}
    on:clearRifados={handleResetRifados}
    on:updateRifados={(e) => rifados = e.detail.newRifados}
  />
{/if}

<canvas
  bind:this={canvas}
  id="canvas"
  style="display: {showCanvas ? 'block' : 'none'}; position: absolute; z-index: 4000; pointer-events: none;"
></canvas>

<header class="topbar">
  <p class="kicker">Día de la Familia Instituto Guática</p>
  <div class="title-container">
    <img src="eie.png" alt="Logo Institucional" class="header-logo" />
    <h1>Gran Rifa <em>{currentYear}</em></h1>
  </div>
  <button class="settings-trigger" on:click={() => showSettings = true} aria-label="Configuración">⚙️</button>
</header>

<div class="gui-wrapper">
  <div class="dgrid">
    <div>
      <label for="grado-select">Grado</label>
      <select id="grado-select" bind:value={selectedGrado} on:change={() => handleInit()}>
        <option value=""></option>
        {#each availableGrados as grado}
          <option value={grado}>{grado}</option>
        {/each}
      </select>
    </div>
    <span class="item">{currentItemLabel}</span>
    <button id="spininit" on:click={handleInit}>Init</button>
    <button id="spin" on:click={handleSpin}>Girar</button>
  </div>
</div>

<div class="wheel-wrapper" bind:this={wheelContainer}></div>

<video class="corner-video" src="mp4.mp4" autoplay loop muted playsinline></video>

<style>
  .settings-trigger {
    position: absolute;
    right: 20px;
    top: 20px;
    background: rgba(254, 249, 195, 0.1);
    border: 1px solid rgba(234, 179, 8, 0.3);
    color: var(--gold);
    font-size: 1.5rem;
    padding: 8px;
    line-height: 1;
    border-radius: 50%;
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s;
  }
  .settings-trigger:hover {
    background: rgba(254, 249, 195, 0.2);
  }
</style>
